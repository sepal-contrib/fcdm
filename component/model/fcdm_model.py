from datetime import datetime

from sepal_ui import model 
from traitlets import Any

from component import parameter as cp

class FcdmModel(model.Model):
        
    # basemap 
    forest_map = Any(cp.forest_map[0]['value']).tag(sync=True)
    forest_map_year = Any(cp.forest_map_min_year).tag(sync=True)
    treecover = Any(70).tag(sync=True)

    # sensors 
    sensors = Any([]).tag(sync=True)
    cloud_buffer = Any(500).tag(sync=True)
    improve_L7 = Any(False).tag(sync=True)
    improve_threshold = Any(.08).tag(sync=True)

    # time 
    analysis_start = Any(None).tag(sync=True)
    analysis_end = Any(None).tag(sync=True)
    reference_start = Any(None).tag(sync=True)
    reference_end = Any(None).tag(sync=True)

    # fcdm 
    kernel_radius = Any(150).tag(sync=True)
    filter_threshod = Any(.035).tag(sync=True)
    filter_radius = Any(80).tag(sync=True)
    cleaning_offset = Any(3).tag(sync=True)

    # output maps 
    forest_mask = Any(None).tag(sync=True)
    forest_mask_display = Any(None).tag(sync=True)
    
    def _get_yearday(self, attr):
        """transform the date into a yeardate format from EE script (YYYYmmdd)"""
        date_str = getattr(self, attr)
        date = datetime.strptime(date_str, '%Y-%m-%d')
        
        return date.year * 10000 + date.month * 100 + date.day
    
    # they are kinda kriptic but that was too long to write otherwise 
    # it's only called for display min and max ... 
    def yearday_a_s(self):
        return self._get_yearday('analysis_start')
    
    def yearday_a_e(self):
        return self._get_yearday('analysis_end')
    
    def yearday_r_s(self):
        return self._get_yearday('reference_start')
    
    def yearday_r_e(self):
        return self._get_yearday('reference_end')
        