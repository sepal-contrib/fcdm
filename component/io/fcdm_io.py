class FcdmIo():
    
    def __init__(self):
        
        # basemap 
        self.forest_map = None
        self.forest_map_year = None
        self.treecover = None
        
        # sensors 
        self.index = None
        self.sensor = None
        self.cloud_buffer = None
        self.landsat_7_threshold = None
        self.landsat_7_is_threshold = None
        
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