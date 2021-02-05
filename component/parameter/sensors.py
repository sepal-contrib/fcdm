sensors = {
    'landsat 4': {
        'dataset': {
            'toa':'LANDSAT/LC04/C01/T1_TOA',
            'sr': 'LANDSAT/LC04/C01/T1_SR'
        },
        'bands': {
            'blue' : 'B1',
            'green': 'B2',
            'red': 'B3',
            'nir': 'B4',
            'swir1': 'B5',
            'swir2': 'B7',
            'pixel_qa': 'pixel_qa',
            'bqa': 'BQA',
            'cloud': 'cloud'
        },
        'res': 30
    },
    'landsat 5': {
        'dataset': {
            'toa':'LANDSAT/LC05/C01/T1_TOA',
            'sr': 'LANDSAT/LC05/C01/T1_SR'
        },
        'bands': {
            'blue' : 'B1',
            'green': 'B2',
            'red': 'B3',
            'nir': 'B4',
            'swir1': 'B5',
            'swir2': 'B7',
            'pixel_qa': 'pixel_qa',
            'bqa': 'BQA',
            'cloud': 'cloud'
        },
        'res': 30
    },
    'landsat 7': {
        'dataset': {
            'toa':'LANDSAT/LC07/C01/T1_TOA',
            'sr': 'LANDSAT/LC07/C01/T1_SR'
        },
        'bands': {
            'blue' : 'B1',
            'green': 'B2',
            'red': 'B3',
            'nir': 'B4',
            'swir1': 'B5',
            'swir2': 'B7',
            'pixel_qa': 'pixel_qa',
            'bqa': 'BQA',
            'cloud': 'cloud'
        },
        'res': 30
    },
    'landsat 8': {
        'dataset': {
            'toa':'LANDSAT/LC08/C01/T1_TOA',
            'sr': 'LANDSAT/LC08/C01/T1_SR'
        },
        'bands': {
            'blue' : 'B2',
            'green': 'B3',
            'red': 'B4',
            'nir': 'B5',
            'swir1': 'B6',
            'swir2': 'B7',
            'pixel_qa': 'pixel_qa',
            'bqa': 'BQA', 
            'cloud': 'cloud',
            'bright_temp1': 'B10'
        },
        'res': 30
    },
    'sentinel 2': {
        'dataset':{
            'toa': 'COPERNICUS/S2',
            'sr': 'COPERNICUS/S2_SR'
        },
        'bands': {
            'blue' : 'B2',
            'green': 'B3',
            'red': 'B4',
            'nir': 'B8',
            'swir1': 'B11',
            'swir2': 'B12',
            'qa60': 'QA60',
            'aerosol': 'B1',
            'water_vapor': 'B9',
            'red_edge_3': 'B7',
            'red_edge_4': 'B8A',
            'red_edge_2': 'B6',
            'scl': 'SCL'
        },
        'res': 10
    }
}