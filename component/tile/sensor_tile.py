from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class SensorTile(sw.Tile):
    
    def __init__(self, model):
        
        # create the widgets 
        sensors_select = v.Select(label=cm.input_lbl.sensor, items=[*cp.sensors], v_model =model.sensors, multiple=True, chips=True)
        landsat_7_switch = v.Switch(label=cm.input_lbl.do_threshold, v_model =model.improve_L7)
        landsat_7_slider = v.Slider(class_='mt-5', label=cm.input_lbl.threshold, min=0, max=.3, step=.001, v_model=model.improve_threshold, thumb_label='always')
        cloud_buffer = v.Slider(class_='mt-5', label=cm.input_lbl.cloud_buffer, min=0, max =2500, step=10, v_model=model.cloud_buffer, thumb_label='always')
        
        # bind them to io 
        model \
            .bind(sensors_select, 'sensors',) \
            .bind(landsat_7_switch, 'improve_L7',) \
            .bind(landsat_7_slider, 'improve_threshold',) \
            .bind(cloud_buffer, 'cloud_buffer',)
        
        super().__init__(
            'nested_widget',
            cm.tile.sensor,
            inputs = [sensors_select, landsat_7_switch, landsat_7_slider, cloud_buffer]
        )
        
        