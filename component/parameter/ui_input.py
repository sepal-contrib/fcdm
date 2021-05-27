from component.message import cm

index = [
    {'text': cm.index.nbr,       'value': 'nbr'},
    {'text': cm.index.ndii,      'disabled': True, 'value': 'ndii'},
    {'text': cm.index.ndvi,      'disabled': True, 'value': 'ndvi'},
    {'text': cm.index.ndvi_atmo, 'disabled': True, 'value': 'ndvi_atmo'}, 
    {'text': cm.index.ndwi,      'disabled': True, 'value': 'ndwi'},
    {'text': cm.index.ndgi,      'disabled': True, 'value': 'ndgi'},
    {'text': cm.index.ri,        'disabled': True, 'value': 'ri'}
]

forest_map = [
    {'text': cm.forest_map.gfc,      'value': 'gfc'},
    {'text': cm.forest_map.no_map,   'value': 'no_map'}, 
    {'text': cm.forest_map.roadless, 'value': 'roadless', 'disabled': True}
]

forest_map_max_year = 2018
forest_map_min_year = 2000

max_kernel_radius = 1000
min_radius_filtering_kernel = 10
max_radius_filtering_kernel = 500
max_disturbing_event_per_kernel = 50