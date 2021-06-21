from datetime import datetime as dt
from pathlib import Path

import ipyvuetify as v
from sepal_ui import sepalwidgets as sw 
from sepal_ui.scripts import gee
import ee 
from traitlets import Any
from ipywidgets import jslink 

from component.message import cm
from component import scripts as cs
from component import parameter as cp

ee.Initialize()

class ExportMap(v.Menu, sw.SepalWidget):
    
    datasets_items = Any([]).tag(sync=True)
    ticks_to_show = [10, 100, 200, 300]
    
    def __init__(self):
        
        # init the downloadable informations
        self.geometry = None
        self.names = []
        self.datasets = []
        
        # create the useful widgets 
        self.w_scale = v.Slider(
            class_="mt-5",
            v_model=30, #align on the landsat images,
            ticks = 'always',
            tick_labels = [str(i) if i in self.ticks_to_show else "" for i in range(10, 301, 10)],
            min=10, 
            max=300, 
            thumb_label=True,
            step = 10
        )
        
        self.w_datasets = v.Select(
            small = True,
            label = cm.export.datasets,
            v_model = None,
            items = self.datasets_items, 
            multiple = True,
            chips = True
        )
        
        self.w_method = v.RadioGroup(
            v_model='gee',
            row=True,
            children=[
                v.Radio(label=cm.export.radio.sepal, value='sepal'),
                v.Radio(label=cm.export.radio.gee, value='gee')
            ]
        )
        
        self.alert = sw.Alert()
        
        self.w_apply = sw.Btn(cm.export.apply, small=True)
        
        export_data = v.Card(
            children = [
                v.CardTitle(children=[v.Html(tag='h4', children=[cm.export.title])]),
                v.CardText(children=[
                    self.w_datasets,
                    v.Html(tag="h4", children=[cm.export.scale]),
                    self.w_scale,
                    v.Html(tag="h4", children=[cm.export.radio.label]),
                    self.w_method,
                    self.alert
                ]),
                v.CardActions(children=[ self.w_apply])
            ]
        )

        # the clickable icon
        self.btn = v.Btn(
            v_on='menu.on', 
            color='primary', 
            icon = True, 
            children=[v.Icon(children=['mdi-cloud-download'])]
        )
        
        super().__init__(
            value=False,
            close_on_content_click = False,
            nudge_width = 200,
            offset_x=True,
            children = [export_data],
            v_slots = [{
                'name': 'activator',
                'variable': 'menu',
                'children': self.btn
            }]
        )
        
        # add js behaviour 
        self.w_apply.on_event('click', self._apply)
        jslink((self, 'datasets_items'), (self.w_datasets, 'items'))
    
    def _apply(self, widget, event, data):
        """download the dataset using the given parameters"""
        
        folder = Path(ee.data.getAssetRoots()[0]['id'])
        
        # check if a dataset is existing
        if self.dataset == [] or self.geometry == None:
            return self
        
        # set the parameters
        export_params = {
            'image': self.dataset,
            'description': self.name,
            'scale': self.w_scale.v_model,
            'region': self.geometry
        }
        
        # launch the task 
        if self.w_method.v_model == 'gee':
            export_params.update(assetId=str(folder/name))
            task = ee.batch.Export.image.toAsset(**export_params)
            task.start()
            self.alert.add_msg("the task have been launched in your GEE acount", "success")
            
        elif self.w_method.v_model == 'sepal':
            
            gdrive = cs.gdrive()
            
            files = gdrive.get_files(name)
            if files == []:
                task = ee.batch.Export.image.toDrive(**export_params)
                task.start()
                gee.wait_for_completion(name, self.alert)
                files = gdrive.get_files(name)
                
            gdrive.download_files(files, cp.result_dir)
            gdrive.delete_files(files)
            self.alert.add_msg("map exported", "success")
            
        return self