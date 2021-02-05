from datetime import datetime

class FcdmIo():
    
    def __init__(self):
        
        # basemap 
        self.forest_map = None
        self.forest_map_year = None
        self.treecover = None
        
        # sensors 
        self.index = None
        self.sensors = None
        self.cloud_buffer = None
        self.improve_L7 = None
        self.improve_threshold = None
        
        # time 
        self.analysis_start = None
        self.analysis_end = None
        self.reference_start = None
        self.reference_end = None
        
        # fcdm 
        self.kernel_radius = None
        self.filter_threshod = None
        self.filter_radius = None
        self.cleaning_offset = None
        
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
        