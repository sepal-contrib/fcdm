from component.message import cm

index = [
    {'text': cm.index.nbr,      'value': 'nbr'},
    {'text': cm.index.ndii,      'value': 'ndii'},
    {'text': cm.index.ndvi,      'value': 'ndvi'},
    {'text': cm.index.ndvi_atmo, 'value': 'ndvi_atmo'}, 
    {'text': cm.index.ndwi,      'value': 'ndwi'},
    {'text': cm.index.ndgi,      'value': 'ndgi'},
    {'text': cm.index.ri,        'value': 'ri'}
]

forest_map = [
    {'text': cm.forest_map.no_map,   'value': 'no_map'}, 
    {'text': cm.forest_map.roadless, 'value': 'roadless'}, 
    {'text': cm.forest_map.gfc,      'value': 'gfc'}
]

forest_map_max_year = 2018
forest_map_min_year = 2000

max_kernel_radius = 1000
min_radius_filtering_kernel = 10
max_radius_filtering_kernel = 500
max_disturbing_event_per_kernel = 50