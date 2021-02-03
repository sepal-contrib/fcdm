from component.message import cm

index = [
    cm.index.nbr,
    cm.index.ndii,
    cm.index.ndvi,
    cm.index.ndvi_atmo,
    cm.index.ndwi,
    cm.index.ndgi,
    cm.index.ri
]

forest_map = [
    cm.forest_map.no_map,
    cm.forest_map.roadless,
    cm.forest_map.gfc
]

forest_map_max_year = 2018
forest_map_min_year = 2000

max_kernel_radius = 1000
min_radius_filtering_kernel = 10
max_radius_filtering_kernel = 500
max_disturbing_event_per_kernel = 50