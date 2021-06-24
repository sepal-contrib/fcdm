from functools import partial

import ee 

ee.Initialize()

from component import parameter as cp

def join_landsat_collections(coll1, coll2):
    """Joining of SR and TOA collections in order to make combined use of pixel_qa band and simple_cloud_score algorithm (Thanks to George Azzari)"""
      
    eqfilter = ee.Filter.equals(rightField = 'system:index',leftField = 'system:index')
    join = ee.ImageCollection(ee.Join.inner().apply(coll1, coll2, eqfilter))
      
    # Inner join returns a FeatureCollection with a primary and secondary set of properties. 
    #vProperties are collapsed into different bands of an image.
    joined = join.map(lambda el: ee.Image.cat(el.get('primary'), el.get('secondary')))
    
    return joined.sort('system:time_start')

def IFORCE_PINO_step2(image, medianImage, apply_buffer, cloud_buffer):
    """
    Masking Step S2_1 for Level-1C: Masking for clouds and cloud shadows (Sentinel-2)
    S2 adapted version of single date classification proposed in http://publications.jrc.ec.europa.eu/repository/handle/JRC95065
    Copyright: Dario Simonetti (December 2018; Dario.SIMONETTI@ec.europa.eu)
    """
    
    # this function is only applyed to sentinel 2 sensor so can safely remove the sensor from the arguments 
    # and get all the useful bands from here
    bands = cp.sensors['sentinel 2']['bands']
    
    qa60 = image.select(bands['qa60'])
    blue = image.select(bands['blue'])
    aerosol = image.select(bands['aerosol'])
    water_vapor = image.select(bands['water_vapor'])
    green = image.select(bands['green'])
    red = image.select(bands['red'])
    red_edge_3 = image.select(bands['red_edge_3'])
    red_edge_4 = image.select(bands['red_edge_4'])
    swir1 = image.select(bands['swir1'])
    red_edge_2 = image.select(bands['red_edge_2'])
    qa60 = image.select(bands['qa60'])

    esa_mask = qa60.eq(2048) \
        .And(blue.gt(0.12)) \
        .And(aerosol.gt(1800))
    
    cloud_mask = aerosol.gt(2000) \
        .Or(aerosol.gt(1340).And(water_vapor.gt(300))) \
        .Or(aerosol.gt(1750).And(water_vapor.gt(230))) \
        .Or(esa_mask)
                      
    growing111= blue \
        .lte(green.add(blue.multiply(0.05))) \
        .And(green.lte(red.add(green.multiply(0.05)))) \
        .And(red.lte(red_edge_3.add(red.multiply(0.05)))) \
        .And(red_edge_3.lte(red_edge_4.add(red_edge_3.multiply(0.05)))) \
        .And(red_edge_4.lte(swir1.add(red_edge_4.multiply(0.05)))) \
        .And(aerosol.lt(1500))
                           
    growing28= blue \
        .lte(green).lte(red).lte(red_edge_2).lte(red_edge_3).lte(red_edge_4) \
        .And(swir1.gte(red_edge_2)) \
        .And(aerosol.lt(1500))

    aerosol_mask = aerosol.gt(1350) \
        .And(water_vapor.gt(400)) \
        .Or(aerosol.gt(2000))
    
    blue_red_swir1 = [bands['blue'], bands['red'], bands['swir1']]
    spdist = image.select(blue_red_swir1).spectralDistance(medianImage.select(blue_red_swir1))
          
    mask1C_blue = blue.subtract(medianImage.select(bands['blue'])).divide(blue)
    mask1C_red = red.subtract(medianImage.select(bands['red'])).divide(red)
    mask1C_swir1 = swir1.subtract(medianImage.select(bands['swir1'])).divide(swir1)
                                
                                
    mask1C_blue = mask1C_blue.gt(0.15) \
        .And(blue.gt(1300)) \
        .And(aerosol_mask)
    
    mask1C_red = mask1C_red.gt(0.2) \
        .And(aerosol_mask)
          
    mask1C_swir1 = mask1C_swir1.lt(-0.68) \
        .And(spdist.gt(0.18)) # remove small shadow pixels 
          
    # mask1C_swir1 takes lots of water (if changes) - distance is more robust and confirm both 
    final_mask = mask1C_red.multiply(2).add(mask1C_swir1);  #keny set to -0.65 or -0.67

          
    # remove change from forest to soil using RED band < 1700
    final_mask_mod = final_mask \
        .where(final_mask.eq(2).And(green.lt(1000)),0) \
        .where(mask1C_blue,3)

    if apply_buffer:
        final_mask_mod = final_mask_mod.gt(0).focal_max(cloud_buffer,'circle','meters',1)
          
    final_mask_mod = final_mask_mod \
        .Or(cloud_mask) \
        .where(growing111.Or(growing28),0)
          
    return image.updateMask(final_mask_mod.eq(0))

