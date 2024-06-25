import time
from functools import partial

from sepal_ui import sepalwidgets as sw
from sepal_ui import color as sc
from sepal_ui.scripts import utils as su
import ipyvuetify as v
import ee

from component.message import cm
from component import scripts as cs
from component import parameter as cp


class LaunchTile(sw.Tile):
    def __init__(self, aoi_tile, model, result_tile):
        # gather the model objects
        self.aoi_model = aoi_tile.view.model
        self.model = model
        self.attributes = {"id": "launch_tile"}

        # add the result_tile map to attributes
        self.m = result_tile.m
        self.tile = result_tile

        # create the widgets
        mkd = sw.Markdown(cm.process_txt)

        # create the tile
        super().__init__(
            "compute_widget",
            cm.tile.launch,
            inputs=[mkd],
            btn=sw.Btn(cm.launch_btn, class_="mt-5"),
            alert=sw.Alert(),
        )

        # link the js behaviours
        self.btn.on_event("click", self._launch_fcdm)
        aoi_tile.view.observe(self._update_geometry, "updated")

    def _update_geometry(self, change):
        """update the map widget geometry"""

        self.tile.save.geometry = self.aoi_model.feature_collection.geometry()

        return self

    @su.loading_button()
    def _launch_fcdm(self, widget, event, data):
        # test all the values
        if not self.alert.check_input(self.aoi_model.name, cm.missing_input):
            return
        for k, val in self.model.export_data().items():
            if not (
                "forest_mask" in k
                or self.alert.check_input(val, cm.missing_input.format(k))
            ):
                return

        # read the value
        # make the difference between preselected and assets
        self.model.forest_map = (
            self.model.forest_map["value"]
            if type(self.model.forest_map) == dict
            else self.model.forest_map
        )

        # check the validity of the forest mask
        # cs.check_forest_mask(self.model.forest_map, self.aoi_model.feature_collection)

        # display the aoi
        self.m.addLayer(self.aoi_model.feature_collection, {"color": sc.info}, "aoi")
        self.m.zoom_ee_object(self.aoi_model.feature_collection.geometry())

        # display the forest mask
        self.model.forest_mask, self.model.forest_mask_display = cs.get_forest_mask(
            self.model.forest_map,
            self.model.forest_map_year,
            self.model.treecover,
            self.aoi_model.feature_collection,
        )
        self.m.addLayer(
            self.model.forest_mask_display,
            cp.viz_forest_mask(self.model.forest_map),
            "Forest mask",
        )

        # remove all already existing fcdm layers
        for layer in self.m.layers:
            if not layer.name in ["aoi", "Forest mask", "CartoDB.DarkMatter"]:
                self.m.remove_layer(layer)

        # compute nbr
        analysis_nbr_merge = ee.ImageCollection([])
        reference_nbr_merge = ee.ImageCollection([])
        for sensor in self.model.sensors:
            # analysis period
            # data preparation
            # Calculation of single scenes of Base-NBR
            analysis = cs.get_collection(
                sensor,
                self.model.analysis_start,
                self.model.analysis_end,
                self.model.forest_map,
                self.model.forest_map_year,
                self.model.forest_mask,
                self.model.cloud_buffer,
                self.aoi_model.feature_collection,
            )
            analysis_nbr = analysis.map(partial(cs.compute_nbr, sensor=sensor))

            # analysis period
            # data preparation
            # Calculation of single scenes of Base-NBR
            reference = cs.get_collection(
                sensor,
                self.model.reference_start,
                self.model.reference_end,
                self.model.forest_map,
                self.model.forest_map_year,
                self.model.forest_mask,
                self.model.cloud_buffer,
                self.aoi_model.feature_collection,
            )

            # current landsat 7/8 products are deprecated. It happens after
            # last_date = {
            #     "landsat 4": {"toa": "1993-02-14", "sr": "1993-02-14"},
            #     "landsat 5": {"toa": "2011-05-24", "sr": "2011-05-24"},
            #     "landsat 7": {"toa": "2021-12-30", "sr": "2021-12-30"},
            #     "landsat 8": {"toa": "2021-12-29", "sr": "2021-12-29"},
            #     "sentinel 2": {"toa": "2023-07-10", "sr": "2023-07-10"},
            # }

            # Raise an error if reference and analysis collections are empty
            if not all([reference.size().getInfo(), analysis.size().getInfo()]):
                raise Exception(
                    "Product not available for the selected period. Please use a previous date."
                )

            reference_nbr = reference.map(partial(cs.compute_nbr, sensor=sensor))

            # adjust with kernel
            reference_nbr = reference_nbr.map(
                partial(cs.adjustment_kernel, kernel_size=self.model.kernel_radius)
            )
            analysis_nbr = analysis_nbr.map(
                partial(cs.adjustment_kernel, kernel_size=self.model.kernel_radius)
            )

            analysis_nbr_merge = analysis_nbr_merge.merge(analysis_nbr)
            reference_nbr_merge = reference_nbr_merge.merge(reference_nbr)

        # Capping of self-referenced single Second-NBR scenes at 0 and -1
        # Condensation of all available self-referenced single Second-NBR scenes per investigation period
        analysis_nbr_norm_min = analysis_nbr_merge.map(cs.capping).qualityMosaic("NBR")

        reference_nbr_norm_min = reference_nbr_merge.map(cs.capping).qualityMosaic(
            "NBR"
        )

        # save the differents layer to download
        datasets = {"forest mask": self.model.forest_mask}
        datasets["Reference rNBR"] = reference_nbr_norm_min.select("NBR", "yearday")
        datasets["Analysis rNBR"] = analysis_nbr_norm_min.select("NBR", "yearday")

        # Derive the Delta-NBR result
        nbr_diff = analysis_nbr_norm_min.select("NBR").subtract(
            reference_nbr_norm_min.select("NBR")
        )
        nbr_diff_capped = nbr_diff.select("NBR").where(nbr_diff.select("NBR").lt(0), 0)
        datasets["Delta rNBR without DDR filtering"] = nbr_diff_capped.addBands(
            analysis_nbr_norm_min.select("yearday")
        ).select("NBR", "yearday")

        # apply the DDR filtering
        nbr_diff_ddr = cs.ddr_filter(
            nbr_diff_capped.select("NBR"),
            self.model.filter_threshod,
            self.model.filter_radius,
            self.model.cleaning_offset,
        )
        datasets["Delta rNBR"] = nbr_diff_ddr.addBands(
            analysis_nbr_norm_min.select("yearday")
        ).select("NBR", "yearday")

        # debug purpose. Sasve the datasets to the element model
        self.test_datasets = datasets

        self.m.addLayer(
            nbr_diff_ddr.select("NBR"),
            {"min": [0], "max": [0.3], "palette": "D3D3D3,Ce0f0f"},
            "Delta-rNBR",
        )

        # add the selected datasets to the export control
        self.tile.save.set_data(datasets)
        self.tile.save.set_prefix(
            self.model.reference_start[:4],
            self.model.reference_end[:4],
            self.model.analysis_start[:4],
            self.model.analysis_end[:4],
            self.aoi_model.name,
        )

        # preselect delta-rNBR
        self.tile.save.w_datasets.v_model = ["Delta rNBR"]

        # give feedback to the user
        self.alert.add_live_msg(cm.complete, "success")

        return
