from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class SensorTile(sw.Tile):
    
    def __init__(self, io):
        
        # create the widgets 
        index_select = v.Select(label=cm.input_lbl.index, items=cp.index, v_model=io.index)
        sensors_select = v.Select(label=cm.input_lbl.sensor, items=[*cp.sensors], v_model =io.sensors, multiple=True, chips=True)
        landsat_7_switch = v.Switch(label=cm.input_lbl.do_threshold, v_model =io.improve_L7)
        landsat_7_slider = v.Slider(class_='mt-5', label=cm.input_lbl.threshold, min=0, max=.3, step=.001, v_model=io.improve_threshold, thumb_label='always')
        cloud_buffer = v.Slider(class_='mt-5', label=cm.input_lbl.cloud_buffer, min=0, max =2500, step=10, v_model=io.cloud_buffer, thumb_label='always')
        
        # bind them to io 
        output = sw.Alert() \
            .bind(index_select, io, 'index', verbose=False) \
            .bind(sensors_select, io, 'sensors', verbose=False) \
            .bind(landsat_7_switch, io, 'improve_L7', verbose=False) \
            .bind(landsat_7_slider, io, 'improve_threshold', verbose=False) \
            .bind(cloud_buffer, io, 'cloud_buffer', verbose=False)
        
        super().__init__(
            'nested_widget',
            cm.tile.sensor,
            inputs = [index_select, sensors_select, landsat_7_switch, landsat_7_slider, cloud_buffer],
            output = output
        )
        
        