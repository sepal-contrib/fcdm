from sepal_ui import sepalwidgets as sw 
from sepal_ui import mapping as sm

from component.message import cm

class ResultTile(sw.Tile):
    
    def __init__(self):
        
        # create the map 
        self.m = sm.SepalMap()
        self.m.max_zoom = 12
        
        # create the tile 
        super().__init__(
            'result_tile',
            cm.tile.result,
            inputs = [self.m]
        )