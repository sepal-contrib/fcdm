from datetime import datetime

from component import parameter as cp

class FcdmIo():
    
    def __init__(self):
        
        # basemap 
        self.forest_map = cp.forest_map[0]['value']
        self.forest_map_year = None
        self.treecover = 70
        
        # sensors 
        self.index = cp.index[0]['value']
        self.sensors = ['landsat 8']
        self.cloud_buffer = 500
        self.improve_L7 = False
        self.improve_threshold = .08
        
        # time 
        self.analysis_start = None
        self.analysis_end = None
        self.reference_start = None
        self.reference_end = None
        
        # fcdm 
        self.kernel_radius = 150
        self.filter_threshod = .035
        self.filter_radius = 80
        self.cleaning_offset = 3
        
        # output maps 
        self.forest_mask = None
    
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
        