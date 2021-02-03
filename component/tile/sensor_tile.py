from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component import parameter as cp
from component.message import cm

class SensorTile(sw.Tile):
    
    def __init__(self, io):
        
        # create the widgets 
        index_select = v.Select(label=cm.input_lbl.index, items = cp.index, v_model = None)
        
        sensors_select = v.Select(label=cm.input_lbl.sensor, items = [*cp.sensors], v_model = None, multiple = True, chips = True)
        
        landsat_7_switch = v.Switch(label=cm.input_lbl.do_threshold, v_model =False)
        landsat_7_slider = v.Slider(label=cm.input_lbl.threshold, v_model = None, thumb_label = True)
        
        cloud_buffer = v.Slider(label=cm.input_lbl.cloud_buffer, min=0, max = 2500, v_model = 0)
        
        # bind them to io 
        output = sw.Alert() \
            .bind(index_select, io, 'index') \
            .bind(sensors_select, io, 'sensor') \
            .bind(landsat_7_switch, io, 'landsat_7_is_threshold') \
            .bind(landsat_7_slider, io, 'landsat_7_threshold') \
            .bind(cloud_buffer, io, 'cloud_buffer')
        
        super().__init__(
            'nested_widget',
            cm.tile.sensor,
            inputs = [index_select, sensors_select, landsat_7_switch, landsat_7_slider, cloud_buffer],
            output = output
        )
        
        