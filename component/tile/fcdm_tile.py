from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class FcdmTile(sw.Tile):
    
    def __init__(self, model):
        
        # create inputs
        radius_title = v.Html(tag='h4', class_='mt-5', children=[cm.input_lbl.self_ref])
        radius = v.Slider(class_='mt-5', label=cm.input_lbl.kernel_radius, max=cp.max_kernel_radius, step=10, v_model=model.kernel_radius, thumb_label='always')
        ddr_title = v.Html(tag='h4', children=[cm.input_lbl.ddr])
        threshold = v.Slider(class_='mt-5', label=cm.input_lbl.filter_threshold, v_model=model.filter_threshod, step=.001, max=.1, thumb_label='always')
        filtering_radius = v.Slider(class_='mt-5', label=cm.input_lbl.filter_radius, min=cp.min_radius_filtering_kernel, max=cp.max_radius_filtering_kernel, v_model=model.filter_radius, step=10, thumb_label='always')
        cleaning = v.Slider(class_='mt-5', label=cm.input_lbl.disturbance_event, max=cp.max_disturbing_event_per_kernel, v_model=model.cleaning_offset, thumb_label='always')
        
        # bind to the io object 
        model \
            .bind(radius, 'kernel_radius') \
            .bind(threshold, 'filter_threshod') \
            .bind(filtering_radius, 'filter_radius') \
            .bind(cleaning, 'cleaning_offset')
            
        
        super().__init__(
            'nested_widget',
            cm.tile.fcdm,
            inputs = [radius_title, radius, ddr_title, threshold, filtering_radius, cleaning]
        )