def IFORCE_PINO_step1 (image, apply_buffer, cloud_buffer):
    """
    Single Date Classification ONLY MAIN CLASSED + WATER
    Copyright: Dario Simonetti (December 2018; Dario.SIMONETTI@ec.europa.eu)
    """
      
    # I took the liberty of removing ununsude parameters from the function
      
    # this function is only applyed to sentinel 2 sensor so can safely remove the sensor from the arguments 
    # and get all the useful bands from here
    bands = cp.sensors['sentinel 2']['bands']
    
    blue = image.select(bands['blue'])
    green = image.select(bands['green'])
    red = image.select(bands['red'])
    red_edg_3 = image.select(bands['red_edge_3'])
    red_edge_4 = image.select(bands['red_edge_4'])
    swir1 = image.select(bands['swir1'])
    aerosol = image.select(bands['aerosol'])
    red_edge_2 = image.select(bands['red_edge_2'])
    qa60 = image.select(bands['qa60'])
    water_vapor = image.select(bands['water_vapor'])
    
      
    growing111= blue \
        .lte(green.add(blue.multiply(0.05))) \
        .And(green.lte(red.add(green.multiply(0.05)))) \
        .And(red.lte(red_edge_3.add(red.multiply(0.05)))) \
        .And(red_edge_3.lte(red_edge_4.add(red_edge_3.multiply(0.05)))) \
        .And(red_edge_4.lte(swir1.add(red_edge_4.multiply(0.05)))) \
        .And(swir1.lt(1500))
                    
    growing28= blue \
        .lte(green).lte(red).lte(red_edge_2).lte(red_edge_3).lte(red_edge_4) \
        .And(swir1.gte(red_edge_2)) \
        .And(aerosol.lt(1500))

    esa_mask = qa60.eq(2048) \
        .And(blue.gt(0.12)) \
        .And(aerosol.gt(1800))
    
    cloud_mask = aerosol \
        .gt(2000) \
        .Or(aerosol.gt(1340).And(water_vapor.gt(300))) \
        .Or(aerosol.gt(1750).And(water_vapor.gt(230))) \
        .Or(esa_mask)
    
    if apply_buffer:
        cloud_mask = cloud_mask.focal_max(cloud_buffer,'circle','meters',1)
      
    cloud_mask = cloud_mask.where(growing111.Or(growing28),0)
    
    return image.updateMask(cloud_mask.eq(0)) 

def masking_1QB(image, cloud_buffer, sensor):
    """Masking options for clouds (Landsat 8)"""
    
    # this fonction is only adapted to landsat 8
    # I let sensor as an option to fit with the other masking function prototypes
    bands = cp.sensors[sensor]['bands']
    
    nir = image.select(bands['nir'])
    swir2 = image.select(bands['swir2'])
    pixel_qa = image.select(bands['pixel_qa'])
    cloud = image.select(bands['cloud']) # build by the simple_cloud_score
    bright_temp1 = image.select(bands['bright_temp1'])
      
    # start the filtering
    
    no_cloud_mask = nir.eq(0) \
        .And(swir2.eq(0))

    cloud_pixel_qa = pixel_qa \
        .bitwiseAnd(32) \
        .neq(0) \
        .And(cloud.gt(20))

    cloud_shadow_pixel_qa = pixel_qa \
        .bitwiseAnd(8) \
        .neq(0)

    cloud_conf_qa = pixel_qa \
        .bitwiseAnd(64).add(pixel_qa.bitwiseAnd(128)) \
        .interpolate([0, 64, 128, 192], [0, 0, 1, 1], 'clamp') \
        .int() \
        .And(cloud.gt(20))

    cirrus_conf_qa = pixel_qa \
        .bitwiseAnd(256) \
        .add(pixel_qa.bitwiseAnd(512)) \
        .interpolate([0, 256, 512, 768], [0, 0, 1, 1], 'clamp') \
        .int() \
        .And(cloud.gt(20))

    simple_cloud_score = cloud.gte(13)

    unsure_clouds = cloud.lt(13) \
        .And(cloud.gte(9)) \
        .And(bright_temp1.lte(292))
    
    # aggregate all to build the mask
    masked_cloud = no_cloud_mask \
        .Or(cloud_pixel_qa) \
        .Or(cloud_shadow_pixel_qa) \
        .Or(cloud_conf_qa) \
        .Or(cirrus_conf_qa) \
        .Or(simple_cloud_score) \
        .Or(unsure_clouds)
    
    if cloud_buffer:
        masked_cloud = masked_cloud.focal_max(cloud_buffer,'circle','meters',1)
    
    return image.updateMask(masked_cloud.add(1).unmask(0).eq(1))

