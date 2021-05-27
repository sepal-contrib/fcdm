from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class BasemapTile(sw.Tile):
    
    def __init__(self, io):
        
        # no need to gather the io object as attribute as there are no custom methods
        
        # create the widgets
        forest_map = v.Select(label=cm.input_lbl.forest_map, items=cp.forest_map, v_model=io.forest_map)
        year = v.Slider(class_='mt-5', label=cm.input_lbl.forest_map_year, min=cp.forest_map_min_year, max=cp.forest_map_max_year, v_model=None, thumb_label='always')
        tree_cover = v.Slider(class_='mt-5', label=cm.input_lbl.treecover, v_model=io.treecover, thumb_label='always')
        
        # bind the inputs to the io through an alert
        output = sw.Alert() \
            .bind(forest_map, io, 'forest_map', verbose=False) \
            .bind(year, io, 'forest_map_year', verbose=False) \
            .bind(tree_cover, io, 'treecover', verbose=False)
        
        # create the tile
        super().__init__(
            'nested_widget',
            cm.tile.basemap,
            inputs = [forest_map, year, tree_cover],
            output = output
        )