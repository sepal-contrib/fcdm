from datetime import datetime as dt
from pathlib import Path

import ipyvuetify as v
from sepal_ui import sepalwidgets as sw
from sepal_ui.scripts import utils as su
from sepal_ui.scripts import gee
import ee
from traitlets import Any
from ipywidgets import jslink

from component.message import cm
from component import scripts as cs
from component import parameter as cp

ee.Initialize()


class ExportMap(v.Menu, sw.SepalWidget):
    TICKS_TO_SHOW = [10, 100, 200, 300]

    def __init__(self):
        # init the downloadable informations
        self.geometry = None
        self.names = []
        self.datasets = {}

        # create the useful widgets
        self.w_scale = v.Slider(
            class_="mt-5",
            v_model=30,  # align on the landsat images,
            ticks="always",
            tick_labels=[
                str(i) if i in self.TICKS_TO_SHOW else "" for i in range(10, 301, 10)
            ],
            min=10,
            max=300,
            thumb_label=True,
            step=10,
        )

        self.w_prefix = v.TextField(
            label=cm.export.name,
            small=True,
            dense=True,
            v_model=None,
        )

        self.w_datasets = v.Select(
            dense=True,
            small=True,
            label=cm.export.datasets,
            v_model=None,
            items=[*self.datasets],
            multiple=True,
            chips=True,
        )

        self.w_method = v.RadioGroup(
            v_model="gee",
            row=True,
            children=[
                v.Radio(label=cm.export.radio.sepal, value="sepal"),
                v.Radio(label=cm.export.radio.gee, value="gee"),
            ],
        )

        self.alert = sw.Alert()

        self.btn = sw.Btn(cm.export.apply, small=True)

        export_data = v.Card(
            children=[
                v.CardTitle(children=[v.Html(tag="h4", children=[cm.export.title])]),
                v.CardText(
                    children=[
                        self.w_prefix,
                        self.w_datasets,
                        v.Html(tag="h4", children=[cm.export.scale]),
                        self.w_scale,
                        v.Html(tag="h4", children=[cm.export.radio.label]),
                        self.w_method,
                        self.alert,
                    ]
                ),
                v.CardActions(children=[self.btn]),
            ]
        )

        # the clickable icon
        self.w_down = v.Btn(
            v_on="menu.on",
            color="primary",
            icon=True,
            children=[v.Icon(children=["mdi-cloud-download"])],
        )

        super().__init__(
            value=False,
            close_on_content_click=False,
            nudge_width=200,
            offset_x=True,
            children=[export_data],
            v_slots=[
                {"name": "activator", "variable": "menu", "children": self.w_down}
            ],
        )

        # add js behaviour
        self.btn.on_event("click", self._apply)

    @su.loading_button(debug=False)
    def _apply(self, widget, event, data):
        """download the dataset using the given parameters"""

        folder = Path(ee.data.getAssetRoots()[0]["id"])

        # check if a dataset is existing
        if self.datasets == [] or self.geometry == None:
            return self

        for name in self.w_datasets.v_model:
            description = su.normalize_str(f"{self.w_prefix.v_model}_{name}")

            # set the parameters
            export_params = {
                "image": self.datasets[name],
                "description": description,
                "scale": self.w_scale.v_model,
                "region": self.geometry,
            }

            # launch the task
            if self.w_method.v_model == "gee":
                export_params.update(assetId=str(folder / description))
                task = ee.batch.Export.image.toAsset(**export_params)
                task.start()
                self.alert.add_msg(
                    "the task have been launched in your GEE acount", "success"
                )

            elif self.w_method.v_model == "sepal":
                gdrive = cs.gdrive()

                files = gdrive.get_files(description)
                if files == []:
                    task = ee.batch.Export.image.toDrive(**export_params)
                    task.start()
                    gee.wait_for_completion(description, self.alert)
                    files = gdrive.get_files(description)

                gdrive.download_files(files, cp.result_dir)
                gdrive.delete_files(files)
                self.alert.add_msg("map exported", "success")

        return self

    def set_data(self, datasets):
        self.w_datasets.v_model = None
        self.datasets = datasets
        self.w_datasets.items = [*self.datasets]

        return self

    def set_prefix(self, start_ref, end_ref, start_monitor, end_monitor, aoi_name):
        self.w_prefix.v_model = (
            f"{aoi_name}_{start_ref}-{end_ref}_{start_monitor}-{end_monitor}"
        )

        return self
