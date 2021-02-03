from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class BasemapTile(sw.Tile):
    
    def __init__(self, io):
        
        # no need to gather the io object as attribute as there are no custom methods
        
        # create the widgets
        forest_map = v.Select(label=cm.input_lbl.forest_map, items=cp.forest_map, v_model = None)
        year = v.Slider(label=cm.input_lbl.forest_map_year, min=cp.forest_map_min_year, max=cp.forest_map_max_year, v_model = None, thumb_label = True)
        tree_cover = v.Slider(label=cm.input_lbl.treecover, v_model = None, thumb_label = True)
        
        # bind the inputs to the io through an alert
        output = sw.Alert() \
            .bind(forest_map, io, 'forest_map') \
            .bind(year, io, 'forest_map_year') \
            .bind(tree_cover, io, 'treecover')
        
        # create the tile
        super().__init__(
            'nested_widget',
            cm.tile.basemap,
            inputs = [forest_map, year, tree_cover],
            output = output
        )