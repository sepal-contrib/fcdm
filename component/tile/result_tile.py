from sepal_ui import sepalwidgets as sw
from sepal_ui import mapping as sm
from ipyleaflet import WidgetControl

from component.message import cm
from component import widget as cw
from component.widget.legend_control import LegendControl
from component import parameter as cp


class ResultTile(sw.Tile):
    def __init__(self):
        # create a save widget
        self.save = cw.ExportMap()

        # create the map
        self.m = sm.SepalMap()
        self.m.max_zoom = (
            14  # after this zoom level GEE crash and refuse to display images
        )

        # add a legend to the map
        self.m.legend = LegendControl(
            legend_dict=cp.legend_dict, title="Legend", position="bottomright"
        )
        self.m.add_control(self.m.legend)

        # add the export control
        self.m.add_control(WidgetControl(widget=self.save, position="topleft"))

        # create the tile
        super().__init__("result_tile", cm.tile.result, inputs=[self.m])