def masking_S_1(image, cloud_buffer, sensor):
    """Masking Step S2_1 for Level-2A: Masking options for clouds (Sentinel-2) (still will be worked on)"""
    
    # this fonction is only adapted to sentinel 2
    # I let sensor as an option to fit with the other masking function prototypes
    scl = image.select(cp.sensors[sensor]['bands']['scl'])
    
    S2A_clouds = scl.eq(7) \
        .Or(scl.eq(8)) \
        .Or(scl.eq(9)) \
        .Or(scl.eq(10))

    S2A_shadows = scl.eq(3)
      
    S2A_water = scl.eq(6)  
    
    S2A_masked = S2A_clouds \
        .Or(S2A_shadows) \
        .Or(S2A_water)
    
    if cloud_buffer:
        S2A_masked = S2A_masked.focal_max(cloud_buffer,'circle','meters',1)
    
    return image.updateMask(S2A_masked.add(1).unmask(255).eq(1))

def masking_L_1(image, cloud_buffer, sensor):
    """Masking Step 1: Masking options for clouds (any Landsat sensor)"""
    
    bands = cp.sensors[sensor]['bands']
    
    pixel_qa = image.select(bands['pixel_qa'])
    cloud = image.select('cloud') # from the simplecloud algorithm
    nir = image.select(bands['nir'])
    swir2 = image.select(bands['swir2'])
    bright_temp1 = image.select(bands['bright_temp1']) 
    
    
    no_cloud_mask = nir.eq(0) \
        .And(swir2.eq(0))

    cloud_pixel_qa = pixel_qa.bitwiseAnd(32).neq(0);
    cloud_shadow_pixel_qa = pixel_qa.bitwiseAnd(8).neq(0);
    cloud_conf_qa = pixel_qa.bitwiseAnd(64) \
        .add(pixel_qa.bitwiseAnd(128)) \
        .interpolate([0, 64, 128, 192], [0, 0, 1, 1], 'clamp') \
        .int()
    cloud_shadow_sr_cloud_qa = image.select('sr_cloud_qa').bitwiseAnd(4).neq(0) # need to investigate where 'sr_cloud_qa' band come from

    simple_cloud_score = cloud.gte(13)
    
    unsure_clouds = cloud.lt(13) \
        .And(cloud.gte(9)) \
        .And(bright_temp1.lte(292))
    
    masked_clouds = no_cloud_mask \
        .Or(cloud_pixel_qa) \
        .Or(cloud_shadow_pixel_qa) \
        .Or(cloud_conf_qa) \
        .Or(cloud_shadow_sr_cloud_qa) \
        .Or(simple_cloud_score) \
        .Or(unsure_clouds)
    
    if cloud_buffer:
        masked_clouds = masked_clouds.focal_max(cloud_buffer,'circle','meters',1)
      
    return image.updateMask(masked_clouds.add(1).unmask(0).eq(1))

masking_1 = {
    'landsat 4': masking_L_1,
    'landsat 5': masking_L_1,
    'landsat 7': masking_L_1,
    'landsat 8': masking_1QB,
    'sentinel 2': masking_S_1
}

def masking_2(image, forest_mask, year, forest_map, sensor):
    """Masking Step 2: Masking of sensor errors and non-forest areas"""

    bands = cp.sensors[sensor]['bands']
    
    nir = image.select(bands['nir'])
    swir2 = image.select(bands['swir2'])
    blue = image.select(bands['blue'])
    green = image.select(bands['green'])
    red = image.select(bands['red'])
    swir1 = image.select(bands['swir1'])
    
    sensor_error = nir.lte(0) \
        .Or(swir2.lte(0)) \
        .Or(blue.lte(0)) \
        .Or(green.lte(0)) \
        .Or(red.lte(0)) \
        .Or(swir1.lte(0)) \
        .add(1) \
        .unmask(0)
      
    sensor_error_buffer = sensor_error.focal_min(
        radius     = 50,
        kernelType = 'circle',
        units      ='meters',
        iterations = 1
    )

    image = image.unmask(0)
    
    out = {
        'no_map': image.updateMask(sensor_error_buffer.eq(1).And(forest_mask.eq(1))),
        'roadless': image \
            .updateMask(sensor_error_buffer.eq(1)) \
            .updateMask(forest_mask.select(f'Jan{year + 1}').eq(1) \
                .Or(forest_mask.select(f'Jan{year + 1}').eq(2)) \
                .Or(forest_mask.select(f'Jan{year + 1}').eq(13)) \
                .Or(forest_mask.select(f'Jan{year + 1}').eq(14))
            ),
        'gfc': image \
            .updateMask(sensor_error_buffer.eq(1)) \
            .updateMask(forest_mask)
    }
         
    return out[forest_map]

