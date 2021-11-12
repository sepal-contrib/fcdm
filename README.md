# Forest Canopy Disturbance Monitoring (FCDM Tool) 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Black badge](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

> (former Delta-rNBR, Version 2.4)

## About 

### FCDM Tool
The FCDM tool supports the detection of forest canopy disturbance from satellite remote sensing and can provide indication on forest degradation processes. 
Reporting on forest degradation is required by many tropical countries participating in the REDD+ (Reducing Emissions from Deforestation and Degradation) program. 
However, compared to deforestation, the mapping of ‘forest degradation’ has proven to be technically much more challenging and the signal of a forest canopy 
disturbance is less prominent, as it does not result in a change of land cover.

The FCDM tool has been developed at the Joint Research Centre (JRC) within the ReCaREDD Project and uses a change detection approach based on the difference (delta) 
of the self-referenced ‘Normalized Burn Ratio’ index (Delta-rNBR; Langner et al. 2018) to detect forest canopy change over defined periods at pixel and sub-pixel level. 
The underlying Delta-rNBR index allows the detection of forest canopy disturbance within tropical (semi-) evergreen forest canopies (‘forest remaining forest’), 
resulting for instance from tree removal, felling damages or from logging trails and leading.

### General Purpose  
- Detection of all kind of tree canopy disturbances (natural or human induced) within evergreen and semi-evergreen forests
- In order to separate natural from human disturbances we recommend manual screening of the data by an experienced human interpreter
- Close to real time monitoring of canopy cover changes possible

### Info     
- Basic methodology described in the paper published in the Remote Sensing journal:   http://www.mdpi.com/2072-4292/10/4/544
  (Please refer to below publication as reference when using this script)
- Please follow me on Twitter to be informed about updates or in case of questions:   @Kumashi74
- Updates to the GEE script (development versions and script manual):                 https://github.com/Andi1974/Forest-degradation-monitoring 
- Updates to the GEE script (latest archived version - with script manual):           https://doi.org/10.5281/zenodo.1014728
- Further information and pre-processed data (in the near future):                    http://forobs.jrc.ec.europa.eu/iforce/dNBR.php

### Citation
Publications, models and data products that make use of this tool must include proper acknowledgement, including citing datasets and the journal article as in the 
following citation:

- Langner A, Miettinen J, Kukkonen M, Vancutsem C, Simonetti D, Vieilledent G, Verhegghen A, Gallego J, Stibig H-J (2018). Towards Operational Monitoring of Forest 
  Canopy Disturbance in Evergreen Rain Forests: A Test Case in Continental Southeast Asia. Remote Sensing. 10, 4, 544, doi:10.3390/rs10040544

> **Original algorithm**  
> Author:  Andreas Langner (SvBuF)  
> Email:  andi.langner@gmail.com, andreas-johannes.langner@ec.europa.eu  
  
> **sepal adaptation**  
> Author: Pierrick Rambaud (FAO)  
> Email: Pierrick.rambaud@fao.org  

## contribute

to install the project on your SEPAL account 
```
$ git clone https://github.com/12rambau/fcdm.git
```

