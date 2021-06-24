from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class BasemapTile(sw.Tile):
    
    def __init__(self, model):
        
        # no need to gather the io object as attribute as there are no custom methods
        
        # create the widgets
        self.forest_map = v.Select(label=cm.input_lbl.forest_map, items=cp.forest_map, v_model=model.forest_map)
        self.year = v.Slider(class_='mt-5', label=cm.input_lbl.forest_map_year, min=cp.forest_map_min_year, max=cp.forest_map_max_year, v_model=model.forest_map_year, thumb_label='always')
        self.tree_cover = v.Slider(class_='mt-5', label=cm.input_lbl.treecover, v_model=model.treecover, thumb_label='always')
        
        # bind the inputs to the io through an alert
        model \
            .bind(self.forest_map, 'forest_map') \
            .bind(self.year, 'forest_map_year') \
            .bind(self.tree_cover, 'treecover')
        
        # create the tile
        super().__init__(
            'nested_widget',
            cm.tile.basemap,
            inputs = [self.forest_map, self.year, self.tree_cover]
        )
        
        # js behavior 
        self.forest_map.observe(self._update_status, 'v_model')
        
    def _update_status(self, change):
        """disable the hansen params if no forest mask is selected"""
        
        gfc = change['new'] == 'gfc'
        
        self.year.disabled = not gfc 
        self.tree_cover.disabled = not gfc
        
        return self
            