from sepal_ui import sepalwidgets as sw

from component.message import cm

class LaunchTile(sw.Tile):
    
    def __init__(self, aoi_io, io, result_tile):
        
        # gather the io objects 
        self.aoi_io = aoi_io 
        self.io = io 
        
        # add the result_tile to attributes 
        self.result_tile = result_tile
        
        # create the widgets 
        mkd = sw.Markdown(cm.process_txt)
        btn = sw.Btn(cm.launch_btn, class_='mt-5')
        
        # create an output 
        self.output = sw.Alert()
        
        # create the tile 
        super().__init__(
            'compute_widget',
            cm.tile.launch,
            btn = btn,
            output = self.output
        )
        
        # link the js behaviours
        btn.on_event('click', self._launch_fcdm)
        
    def _launch_fcdm(self):
        
        widget.toggle_loading()
        
        self.output.add_livel_msg('I will do nothing', 'warning')

        time.sleep(4)
        
        self.output('I finish doing nothing', 'success')
        
        