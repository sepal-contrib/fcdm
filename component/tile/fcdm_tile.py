from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class FcdmTile(sw.Tile):
    
    def __init__(self, io):
        
        #create inputs
        radius_title = v.Html(tag='h4', class_='mt-5', children=[cm.input_lbl.self_ref])
        radius = v.Slider(label=cm.input_lbl.kernel_radius, max=cp.max_kernel_radius, v_model = None, thumb_label = True)
        ddr_title = v.Html(tag='h4', children=[cm.input_lbl.ddr])
        threshold = v.Slider(label=cm.input_lbl.filter_threshold, v_model = None, thumb_label = True)
        filtering_radius = v.Slider(label=cm.input_lbl.filter_radius, min=cp.min_radius_filtering_kernel, max=cp.max_radius_filtering_kernel, v_model = None, thumb_label = True)
        cleaning = v.Slider(label=cm.input_lbl.disturbance_event, max=cp.max_disturbing_event_per_kernel, v_model = None, thumb_label = True)
        
        # bind to the io object 
        output = sw.Alert() \
            .bind(radius, io, 'kernel_radius') \
            .bind(threshold, io, 'filter_threshod') \
            .bind(filtering_radius, io, 'filter_radius') \
            .bind(cleaning, io, 'cleaning_offset')
            
        
        super().__init__(
            'nested_widget',
            cm.tile.fcdm,
            inputs = [radius_title, radius, ddr_title, threshold, filtering_radius, cleaning],
            output = output
        )