viz_forest_mask = {
    'roadless': {
        'min': 1,
        'max': 15,
        'palette': [
            '#005000',# val 1. Evergreen forest
            '#336333',# val 2. Evergreen forest within the plantation area
            '#9b503c',# val 3. NEW degradation 
            '#87732d',# val 4. Ongoing degradation (disturbances still detected)
            '#648723',# val 5. Degraded forest (former degradation, no disturbances detected anymore)
            '#ff1400',# val 6. NEW deforestation (may follow degradation)
            '#ffff9b',# val 7. Ongoing deforestation (disturbances still detected)
            '#98e600',# val 8. NEW Regrowth
            '#32a000',# val 9. Regrowthing
            '#ffffff',# val 10. Other land cover (not water)
            '#004da8',# val 11. Permanent Water (pekel et al.2015)     
            '#009dc8',# val 12. Seasonal Water (pekel et al.2015) 
            '#005000',# val 13. Not enough data at the beginning of the archive (before StartYear but forest)
            '#005000',# val 14. No data for this specific year (after StartYear but forest)
            '#ffffff' # val 15. Not enough data at the beginning of the archive but other lc
        ]
    },
    'gfc': {
        'min':0,
        'max':1,
        'palette': [
            '#ffffcc',
            '#006600'
        ]
    },
    'no_map': {}
}

legend_dict = {
    "forest mask": '#006600',
    "change": 'Ce0f0f',
    "no change": 'D3D3D3'
}