from sepal_ui import sepalwidgets as sw
import ipyvuetify as v

from component.message import cm

class TimeTile(sw.Tile):
    
    def __init__(self, io):
        
        # create the widgets
        baseline_title = v.Html(tag='h4', children=[cm.input_lbl.baseline], class_="mb-0 mt-5")
        baseline_start_picker = sw.DatePicker(label=cm.input_lbl.start)
        baseline_end_picker = sw.DatePicker(label=cm.input_lbl.end)
        baseline_picker_line = v.Layout(xs12=True, row=True, children = [baseline_start_picker, baseline_end_picker])
        
        analysis_title = v.Html(tag='h4', children=[cm.input_lbl.analysis], class_="mb-0 mt-5")
        analysis_start_picker = sw.DatePicker(label=cm.input_lbl.start)
        analysis_end_picker = sw.DatePicker(label=cm.input_lbl.end)
        analysis_picker_line = v.Layout(xs12=True, row=True, children = [analysis_start_picker, analysis_end_picker])
        
        #create the output 
        output = sw.Alert() \
            .bind(baseline_start_picker, io, 'reference_start') \
            .bind(baseline_end_picker, io, 'reference_end') \
            .bind(analysis_start_picker, io, 'analysis_start') \
            .bind(baseline_start_picker, io, 'analysis_end')
        
        super().__init__(
            'nested_widget',
            cm.tile.time,
            inputs = [baseline_title, baseline_picker_line, analysis_title, analysis_picker_line],
            output = output
        )
        
        
        
        