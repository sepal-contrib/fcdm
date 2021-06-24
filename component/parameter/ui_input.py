from component.message import cm

index = [
    {'text': cm.index.nbr,    'value': 'nbr'},
    {'text': cm.index.change, 'value': 'change'}
]

forest_map = [
    {'text': cm.forest_map.gfc,      'value': 'gfc'},
    {'text': cm.forest_map.no_map,   'value': 'no_map'}, 
    {'text': cm.forest_map.roadless, 'value': 'roadless', 'disabled': True}
]

forest_map_max_year = 2020
forest_map_min_year = 2000

max_kernel_radius = 1000
min_radius_filtering_kernel = 10
max_radius_filtering_kernel = 500
max_disturbing_event_per_kernel = 50