def compute_nbr(image, sensor):
    """
    Compute nbr index 
    NBR = (NIR-SWIR2)/(NIR+SWIR2)
    """
    
    bands = cp.sensors[sensor]['bands']
    
    nir = image.select(bands['nir'])
    swir2 = image.select(bands['swir2'])
    
    doy = ee.Algorithms.Date(ee.Number(image.get("system:time_start")))
    yearday = ee.Number(doy.get('year')).multiply(10000) \
        .add(ee.Number(doy.get('month')).multiply(100)) \
        .add(ee.Number(doy.get('day')))
    
    # create an image out of the yearday value
    yearday = ee.Image.constant(yearday).toInt32().rename('yearday')
    
    nbr = nir.subtract(swir2) \
        .divide(nir.add(swir2)) \
        .rename('NBR')
    
    
    return nbr.addBands(yearday)

def adjustment_kernel(image,kernel_size):
    """
    Adjustment kernel function, which self-references each NBR input scene
    (in order to allow inter-scene comparability)
    """
    
    nbr = image.select('NBR')
    yearday = image.select('yearday')
    
    return nbr \
        .subtract(nbr.focal_median(kernel_size,"circle","meters")) \
        .addBands(yearday) 

def capping(image):
    """Capping at 0 and -1 (positive values are set to 0; values <= -1 are set to -1 because the latter mainly refer to active fires)"""
    
    nbr = image.select('NBR')
    yearday = image.select('yearday')
    
    return nbr \
        .where(nbr.gt(0),0) \
        .where(nbr.lt(-1),-1) \
        .multiply(-1) \
        .addBands(yearday)


############################
##      never called      ##
############################

# getting the forest_mask var 
def get_forest_mask(forest_map, year, treecover, aoi):
    """return the forest mask corresponding to the forest_map input"""
    
    hansen = ee.Image(cp.hansen_gfc).clip(aoi)
    
    
    if forest_map == 'no_map':
        forest_mask = hansen.select('treecover2000').gte(0)
        forest_mask_display = forest_mask.updateMask(forest_mask)
    
    elif forest_map == 'roadless':
        forest_mask = ee.Image(cp.roadless).mosaic().bytes().clip(aoi)
        forest_mask_display = forest_mask.updateMask(forest_mask).select(f'Jan{year+1}')
        
    elif forest_map == 'gfc':
        basemap2000 = hansen.unmask(0).select('treecover2000').gte(treecover) 
        loss_year = hansen.unmask(0).select('lossyear')
        change = loss_year.lte(year-2000) \
            .And(loss_year.gt(0)) \
            .bitwise_not()
        forest_mask = basemap2000.multiply(change)
        forest_mask_display = forest_mask.select("treecover2000").mask(forest_mask)#.select(f'treecover2000')
    
    return (forest_mask, forest_mask_display)

def get_collection(sensor, start, end, forest_map, year, forest_mask, cloud_buffer, aoi):
    
    toa_collection = ee.ImageCollection(cp.sensors[sensor]['dataset']['toa']) \
        .filterDate(start, end) \
        .filterBounds(aoi) \
        .map(ee.Algorithms.Landsat.simpleCloudScore) \
        .select('cloud')
    
    sr_collection = ee.ImageCollection(cp.sensors[sensor]['dataset']['sr']) \
        .filterDate(start, end) \
        .filterBounds(aoi)
    
    sr_toa_collection = join_landsat_collections(sr_collection, toa_collection)
    
    # masking of sensor errors and non-forest areas
    sr_toa_masked_collection = sr_toa_collection.map(partial(
        masking_2,
        forest_mask = forest_mask,
        year = year,
        forest_map = forest_map,
        sensor = sensor
    ))
    
    # cloud masking
    sr_toa_masked_collection = sr_toa_masked_collection.map(partial(
        masking_1[sensor],
        sensor = sensor,
        cloud_buffer = cloud_buffer
    ))
    
    return sr_toa_masked_collection