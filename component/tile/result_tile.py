from sepal_ui import sepalwidgets as sw 
from sepal_ui import mapping as sm
from ipyleaflet import WidgetControl

from component.message import cm
from component import widget as cw

class ResultTile(sw.Tile):
    
    def __init__(self):
        
        # create a save widget 
        self.save = cw.ExportMap()
        
        # create the map 
        self.m = sm.SepalMap()
        self.m.max_zoom = 12
        self.m.add_control(WidgetControl(widget=self.save, position='topleft'))
        
        # create the tile 
        super().__init__(
            'result_tile',
            cm.tile.result,
            inputs = [self.m]
        )