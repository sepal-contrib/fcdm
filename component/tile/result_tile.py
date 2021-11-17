from sepal_ui import sepalwidgets as sw
from sepal_ui import mapping as sm
from ipyleaflet import WidgetControl

from component.message import cm
from component import widget as cw
from component import parameter as cp


class ResultTile(sw.Tile):
    def __init__(self):

        # create a save widget
        self.save = cw.ExportMap()

        # create the map
        self.m = cw.CustomMap()
        self.m.max_zoom = (
            14  # after this zoom level GEE crash and refuse to display images
        )

        # add a legend to the map
        self.m.add_legend(legend_title="Legend", legend_dict=cp.legend_dict)

        # add the export control
        self.m.add_control(WidgetControl(widget=self.save, position="topleft"))

        # create the tile
        super().__init__("result_tile", cm.tile.result, inputs=[self.m])
