// *********************************************************************************************************************************************************
//        Forest Canopy Disturbance Monitoring (FCDM Tool) (former Delta-rNBR now also including Landsat family (inter sensor) analysis, Version 2.4.1)
// *********************************************************************************************************************************************************
// 
//  * Project:  ReCaREDD / IFORCE - JRC of the European Commission
//  *
//  * Purpose:  - Mapping all kind of canopy disturbances (natural or human induced) within (semi-)evergreen forests
//  *           - Disturbances can be interpreted as forest degradation events (after threshold -e.g. 0.02- is applied to separate signal from noise)
//  *           - In order to separate natural from human disturbances we recommend manual screening of the data by an experienced human interpreter
//  *           - Close to real time monitoring of canopy cover changes possible
//  *
//  * Info:     - SR-TOA Combination (SR data with 'simpleCloudScore' band coming from TOA data)
//  *           - Basic methodology described in the paper published in the Remote Sensing journal:   http://www.mdpi.com/2072-4292/10/4/544
//  *             (Please refer to above publication as reference when using this script)
//  *
//  *           - Please follow me on Twitter to be informed about updates or in case of questions:   @Kumashi74
//  *           - Updates to the GEE script (development versions and script manual):                 https://github.com/Andi1974/Forest-degradation-monitoring 
//  *           - Updates to the GEE script (latest archived version - with script manual):           https://doi.org/10.5281/zenodo.1014728
//  *
//  *           - Further information and pre-processed data (in the near future):                    http://forobs.jrc.ec.europa.eu/iforce/dNBR.php
//  *
//  *
//  * Author:   Andreas Langner (SvB)
//  * Email:    andi.langner@gmail.com, andreas-johannes.langner@ec.europa.eu
//
//**********************************************************************************************************************************************************


// *********************************************************************************************************************************************************
// Definition of user interface (for input of the user in a GUI) *******************************************************************************************
// *********************************************************************************************************************************************************

Map.style().set('cursor', 'hand');

var panel = ui.Panel();
panel.style().set({
  width: '400px',
  position: 'bottom-right',
  border : '1px solid #000000',
});

var dummy1 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy2 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy3 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy4 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy5 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy6 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy7 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy8 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy9 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy10 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});
var dummy11 = ui.Label('__________________________________________________________',{fontWeight: 'bold'});

var Header = ui.Label('Forest Canopy Disturbance Monitoring (FCDM Tool v2.4.1)',{fontWeight: 'bold', fontSize: '20px', textAlign: 'center'});
var Subheader1 = ui.Label('Analysis period:',{fontWeight: 'bold'});
var label_Start_second_select = ui.Label('Start:');
var Start_second_select = ui.Textbox({
  value: '2019-01-01',
  style: {width : '90px'},
  onChange: function(text) {
    var Start_second = text
  }
});
var label_End_second_select = ui.Label('End:');
var End_second_select = ui.Textbox({
  value: '2019-12-31',
  style: {width : '90px', textAlign: 'right'},
  onChange: function(text) {
    var End_second = text
  }
});
var Subheader2 = ui.Label('Reference period:',{fontWeight: 'bold'});
var label_Start_base_select = ui.Label('Start:');
var Start_base_select = ui.Textbox({
  value: '2018-01-01',
  style: {width : '90px'},
  onChange: function(text) {
    var Start_base = text
  }
});
var label_End_base_select = ui.Label('End:');
var End_base_select = ui.Textbox({
  value: '2018-12-31',
  style: {width : '90px'},
  onChange: function(text) {
    var End_base = text
  }
});
var label_Index_select = ui.Label('Selection of analysis:',{fontWeight: 'bold'});
var Index_select = ui.Select({
  items: [
    {label: 'Change detection (Delta-rNBR)', value: 'Change'},{label: 'Single (analysis) period assessment (NBR)', value: 'NBR'}],
  value: 'Change',
  onChange: function(value) {
    var Index = value
  },
  style: {width: '200px'}
});
var label_Sensor_select = ui.Label('Sensor selection:',{fontWeight: 'bold'});
var Sensor_select = ui.Select({
  items: [
    {label: 'Landsat 8', value: 'L8'},{label: 'Landsat 7', value: 'L7'},{label: 'Landsat 5', value: 'L5'},{label: 'Landsat 4', value: 'L4'},
    {label: 'Landsat 7/8 (intra sensors)', value: 'L78'},{label: 'Landsat 5/7 (intra sensors)', value: 'L57'},{label: 'Landsat 4/5 (intra sensors)', value: 'L45'},{label: 'Landsat family (inter sensors)', value: 'L'},
    {label: 'Sentinel 2', value: 'S2'}],
  value: 'L8',
  onChange: function(value) {
    var Sensor = value
  },
  style: {width: '200px'}
});
var label_improve_L7_select = ui.Label('Noise cut for Landsat 7 (intra sensor):',{fontWeight: 'bold'});
var improve_L7_select = ui.Checkbox({
  label: 'Setting threshold for Delta Landsat 7 (0 - 0.3):',
  value: false,
  onChange: function(value) {
    var improve_L7 = value
  }
});
var improve_threshold_select = ui.Slider({
  min: 0,
  max: 0.3, 
  value: 0.08, 
  step: 0.001,
  onChange: function(value) {
    var improve_threshold = value
  },
  style: {width: '380px'}
});

var label_countryname_select = ui.Label('Country, AOI or Asset selection:',{fontWeight: 'bold'});
var countryname_select = ui.Select({
  items: [
    {label:'Afghanistan', value:'AF'},{label:'Akrotiri', value:'AX'},{label:'Albania', value:'AL'},{label:'Algeria', value:'AG'},{label:'American Samoa', value:'AQ'},
    {label:'Andorra', value:'AN'},{label:'Angola', value:'AO'},{label:'Anguilla', value:'AV'},{label:'Antarctica', value:'AY'},{label:'Antigua and Barbuda', value:'AC'},
    {label:'Argentina', value:'AR'},{label:'Armenia', value:'AM'},{label:'Aruba', value:'AA'},{label:'Ashmore and Cartier Islands', value:'AT'},{label:'Australia', value:'AS'},
    {label:'Austria', value:'AU'},{label:'Azerbaijan', value:'AJ'},{label:'Bahamas, The', value:'BF'},{label:'Bahrain', value:'BA'},{label:'Baker Island', value:'FQ'},
    {label:'Bangladesh', value:'BG'},{label:'Barbados', value:'BB'},{label:'Bassas da India', value:'BS'},{label:'Belarus', value:'BO'},{label:'Belgium', value:'BE'},
    {label:'Belize', value:'BH'},{label:'Benin', value:'BN'},{label:'Bermuda', value:'BD'},{label:'Bhutan', value:'BT'},{label:'Bolivia', value:'BL'},
    {label:'Bosnia and Herzegovina', value:'BK'},{label:'Botswana', value:'BC'},{label:'Bouvet Island', value:'BV'},{label:'Brazil', value:'BR'},
    {label:'British Indian Ocean Territory', value:'IO'},{label:'British Virgin Islands', value:'VI'},{label:'Brunei', value:'BX'},{label:'Bulgaria', value:'BU'},
    {label:'Burkina Faso', value:'UV'},{label:'Burma', value:'BM'},{label:'Burundi', value:'BY'},{label:'Cambodia', value:'CB'},{label:'Cameroon', value:'CM'},
    {label:'Canada', value:'CA'},{label:'Cape Verde', value:'CV'},{label:'Cayman Islands', value:'CJ'},{label:'Central African Republic', value:'CT'},{label:'Chad', value:'CD'},
    {label:'Chile', value:'CI'},{label:'China', value:'CH'},{label:'Christmas Island', value:'KT'},{label:'Clipperton Island', value:'IP'},
    {label:'Cocos (Keeling) Islands', value:'CK'},{label:'Colombia', value:'CO'},{label:'Comoros', value:'CN'},{label:'Congo (Brazzaville)', value:'CF'},
    {label:'Congo (Kinshasa)', value:'CG'},{label:'Cook Islands', value:'CW'},{label:'Coral Sea Islands', value:'CR'},{label:'Costa Rica', value:'CS'},
    {label:'Cote de Ivoire', value:'IV'},{label:'Croatia', value:'HR'},{label:'Cuba', value:'CU'},{label:'Curasao', value:'UC'},{label:'Cyprus', value:'CY'},
    {label:'Czech Republic', value:'EZ'},{label:'Denmark', value:'DK'},{label:'Dhekelia', value:'DX'},{label:'Djibouti', value:'DJ'},{label:'Dominica', value:'DO'},
    {label:'Dominican Republic', value:'DR'},{label:'Ecuador', value:'EC'},{label:'Egypt', value:'EG'},{label:'El Salvador', value:'ES'},{label:'Equatorial Guinea', value:'EK'},
    {label:'Eritrea', value:'ER'},{label:'Estonia', value:'EN'},{label:'Ethiopia', value:'ET'},{label:'Etorofu, Habomai, Kunashiri, and Shikotan Islands', value:'PJ'},
    {label:'Europa Island', value:'EU'},{label:'Falkland Islands (Islas Malvinas)', value:'FK'},{label:'Faroe Islands', value:'FO'},{label:'Fiji', value:'FJ'},
    {label:'Finland', value:'FI'},{label:'France', value:'FR'},{label:'French Guiana', value:'FG'},{label:'French Polynesia', value:'FP'},
    {label:'French Southern and Antarctic Lands', value:'FS'},{label:'Gabon', value:'GB'},{label:'Gambia, The', value:'GA'},{label:'Gaza Strip', value:'GZ'},
    {label:'Georgia', value:'GG'},{label:'Germany', value:'GM'},{label:'Ghana', value:'GH'},{label:'Gibraltar', value:'GI'},{label:'Glorioso Islands', value:'GO'},
    {label:'Greece', value:'GR'},{label:'Greenland', value:'GL'},{label:'Grenada', value:'GJ'},{label:'Guadeloupe', value:'GP'},{label:'Guam', value:'GQ'},
    {label:'Guatemala', value:'GT'},{label:'Guernsey', value:'GK'},{label:'Guinea', value:'GV'},{label:'Guinea-Bissau', value:'PU'},{label:'Guyana', value:'GY'},
    {label:'Haiti', value:'HA'},{label:'Heard Island and McDonald Islands', value:'HM'},{label:'Honduras', value:'HO'},{label:'Hong Kong', value:'HK'},
    {label:'Howland Island', value:'HQ'},{label:'Hungary', value:'HU'},{label:'Iceland', value:'IC'},{label:'India', value:'IN'},{label:'Indonesia', value:'ID'},
    {label:'Iran', value:'IR'},{label:'Iraq', value:'IZ'},{label:'Ireland', value:'EI'},{label:'Isle of Man', value:'IM'},{label:'Israel', value:'IS'},{label:'Italy', value:'IT'},
    {label:'Jamaica', value:'JM'},{label:'Jan Mayen', value:'JN'},{label:'Japan', value:'JA'},{label:'Jarvis Island', value:'DQ'},{label:'Jersey', value:'JE'},
    {label:'Johnston Atoll', value:'JQ'},{label:'Jordan', value:'JO'},{label:'Juan de Nova Island', value:'JU'},{label:'Kazakhstan', value:'KZ'},{label:'Kenya', value:'KE'},
    {label:'Kingman Reef', value:'KQ'},{label:'Kiribati', value:'KR'},{label:'Korea, North', value:'KN'},{label:'Korea, South', value:'KS'},{label:'Kosovo', value:'KV'},
    {label:'Kuwait', value:'KU'},{label:'Kyrgyzstan', value:'KG'},{label:'Laos', value:'LA'},{label:'Latvia', value:'LG'},{label:'Lebanon', value:'LE'},
    {label:'Lesotho', value:'LT'},{label:'Liberia', value:'LI'},{label:'Libya', value:'LY'},{label:'Liechtenstein', value:'LS'},{label:'Lithuania', value:'LH'},
    {label:'Luxembourg', value:'LU'},{label:'Macau', value:'MC'},{label:'Macedonia', value:'MK'},{label:'Madagascar', value:'MA'},{label:'Malawi', value:'MI'},
    {label:'Malaysia', value:'MY'},{label:'Maldives', value:'MV'},{label:'Mali', value:'ML'},{label:'Malta', value:'MT'},{label:'Marshall Islands', value:'RM'},
    {label:'Martinique', value:'MB'},{label:'Mauritania', value:'MR'},{label:'Mauritius', value:'MP'},{label:'Mayotte', value:'MF'},{label:'Mexico', value:'MX'},
    {label:'Micronesia, Federated States of', value:'FM'},{label:'Midway Islands', value:'MQ'},{label:'Moldova', value:'MD'},{label:'Monaco', value:'MN'},
    {label:'Mongolia', value:'MG'},{label:'Montenegro', value:'MJ'},{label:'Montserrat', value:'MH'},{label:'Morocco', value:'MO'},{label:'Mozambique', value:'MZ'},
    {label:'Namibia', value:'WA'},{label:'Nauru', value:'NR'},{label:'Navassa Island', value:'BQ'},{label:'Nepal', value:'NP'},{label:'Netherlands', value:'NL'},
    {label:'New Caledonia', value:'NC'},{label:'New Zealand', value:'NZ'},{label:'Nicaragua', value:'NU'},{label:'Niger', value:'NG'},{label:'Nigeria', value:'NI'},
    {label:'Niue', value:'NE'},{label:'Norfolk Island', value:'NF'},{label:'Northern Mariana Islands', value:'CQ'},{label:'Norway', value:'NO'},{label:'Oman', value:'MU'},
    {label:'Pakistan', value:'PK'},{label:'Palau', value:'PS'},{label:'Palmyra Atoll', value:'LQ'},{label:'Panama', value:'PM'},{label:'Papua New Guinea', value:'PP'},
    {label:'Paracel Islands', value:'PF'},{label:'Paraguay', value:'PA'},{label:'Peru', value:'PE'},{label:'Philippines', value:'RP'},{label:'Pitcairn Islands', value:'PC'},
    {label:'Poland', value:'PL'},{label:'Portugal', value:'PO'},{label:'Puerto Rico', value:'RQ'},{label:'Qatar', value:'QA'},{label:'Reunion', value:'RE'},
    {label:'Romania', value:'RO'},{label:'Russia', value:'RS'},{label:'Rwanda', value:'RW'},{label:'Saint Barthelemy', value:'TB'},
    {label:'Saint Helena, Ascension, and Tristan da Cunha', value:'SH'},{label:'Saint Kitts and Nevis', value:'SC'},{label:'Saint Lucia', value:'ST'},
    {label:'Saint Martin', value:'RN'},{label:'Saint Pierre and Miquelon', value:'SB'},{label:'Saint Vincent and the Grenadines', value:'VC'},{label:'Samoa', value:'WS'},
    {label:'San Marino', value:'SM'},{label:'Sao Tome and Principe', value:'TP'},{label:'Saudi Arabia', value:'SA'},{label:'Senegal', value:'SG'},{label:'Serbia', value:'RI'},
    {label:'Seychelles', value:'SE'},{label:'Sierra Leone', value:'SL'},{label:'Singapore', value:'SN'},{label:'Sint Maarten', value:'NN'},{label:'Slovakia', value:'LO'},
    {label:'Slovenia', value:'SI'},{label:'Solomon Islands', value:'BP'},{label:'Somalia', value:'SO'},{label:'South Africa', value:'SF'},
    {label:'South Georgia and South Sandwich Islands', value:'SX'},{label:'South Sudan', value:'OD'},{label:'Spain', value:'SP'},{label:'Spratly Islands', value:'PG'},
    {label:'Sri Lanka', value:'CE'},{label:'Sudan', value:'SU'},{label:'Suriname', value:'NS'},{label:'Svalbard', value:'SV'},{label:'Swaziland', value:'WZ'},
    {label:'Sweden', value:'SW'},{label:'Switzerland', value:'SZ'},{label:'Syria', value:'SY'},{label:'Taiwan', value:'TW'},{label:'Tajikistan', value:'TI'},
    {label:'Tanzania', value:'TZ'},{label:'Thailand', value:'TH'},{label:'Timor-Leste', value:'TT'},{label:'Togo', value:'TO'},{label:'Tokelau', value:'TL'},
    {label:'Tonga', value:'TN'},{label:'Trinidad and Tobago', value:'TD'},{label:'Tromelin Island', value:'TE'},{label:'Tunisia', value:'TS'},{label:'Turkey', value:'TU'},
    {label:'Turkmenistan', value:'TX'},{label:'Turks and Caicos Islands', value:'TK'},{label:'Tuvalu', value:'TV'},{label:'Uganda', value:'UG'},{label:'Ukraine', value:'UA'},
    {label:'United Arab Emirates', value:'AE'},{label:'United Kingdom', value:'UK'},{label:'United States Virgin Islands', value:'VQ'},{label:'United States', value:'US'},
    {label:'Uruguay', value:'UY'},{label:'Uzbekistan', value:'UZ'},{label:'Vanuatu', value:'NH'},{label:'Vatican City', value:'VT'},{label:'Venezuela', value:'VE'},
    {label:'Vietnam', value:'VM'},{label:'Wake Island', value:'WQ'},{label:'Wallis and Futuna', value:'WF'},{label:'West Bank', value:'WE'},{label:'Yemen', value:'YM'},
    {label:'Zambia', value:'ZA'},{label:'Zimbabwe', value:'ZI'}],
	value: 'CB',
  onChange: function(value) {
    var countryname = value
  },
  style: {width: '200px'}
});
var AOI_selection = ui.Checkbox({
  label: 'Use AOI polygon (instead of country)',  
  value: false,
  onChange: function(value) {
    var AOI_selection = value
  }
});
var Asset_selection = ui.Checkbox({
  label: 'Use Asset shape file (instead of country)',  
  value: false,
  onChange: function(value) {
    var Asset_selection = value
  }
});
var AOI_Asset_selection = ui.Checkbox({
  label: 'Select Asset with AOI (instead of country)',  
  value: false,
  onChange: function(value) {
    var AOI_Asset_selection = value
  }
});
var center_select = ui.Checkbox({
  label: 'Center on selected area',  
  value: true,
  onChange: function(value) {
    var center = value
  }
});
var label_zoomlevel_select = ui.Label('Zoomlevel under center option (1 - 24):');
var zoomlevel_select = ui.Slider({
  min: 1,
  max: 24, 
  value: 8, 
  step: 1,
  onChange: function(value) {
    var zoomlevel = value
  },
  style: {width: '380px'}
});
var cloudmasking = ui.Label('Parameter for cloud masking (optical):',{fontWeight: 'bold'});
var label_cloud_buffer_select = ui.Label('Cloud buffer (0 - 1,000 meters):');
var cloud_buffer_select = ui.Slider({
  min: 0,
  max: 1000, 
  value: 500, 
  step: 10,
  onChange: function(value) {
    var cloud_buffer = value
  },
  style: {width: '380px'}
});
var Label_forest_mask_selection = ui.Label('Forest map selection:',{fontWeight: 'bold'});
var forest_mask_selection  = ui.Select({
  items: [
    {label: 'No forest map', value: 'No_forest_map'},{label: 'Roadless map (1990 - 2019) (not yet public)', value: 'Roadless_map'},
    {label: 'Global Forest Cover (2000 - 2019)', value: 'Hansen_map'}],
  value: 'Hansen_map',
  onChange: function(value) {
    var forest_mask_select = value
  },
  style: {width: '200px'}
});
var label_forest_mask_year_selection = ui.Label('Year of forest map (1990 - 2018):');
var forest_mask_year_selection = ui.Slider({
  min: 1990,
  max: 2019, 
  value: 2019, 
  step: 1,
  onChange: function(value) {
    var forest_mask_year_select = value
  },
  style: {width: '380px'}
});
var label_hansen_treecover_selection = ui.Label('Select Global Forest Cover percentage (0 - 100%):');
var hansen_treecover_selection = ui.Slider({
  min: 0,
  max: 100, 
  value: 70, 
  step: 1,
  onChange: function(value) {
    var hansen_treecover = value
  },
  style: {width: '380px'}
});
var label_selfreferencing_1 = ui.Label('Self-referencing step (change detection - optical):',{fontWeight: 'bold'});
var label_selfreferencing_2 = ui.Label('Radius of circular kernel (20 - 1,000 meters):');
var kernel_size_selection = ui.Slider({
  min: 20,
  max: 1000, 
  value: 150, 
  step: 10,
  onChange: function(value) {
    var kernel_size = value
  },
  style: {width: '380px'}
});
var label_cleaning_select = ui.Label('Disturbance-density-related (DDR) filtering:',{fontWeight: 'bold'});
var cleaning_selection  = ui.Checkbox({
  label: 'Apply DDR filtering (Landsat)', 
  style: {fontWeight: 'bold'},
  value: true,
  onChange: function(value) {
    var cleaning_select = value
  }
});
var label_threshold_conservative_selection = ui.Label('Select threshold for filtering (0 - 0.1):');
var threshold_conservative_selection = ui.Slider({
  min: 0,
  max: 0.1, 
  value: 0.035, 
  step: 0.001,
  onChange: function(value) {
    var threshold_conservative = value
  },
  style: {width: '380px'}
});
var label_kernel_clean_size_selection = ui.Label('Radius of circular kernel for filtering (10 - 500 meters):');
var kernel_clean_size_selection = ui.Slider({
  min: 10,
  max: 500, 
  value: 80, 
  step: 10,
  onChange: function(value) {
    var kernel_clean_size = value
  },
  style: {width: '380px'}
});
var label_min_disturbances = ui.Label('Min. number of disturbance events per cleaning kernel:');
var min_disturbances_selection = ui.Slider({
  min: 2,
  max: 50, 
  value: 3, 
  step: 1,
  onChange: function(value) {
    var min_disturbances = value
  },
  style: {width: '380px'}
});

var cleaning_selection_S2  = ui.Checkbox({
  label: 'Apply DDR filtering (S2)', 
  value: true,
  style: {fontWeight: 'bold'},
  onChange: function(value) {
    var cleaning_select_S2 = value
  }
});
var label_threshold_conservative_selection_S2 = ui.Label('Select threshold for filtering (1 - 50):');
var threshold_conservative_selection_S2 = ui.Slider({
  min: 0,
  max: 50, 
  value: 15, 
  step: 1,
  onChange: function(value) {
    var threshold_conservative_S2 = value
  },
  style: {width: '380px'}
});
var label_kernel_clean_size_selection_S2 = ui.Label('Radius of circular kernel for filtering (10 - 500 meters):');
var kernel_clean_size_selection_S2 = ui.Slider({
  min: 10,
  max: 500, 
  value: 40, 
  step: 10,
  onChange: function(value) {
    var kernel_clean_size_S2 = value
  },
  style: {width: '380px'}
});
var label_min_disturbances_S2 = ui.Label('Min. number of disturbance events per cleaning kernel:');
var min_disturbances_selection_S2 = ui.Slider({
  min: 2,
  max: 50, 
  value: 6, 
  step: 1,
  onChange: function(value) {
    var min_disturbances_S2 = value
  },
  style: {width: '380px'}
});

var label_exporting = ui.Label('Options for export:',{fontWeight: 'bold'});
var export_selection = ui.Checkbox({
  label: 'Allow export of Delta-rNBR result(s)', 
  value: false,
  onChange: function(value) {
    var export_select = value
  }
});
var export_selection_singleNBRs = ui.Checkbox({
  label: '... additional single rNBRs (or NBR assessment)', 
  value: false,
  onChange: function(value) {
    var export_select_singleNBRs = value
  }
});
var export_selection_singleNBRdates = ui.Checkbox({
  label: '... additional dates of single rNBRs', 
  value: false,
  onChange: function(value) {
    var export_select_singleNBRdates = value
  }
});
var export_selection_forestmask = ui.Checkbox({
  label: '... additional forest mask', 
  value: false,
  onChange: function(value) {
    var export_select_forestmask = value
  }
});

panel.add(Header);
panel.add(Subheader1);
panel.add(label_Start_second_select);
panel.add(Start_second_select);
panel.add(label_End_second_select);
panel.add(End_second_select);
panel.add(Subheader2);
panel.add(label_Start_base_select);
panel.add(Start_base_select);
panel.add(label_End_base_select);
panel.add(End_base_select);
panel.add(dummy1);

panel.add(label_countryname_select);
panel.add(countryname_select);
panel.add(AOI_selection);
panel.add(Asset_selection);
panel.add(AOI_Asset_selection);
panel.add(center_select);
panel.add(label_zoomlevel_select);
panel.add(zoomlevel_select);
panel.add(dummy2);

panel.add(Label_forest_mask_selection);
panel.add(forest_mask_selection);
panel.add(label_forest_mask_year_selection);
panel.add(forest_mask_year_selection);
panel.add(label_hansen_treecover_selection);
panel.add(hansen_treecover_selection);
panel.add(dummy3);

panel.add(label_Index_select);
panel.add(Index_select);
panel.add(label_Sensor_select);
panel.add(Sensor_select);
panel.add(dummy4);

panel.add(cloudmasking);
panel.add(label_cloud_buffer_select);
panel.add(cloud_buffer_select);
panel.add(dummy5);

panel.add(label_selfreferencing_1);
panel.add(label_selfreferencing_2);
panel.add(kernel_size_selection);
panel.add(dummy6);

panel.add(label_improve_L7_select);
panel.add(improve_L7_select);
panel.add(improve_threshold_select);
panel.add(dummy7);

panel.add(label_cleaning_select);
panel.add(cleaning_selection);
panel.add(label_threshold_conservative_selection);
panel.add(threshold_conservative_selection);
panel.add(label_kernel_clean_size_selection);
panel.add(kernel_clean_size_selection);
panel.add(label_min_disturbances);
panel.add(min_disturbances_selection);
panel.add(dummy9);

panel.add(cleaning_selection_S2);
panel.add(label_threshold_conservative_selection_S2);
panel.add(threshold_conservative_selection_S2);
panel.add(label_kernel_clean_size_selection_S2);
panel.add(kernel_clean_size_selection_S2);
panel.add(label_min_disturbances_S2);
panel.add(min_disturbances_selection_S2);
panel.add(dummy10);

panel.add(label_exporting);
panel.add(export_selection);
panel.add(export_selection_singleNBRs);
panel.add(export_selection_singleNBRdates);
panel.add(export_selection_forestmask);

ui.root.add(panel);

var AddButton = function(){
      var button = ui.Button('Run FCDM');
      button.style().set({
        position: 'top-center',
        border : '1px solid #000000',
      });

      button.onClick(function(){return runFCDM()});
      Map.add(button);
}

AddButton();
//AddButton(panel);


// *********************************************************************************************************************************************************
// End of the user interface section (for input of the user in a GUI) **************************************************************************************
// *********************************************************************************************************************************************************


// *********************************************************************************************************************************************************
// Functions of the script *********************************************************************************************************************************
// *********************************************************************************************************************************************************
var runFCDM = function(){
    Map.clear();
    AddButton();
    var Start_base = Start_base_select.getValue();
    var Start_base_number = ee.Number.parse(Start_base.replace(/-/g,'')).getInfo();
    var End_base = End_base_select.getValue();
    var End_base_number = ee.Number.parse(End_base.replace(/-/g,'')).getInfo();
    var Start_second = Start_second_select.getValue();
    var Start_second_number = ee.Number.parse(Start_second.replace(/-/g,'')).getInfo();
    var End_second = End_second_select.getValue();
    var End_second_number = ee.Number.parse(End_second.replace(/-/g,'')).getInfo();
    var Index = Index_select.getValue();
    var Sensor = Sensor_select.getValue();
    var improve_L7 = improve_L7_select.getValue();
    var improve_threshold = improve_threshold_select.getValue();
    var countryname = countryname_select.getValue();
    var AOI_select = AOI_selection.getValue();
    var Asset_select = Asset_selection.getValue();
    var AOI_Asset_select = AOI_Asset_selection.getValue();
    var center = center_select.getValue();
    var zoomlevel = zoomlevel_select.getValue();
    var cloud_buffer = cloud_buffer_select.getValue();
    var forest_mask_select = forest_mask_selection.getValue();
    var forest_mask_year_select = forest_mask_year_selection.getValue();
    var hansen_treecover = hansen_treecover_selection.getValue();
    var kernel_size = kernel_size_selection.getValue();
    var cleaning_select = cleaning_selection.getValue();
    var threshold_conservative = threshold_conservative_selection.getValue();
    var kernel_clean_size = kernel_clean_size_selection.getValue();
    var min_disturbances = min_disturbances_selection.getValue();
    var cleaning_select_S2 = cleaning_selection_S2.getValue();
    var threshold_conservative_S2 = threshold_conservative_selection_S2.getValue();
    var kernel_clean_size_S2 = kernel_clean_size_selection_S2.getValue();
    var min_disturbances_S2 = min_disturbances_selection_S2.getValue();
    var export_select = export_selection.getValue();
    var export_select_singleNBRs = export_selection_singleNBRs.getValue();
    var export_select_singleNBRdates = export_selection_singleNBRdates.getValue();
    var export_select_forestmask = export_selection_forestmask.getValue();


    // *********************************************************************************************************************************************************
    // Functions of the script *********************************************************************************************************************************
    // *********************************************************************************************************************************************************
    
    // Roadless map is loaded and displayed ********************************************************************************************************************
    function rgb(r,g,b){
              var bin = r << 16 | g << 8 | b;
              return (function(h){
              return new Array(7-h.length).join("0")+h;
              })(bin.toString(16).toUpperCase());
    }
    
    
    // Joining of SR and TOA collections in order to make combined use of pixel_qa band and simpleCloudScore algorithm (Thanks ot George Azzari) ***************
    function joinLandsatCollections(coll1, coll2){
      
      var eqfilter = ee.Filter.equals({'rightField':'system:index',
                                       'leftField':'system:index'});
      var join = ee.Join.inner();
      var joined = ee.ImageCollection(join.apply(coll1, coll2, eqfilter));
      
      //Inner join returns a FeatureCollection with a primary and secondary set of properties. Properties are collapsed into different bands of an image.
      return joined.map(function(element){
                          return ee.Image.cat(element.get('primary'), element.get('secondary'));
                        }).sort('system:time_start');
    }
    
    
    // Masking Step 1QB: Masking options for clouds (Landsat 8) ************************************************************************************************
    var Masking_1QB = function(image,cloud_buffer,BANDS) {
    
      var NoCloudMask = (image.select(BANDS[0]).eq(0)).and(image.select(BANDS[1]).eq(0));

      var cloud_pixel_qa = image.select('pixel_qa').bitwiseAnd(32).neq(0);

      var cloud_shadow_pixel_qa = image.select('pixel_qa').bitwiseAnd(8).neq(0);

      var cloud_conf_qa = image.select('pixel_qa').bitwiseAnd(64).add(image.select('pixel_qa').bitwiseAnd(128))
                          .interpolate([0, 64, 128, 192], [0, 0, 1, 1], 'clamp').int();

      var cirrus_conf_qa = image.select('pixel_qa').bitwiseAnd(256).add(image.select('pixel_qa').bitwiseAnd(512))
                          .interpolate([0, 256, 512, 768], [0, 0, 1, 1], 'clamp').int();

      var SimpleCloudScore = image.select(['cloud']).gte(13);

      var UnsureClouds = image.select(['cloud']).lt(13).and(image.select(['cloud']).gte(9)).and(image.select(BANDS[3]).lte(292));
      
      cirrus_conf_qa = cirrus_conf_qa.and(image.select(['cloud']).gt(20))
      cloud_conf_qa = cloud_conf_qa.and(image.select(['cloud']).gt(20))
      cloud_pixel_qa = cloud_pixel_qa.and(image.select(['cloud']).gt(20))
      
      if (cloud_buffer == 0){
        var maskedClouds = (NoCloudMask.or(cloud_pixel_qa).or(cloud_shadow_pixel_qa).or(cloud_conf_qa).or(cirrus_conf_qa).or(SimpleCloudScore).or(UnsureClouds));
      } 
      
      if (cloud_buffer != 0){
        var maskedClouds = (NoCloudMask.or(cloud_pixel_qa).or(cloud_shadow_pixel_qa).or(cloud_conf_qa).or(cirrus_conf_qa).or(SimpleCloudScore).or(UnsureClouds)).focal_max(cloud_buffer,'circle','meters',1);
      } 
      
      return image.updateMask((maskedClouds.add(1).unmask(0)).eq(1));
    }
    
    
    // *********************************************************************************************************************************************************    
    // Masking Step S2_1 for Level-1C: Masking for clouds and cloud shadows (Sentinel-2) ************************************************************************************
    // Copyright: Dario Simonetti (December 2018; Dario.SIMONETTI@ec.europa.eu)
    // S2 adapted version of single date classification proposed in http://publications.jrc.ec.europa.eu/repository/handle/JRC95065
    // *********************************************************************************************************************************************************

    function IFORCE_PINO_step2 (image, medianImage, apply_buffer, cloud_buffer, debug_mode){          

      var EsaMask = (image.select("QA60").eq(2048)).and(image.select("B2").gt(0.12)).and(image.select("B1").gt(1800))
      var cloudMask = (image.select("B1").gt(2000))
                      .or(image.select("B1").gt(1340).and(image.select("B9").gt(300)))
                      .or(image.select("B1").gt(1750).and(image.select("B9").gt(230)))
                      .or(EsaMask)
                      
          var growing111= (image.select("B2").lte(image.select("B3").add(image.select("B2").multiply(0.05))))
                            .and(image.select("B3").lte(image.select("B4").add(image.select("B3").multiply(0.05))))
                            .and(image.select("B4").lte(image.select("B7").add(image.select("B4").multiply(0.05))))
                            .and(image.select("B7").lte(image.select("B8A").add(image.select("B7").multiply(0.05))))
                            .and(image.select("B8A").lte(image.select("B11").add(image.select("B8A").multiply(0.05))))
                            .and(image.select("B1").lt(1500))
                           
          var growing28= (image.select("B2").lte(image.select("B3")).lte(image.select("B4"))
                        .lte(image.select("B6")).lte(image.select("B7")).lte(image.select("B8A")))
                        .and(image.select("B11").gte(image.select("B6")))
                        .and(image.select("B1").lt(1500))
          // var decreas112= (image.select("B12").lte(image.select("B11")))
          //     .and(image.select("B11").lte(image.select("B8")))
          //     .and(image.select("B8").lte(image.select("B3")))
          //     .and(image.select("B3").lte(image.select("B2")))
              
          //     ;
          var B1mask = (image.select("B1").gt(1350).and(image.select("B9").gt(400))).or(image.select("B1").gt(2000))
          
      
          var spdist = image.select('B2','B4','B11').spectralDistance(medianImage.select('B2','B4','B11'));
          
          
          var mask1Cblu = (image.select("B2").subtract(medianImage.select("B2"))).divide(image.select("B2"))
          var mask1C = (image.select("B4").subtract(medianImage.select("B4"))).divide(image.select("B4"))
          var mask1S = (image.select("B11").subtract(medianImage.select("B11"))).divide(image.select("B11"))
          mask1Cblu = mask1Cblu.gt(0.15).and(image.select("B2").gt(1300)).and(B1mask);
          mask1C = mask1C.gt(0.2).and(B1mask)
          
          // remove small shadow pixels 
          
          mask1S = mask1S.lt(-0.68).and(spdist.gt(0.18))//.focal_min(30,'circle','meters',1))              // REM
          //return image.updateMask(B1mask.or(mask1S).or(mask1Cblu).or(mask1C).eq(0))
          
          
          // mask1S takes lots of water (if changes) - distance is more robust and confirm both 
          var finalMask = mask1C.multiply(2).add(mask1S);  // keny set to -0.65 or -0.67
          //var water = decreas112.and(image.select("B12").lt(130))
          //water = water.gt(0)//.focal_max(30,'circle','meters',1);
          
          //finalMask = finalMask.where(water,0);
          
          //  remove change from forest to soil using RED band < 1700
          var finalMaskMod = finalMask.where(finalMask.eq(2).and(image.select('B3').lt(1000)),0)
          finalMaskMod = finalMaskMod.where(mask1Cblu,3)

          
          if(apply_buffer){
           finalMaskMod = finalMaskMod.gt(0).focal_max(cloud_buffer,'circle','meters',1)//.eq(0)    // REM  
          }
          
          finalMaskMod = finalMaskMod.or(cloudMask)
          finalMaskMod = finalMaskMod.where(growing111.or(growing28),0)
          
          if (debug_mode){ 
            
            Map.addLayer(B1mask, {}, 'B1mask',0);
            //Map.addLayer(cloudMask, {}, 'cloudMask',0);
            Map.addLayer(growing111, {}, 'growing111',0);
            Map.addLayer(growing28, {}, 'growing28',0);
            Map.addLayer(spdist, {}, 'distance',0);
            Map.addLayer(mask1Cblu, {}, 'diff_bestCloudsBlu',0);
            Map.addLayer(mask1C, {}, 'diff_bestClouds',0);
            Map.addLayer(mask1S, {}, 'diff_bestShadows',0);
            Map.addLayer(finalMask, {}, 'diff_best_mask',0);
            Map.addLayer(finalMaskMod, {}, 'diff_best_mask_mod',0);
            
            //Map.addLayer(image.updateMask(finalMaskModBuff.eq(0)), {bands:['B11','B8','B4'], min:0, max:5000}, 'img_mask',1);
          }
          
          return image.updateMask(finalMaskMod.eq(0))
    }

    //-------------------------------------------------------------------------------------------------------------------------------
    //  ----------     MY Single Date Classification ONLY MAIN CLASSED + WATER        -----------------------------------------------
    //-------------------------------------------------------------------------------------------------------------------------------

    function IFORCE_PINO_step1 (image,sensor,cloud_sensitivity, returnChoice, apply_buffer, cloud_buffer, mask_shadows){
      var growing111= (image.select("B2").lte(image.select("B3").add(image.select("B2").multiply(0.05))))
                        .and(image.select("B3").lte(image.select("B4").add(image.select("B3").multiply(0.05))))
                        .and(image.select("B4").lte(image.select("B7").add(image.select("B4").multiply(0.05))))
                        .and(image.select("B7").lte(image.select("B8A").add(image.select("B7").multiply(0.05))))
                        .and(image.select("B8A").lte(image.select("B11").add(image.select("B8A").multiply(0.05))))
                        .and(image.select("B1").lt(1500))
                       
      var growing28= (image.select("B2").lte(image.select("B3")).lte(image.select("B4"))
                    .lte(image.select("B6")).lte(image.select("B7")).lte(image.select("B8A")))
                    .and(image.select("B11").gte(image.select("B6")))
                    .and(image.select("B1").lt(1500))

      var EsaMask = (image.select("QA60").eq(2048)).and(image.select("B2").gt(0.12)).and(image.select("B1").gt(1800))
      var cloudMask = (image.select("B1").gt(2000))
                      .or(image.select("B1").gt(1340).and(image.select("B9").gt(300)))
                      .or(image.select("B1").gt(1750).and(image.select("B9").gt(230)))
                      .or(EsaMask)
    
      if(apply_buffer){
        //cloudMask = cloudMask.focal_min(1).focal_max(25)
        //print("Buffering");
        cloudMask = cloudMask.focal_max(cloud_buffer,'circle','meters',1)
      }
      
      cloudMask = cloudMask.where(growing111.or(growing28),0)
    
      return image.updateMask(cloudMask.eq(0)) 
    }
    // *********************************************************************************************************************************************************
    // End Copyright: Dario Simonetti
    // *********************************************************************************************************************************************************


    // Masking Step S2_1 for Level-2A: Masking options for clouds (Sentinel-2) (still will be worked on) ********************************************************************
    // *********************************************************************************************************************************************************
    var Masking_S2_1 = function(image,cloud_buffer){
      
      var S2A_clouds = (image.select('SCL').eq(7)).or(image.select('SCL').eq(8)).or(image.select('SCL').eq(9)).or(image.select('SCL').eq(10))//.add(1).unmask(0);
      var S2A_shadows = (image.select('SCL').eq(3))//.or(image.select('SCL').eq(2))//.add(1).unmask(0);
      var S2A_water = (image.select('SCL').eq(6))//.add(1).unmask(0);      
      
      if (cloud_buffer == 0){
        var S2A_masked = (S2A_clouds.or(S2A_shadows).or(S2A_water));
      } 
      
      if (cloud_buffer != 0){
        var S2A_masked = (S2A_clouds.or(S2A_shadows).or(S2A_water)).focal_max(cloud_buffer,'circle','meters',1);
      } 
      
      return image.updateMask((S2A_masked.add(1).unmask(255)).eq(1));
    }
    
    
    // Masking Step 1: Masking options for clouds (any Landsat sensor) *****************************************************************************************
    var Masking_1 = function(image,cloud_buffer,BANDS) {
    
      var NoCloudMask = (image.select(BANDS[0]).eq(0)).and(image.select(BANDS[1]).eq(0));

      var cloud_pixel_qa = image.select('pixel_qa').bitwiseAnd(32).neq(0);

      var cloud_shadow_pixel_qa = image.select('pixel_qa').bitwiseAnd(8).neq(0);

      var cloud_conf_qa = image.select('pixel_qa').bitwiseAnd(64).add(image.select('pixel_qa').bitwiseAnd(128))
                          .interpolate([0, 64, 128, 192], [0, 0, 1, 1], 'clamp').int();

      var cloud_shadow_sr_cloud_qa = image.select('sr_cloud_qa').bitwiseAnd(4).neq(0);

      var SimpleCloudScore = image.select(['cloud']).gte(13);

      var UnsureClouds = image.select(['cloud']).lt(13).and(image.select(['cloud']).gte(9)).and(image.select(BANDS[3]).lte(292));

      if (cloud_buffer == 0){
        var maskedClouds = (NoCloudMask.or(cloud_pixel_qa).or(cloud_shadow_pixel_qa).or(cloud_conf_qa).or(cloud_shadow_sr_cloud_qa).or(SimpleCloudScore).or(UnsureClouds));
      } 
      
      if (cloud_buffer != 0){
        var maskedClouds = (NoCloudMask.or(cloud_pixel_qa).or(cloud_shadow_pixel_qa).or(cloud_conf_qa).or(cloud_shadow_sr_cloud_qa).or(SimpleCloudScore).or(UnsureClouds)).focal_max(cloud_buffer,'circle','meters',1);
      } 
      
      return image.updateMask((maskedClouds.add(1).unmask(0)).eq(1));
    }
    
    
    // Masking Step 2: Masking of sensor errors and non-forest areas *******************************************************************************************
    var Masking_2 = function(image,forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS) {

      var sensorError = (image.select(BANDS[0]).lte(0)).or(image.select(BANDS[1]).lte(0)).or(image.select(BANDS[5]).lte(0)).or(image.select(BANDS[6]).lte(0)).or
                        (image.select(BANDS[7]).lte(0)).or(image.select(BANDS[8]).lte(0)).add(1).unmask(0);
      
      var sensorError_buffer = sensorError.focal_min({
        radius: 50,
        kernelType: 'circle',
        units:'meters',
        iterations: 1})

      var image = image.unmask(0)//.mask(((image.select(band_1).gt(-99999)).and(image.select(band_2).gt(-999999))));
      
      if (forest_mask_select === 'No_forest_map'){
        var OUT = image.updateMask(sensorError_buffer.eq(1).and(forest_mask.eq(1)));
      }
      
      if (forest_mask_select === 'Roadless_map'){
        var forest_mask_year_select_inc = forest_mask_year_select+1;
        var OUT = image.updateMask(sensorError_buffer.eq(1)).updateMask((forest_mask.select(ee.String('Jan'+forest_mask_year_select_inc)).eq(1)).
        or(forest_mask.select(ee.String('Jan'+forest_mask_year_select_inc)).eq(2)).or(forest_mask.select(ee.String('Jan'+forest_mask_year_select_inc)).eq(13)).
        or(forest_mask.select(ee.String('Jan'+forest_mask_year_select_inc)).eq(14)));
      }

      if (forest_mask_select === 'Hansen_map'){
        var OUT = image.updateMask(sensorError_buffer.eq(1)).updateMask(forest_mask);
      }
         
      return OUT;
    };



    // NBR function, which is applied to all single satellite scenes --> NBR = (NIR-SWIR2)/(NIR+SWIR2) *********************************************************
    var NBR = function(image) {
    
      var d = ee.Date(image.get('system:time_start'));
      var doy =ee.Algorithms.Date(ee.Number(image.get("system:time_start")));
      var yearday=(ee.Number(doy.get('year')).multiply(10000).add(ee.Number(doy.get('month')).multiply(100)).add(ee.Number(doy.get('day'))));
      
      yearday = ee.Image.constant(yearday).toInt32().select([0],['yearday']);
    
      return (image.select('Band_1').subtract(image.select('Band_2'))).
      divide(((image.select('Band_1')).add(image.select('Band_2')))).
      rename(['NBR']).addBands(yearday);
    };
    
    
    // Adjustment kernel function, which self-references each NBR input scene (in order to allow inter-scene comparability) ************************************
    var Adjustment_kernel = function(image,kernel_size) {
      return (image.select('NBR').subtract(image.select('NBR').focal_median(kernel_size,"circle","meters"))).addBands(image.select('yearday')); 
    };
    
    
    // Capping at 0 and -1 (positive values are set to 0; values <= -1 are set to -1 because the latter mainly refer to active fires) **************************
    var Capping = function(image) {
      return ((image.select('NBR').where(image.select('NBR').gt(0),0).where(image.select('NBR').lt(-1),-1)).multiply(-1)).addBands(image.select('yearday')); 
    };
    
    var Capping_fires = function(image) {
      return (image.select('NBR').multiply(-1)).addBands(image.select('yearday'));
    };


    // *********************************************************************************************************************************************************
    
    
    // Definition of study area
    var country = ee.FeatureCollection("USDOS/LSIB/2013").filterMetadata('cc','equals',countryname); // Country border polygons of high accuracy
    var studyarea = ee.FeatureCollection([country.geometry()]); // The study area is set to above selection

    if (AOI_select === true){
      var AOI = geometry.dissolve(0.1);
      var studyarea =  ee.FeatureCollection([AOI]);
      countryname = 'Polygon';
    }
    
    if (Asset_select === true){
      var Asset = table;
      var studyarea = table.filterBounds(Asset);
      countryname = 'Asset';
      Map.addLayer (studyarea,{},'Asset',false);
    }    
    
    if (AOI_Asset_select === true){
      var AOI = geometry.dissolve();
      table = table.filterBounds(AOI);
      var studyarea = table;
      countryname = 'Asset_Polygon_Intersect';
      Map.addLayer (studyarea,{},'Asset selected by AOI',false);
    } 
    

    // Adjustments according to above user selections
    if (center === true){
      Map.centerObject(studyarea, zoomlevel);
    }
    
    if (forest_mask_select === 'No_forest_map'){
      var Hansen_map = ee.Image("UMD/hansen/global_forest_change_2019_v1_7").clip(studyarea);
      var forest_mask = Hansen_map.select('treecover2000').gte(0); // No forest map selected
      Map.addLayer (forest_mask,{},'No Forest map',false);
    }
    
    if (forest_mask_select === 'Roadless_map'){
      var PALETTE = [
        rgb(0,80,0),    // val 1. Evergreen forest
        rgb(51,99,51),    // val 2. Evergreen forest within the plantation area
        rgb(155,80,60),   //val 3. NEW degradation 
        rgb(135,115,45),     // val 4. Ongoing degradation (disturbances still detected)
        rgb(100,135,35),      // val 5. Degraded forest (former degradation, no disturbances detected anymore)
        rgb(255,20,0),        // val 6. NEW deforestation (may follow degradation)
        rgb(255,255,155),     // val 7. Ongoing deforestation (disturbances still detected)
        rgb(152,230,0),               // val 8. NEW Regrowth
        rgb(50,160,0),                 // val 9. Regrowthing
        rgb(255,255,255),  // val 10. Other land cover (not water)
        rgb(0,77,168),       // val 11. Permanent Water (pekel et al.2015)     
        rgb(0,157,200),     // val 12. Seasonal Water (pekel et al.2015) 
        rgb(0,80,0),              // val 13. Not enough data at the beginning of the archive (before StartYear but forest)
        rgb(0,80,0),              // val 14. No data for this specific year (after StartYear but forest)
        rgb(255,255,255)      // val 15. Not enough data at the beginning of the archive but other lc
        
      ];
      var forest_mask = ee.ImageCollection('users/ClassifLandsat072015/Roadless36y/AnnualChange_1982_2018').mosaic().byte().clipToCollection(studyarea); // Roadless map (not yet public)
      var forest_mask_display = forest_mask.updateMask(forest_mask);
      var forest_mask_year_select_inc2 = forest_mask_year_select+1;
      Map.addLayer (forest_mask.select(ee.String('Jan'+forest_mask_year_select_inc2)),{'min':1, 'max': 15, 'palette': PALETTE}, 'One year annual changes '+(forest_mask_year_select),false);
    }

    if (forest_mask_select === 'Hansen_map'){
      var Hansen_map = ee.Image("UMD/hansen/global_forest_change_2019_v1_7").unmask(0); // Hansen map 2019
      var basemap2000 = (Hansen_map.select('treecover2000').gte(hansen_treecover))
      var Hansen_year = ee.Number(2000-[forest_mask_year_select]).abs()
      var change = Hansen_map.select('lossyear').lte(Hansen_year).and(Hansen_map.select('lossyear').gt(0)).bitwise_not()
      var forest_mask = basemap2000.multiply(change).clipToCollection(studyarea);
      var forest_mask_display = Hansen_map.select('treecover2000').mask(forest_mask).clipToCollection(studyarea);
      //var forest_mask_display = forest_mask.updateMask(forest_mask.gte(hansen_treecover));
      Map.addLayer (forest_mask_display,{min:[0],max:[100],palette:'ffffcc,006600'},'Global forest cover map ',false);
    }

  
    if (Sensor === 'L8' || Sensor === 'L78'){
      var resolution = 30;
      var BANDS=['B5','B7','fmask','B10','BQA','B2','B3','B4','B6'];
      var band_1 = 'B5';
      var band_2 = 'B7';
        
      var Imagecollection_second_TOA = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
      .map(ee.Algorithms.Landsat.simpleCloudScore)
      .select('cloud');
      var Imagecollection_second_SR = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
      var Imagecollection_second_SR_TOA = joinLandsatCollections(Imagecollection_second_SR, Imagecollection_second_TOA);
      var Imagecollection_second = Imagecollection_second_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
      buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});

      // Data preparation and cloud masking ********************************************************************************************************************
      var Imagecollection_second_2 = Imagecollection_second
      .map(function(image){return Masking_1QB(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);

      // Calculation of single scenes of Second-NBR ************************************************************************************************************
      var NBR_Imagecollection_second = Imagecollection_second_2.map(NBR);
      
      if (Index === 'Change'){
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        var Imagecollection_base_TOA = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
        .map(ee.Algorithms.Landsat.simpleCloudScore)
        .select('cloud');
        var Imagecollection_base_SR = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA = joinLandsatCollections(Imagecollection_base_SR, Imagecollection_base_TOA);
        var Imagecollection_base = Imagecollection_base_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
        buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});

        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_base_2 = Imagecollection_base
        .map(function(image){return Masking_1QB(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
  
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base = Imagecollection_base_2.map(NBR);
  
        // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
        var NBR_Imagecollection_base_normal1 = NBR_Imagecollection_base.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
        var NBR_Imagecollection_base_normal2 = NBR_Imagecollection_base_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Base-NBR scenes per investigation period *********************************************************
        var NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normal2.qualityMosaic('NBR');
      
        // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
        var NBR_Imagecollection_second_normal1 = NBR_Imagecollection_second.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
      
        // Derive the Delta-NBR result ***************************************************************************************************************************
        var NBR_difference = NBR_Imagecollection_second_normalized_min.select('NBR').subtract(NBR_Imagecollection_base_normalized_min.select('NBR'));
        var NBR_difference_capped = NBR_difference.select('NBR').where(NBR_difference.select('NBR').lt(0), 0);
      
        // Display of condensed Base-NBR scene and information about the acquisition dates of the base satellite data per single pixel location ******************
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Reference L8 '+Start_base+' - '+End_base, false);
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('yearday'),{min: Start_base_number, max: End_base_number ,palette: 'ff0000,ffffff'},'Date rNBR-Reference L8 '+Start_base+' - '+End_base, false);
      
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Analysis L8 '+Start_second+' - '+End_second, false);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date rNBR-Analysis L8 '+Start_second+' - '+End_second, false);
      
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_base_2,'Reference period L8: '+Start_base+' - '+End_base);
        print (Imagecollection_second_2,'Analysis period L8: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
      
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_base_normalized_min_Export_L8 = NBR_Imagecollection_base_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_base_normalized_min_date_Export_L8 = NBR_Imagecollection_base_normalized_min.select('yearday').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_Export_L8 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L8 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        var NBR_difference_Export_L8 = NBR_difference_capped.unmask(-2);  
        
        if (Sensor === 'L78'){
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L8 '+Start_second+' - '+End_second, false);
          var NBR_difference_capped_L8 = ee.ImageCollection(NBR_difference_capped);
          // NBR_difference_capped = 0;
        }
        if (Sensor === 'L8'){
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L8 '+Start_second+' - '+End_second, true);
          // NBR_difference_capped = 0;
        }
      }
      
      if (Index === 'NBR'){
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');

        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_second_2,'Analysis period L8: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
         
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L8 '+Start_second+' - '+End_second, true);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date NBR-Analysis L8 '+Start_second+' - '+End_second, false);
        
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L8 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L8 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        
        if (Sensor === 'L78'){
        //  Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L8 '+Start_second+' - '+End_second, false);
          var NBR_Imagecollection_second_normalized_min_L8 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min);
        }
      }
    }
     
    
    if (Sensor === 'L7' || Sensor === 'L78' || Sensor === 'L57'){
      var resolution = 30;
      var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
      var band_1 = 'B4';
      var band_2 = 'B7';

      var Imagecollection_second_TOA = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
      .map(ee.Algorithms.Landsat.simpleCloudScore)
      .select('cloud');
      var Imagecollection_second_SR = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
      var Imagecollection_second_SR_TOA = joinLandsatCollections(Imagecollection_second_SR, Imagecollection_second_TOA);
      var Imagecollection_second = Imagecollection_second_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
      buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
      
      // Data preparation and cloud masking ********************************************************************************************************************  
      var Imagecollection_second_2 = Imagecollection_second
      .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
      
      // Calculation of single scenes of Second-NBR ************************************************************************************************************
      var NBR_Imagecollection_second = Imagecollection_second_2.map(NBR);      
      
      if (Index === 'Change'){
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        var Imagecollection_base_TOA = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
        .map(ee.Algorithms.Landsat.simpleCloudScore)
        .select('cloud');
        var Imagecollection_base_SR = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA = joinLandsatCollections(Imagecollection_base_SR, Imagecollection_base_TOA);
        var Imagecollection_base = Imagecollection_base_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
        buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
    
        // Data preparation and cloud masking ********************************************************************************************************************  
        var Imagecollection_base_2 = Imagecollection_base
        .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
                                            
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base = Imagecollection_base_2.map(NBR);
        
        // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
        var NBR_Imagecollection_base_normal1 = NBR_Imagecollection_base.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
        var NBR_Imagecollection_base_normal2 = NBR_Imagecollection_base_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Base-NBR scenes per investigation period *********************************************************
        var NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normal2.qualityMosaic('NBR');
      
        // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
        var NBR_Imagecollection_second_normal1 = NBR_Imagecollection_second.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
      
        // Derive the Delta-NBR result ***************************************************************************************************************************
        var NBR_difference = NBR_Imagecollection_second_normalized_min.select('NBR').subtract(NBR_Imagecollection_base_normalized_min.select('NBR'));
        var NBR_difference_capped = NBR_difference.select('NBR').where(NBR_difference.select('NBR').lt(0), 0);
      
        // Display of condensed Base-NBR scene and information about the acquisition dates of the base satellite data per single pixel location ******************
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Reference L7 '+Start_base+' - '+End_base, false);
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('yearday'),{min: Start_base_number, max: End_base_number ,palette: 'ff0000,ffffff'},'Date rNBR-Reference L7 '+Start_base+' - '+End_base, false);
      
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Analysis L7 '+Start_second+' - '+End_second, false);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date rNBR-Analysis L7 '+Start_second+' - '+End_second, false);
      
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_base_2,'Reference period L7: '+Start_base+' - '+End_base);
        print (Imagecollection_second_2,'Analysis period L7: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
      
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_base_normalized_min_Export_L7 = NBR_Imagecollection_base_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_base_normalized_min_date_Export_L7 = NBR_Imagecollection_base_normalized_min.select('yearday').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_Export_L7 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L7 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        var NBR_difference_Export_L7 = NBR_difference_capped.unmask(-2);  
    
        if (Sensor === 'L78' || Sensor === 'L57'){
         if (improve_L7 === true){
            NBR_difference_capped = NBR_difference_capped.where(NBR_difference_capped.lt(improve_threshold),0);
            var NBR_difference_capped_L7 = ee.ImageCollection(NBR_difference_capped);
            // NBR_difference_capped = 0;
          }
          if (improve_L7 === false){
            var NBR_difference_capped_L7 = ee.ImageCollection(NBR_difference_capped);
            // NBR_difference_capped = 0;
          }
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L7 '+Start_second+' - '+End_second, false);
        }
      
        if (Sensor === 'L7'){
          if (improve_L7 === true){
            NBR_difference_capped = NBR_difference_capped.where(NBR_difference_capped.lt(improve_threshold),0);
            var NBR_difference_capped_L7 = ee.ImageCollection(NBR_difference_capped);
            // NBR_difference_capped = 0;
          }
          if (improve_L7 === false){
            var NBR_difference_capped_L7 = ee.ImageCollection(NBR_difference_capped);
            // NBR_difference_capped = 0;
          }
          Map.addLayer (NBR_difference_capped_L7.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L7 '+Start_second+' - '+End_second, true);
        }
      }
      
      if (Index === 'NBR'){
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
    
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_second_2,'Analysis period L7: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
         
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L7 '+Start_second+' - '+End_second, true);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date NBR-Analysis L7 '+Start_second+' - '+End_second, false);
        
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L7 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L7 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        
        if (Sensor === 'L78'){
        //  Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR L7 '+Start_second+' - '+End_second, false);
          var NBR_Imagecollection_second_normalized_min_L7 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min);
        }
      }    
    }
    
    
    if (Sensor === 'L5' || Sensor === 'L57'){
      var resolution = 30;
      var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
      var band_1 = 'B4';
      var band_2 = 'B7';
      
      var Imagecollection_second_TOA = ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
      .map(ee.Algorithms.Landsat.simpleCloudScore)
      .select('cloud');
      var Imagecollection_second_SR = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
      var Imagecollection_second_SR_TOA = joinLandsatCollections(Imagecollection_second_SR, Imagecollection_second_TOA);
      var Imagecollection_second = Imagecollection_second_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
      buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
      
      // Data preparation and cloud masking ********************************************************************************************************************  
      var Imagecollection_second_2 = Imagecollection_second
      .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);      
      
      // Calculation of single scenes of Second-NBR ************************************************************************************************************
      var NBR_Imagecollection_second = Imagecollection_second_2.map(NBR);
            
      if (Index === 'Change'){
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        var Imagecollection_base_TOA = ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
        .map(ee.Algorithms.Landsat.simpleCloudScore)
        .select('cloud');
        var Imagecollection_base_SR = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA = joinLandsatCollections(Imagecollection_base_SR, Imagecollection_base_TOA);
        var Imagecollection_base = Imagecollection_base_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
        buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
      
        // Data preparation and cloud masking ********************************************************************************************************************  
        var Imagecollection_base_2 = Imagecollection_base
        .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
  
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base = Imagecollection_base_2.map(NBR);
        
        // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
        var NBR_Imagecollection_base_normal1 = NBR_Imagecollection_base.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
        var NBR_Imagecollection_base_normal2 = NBR_Imagecollection_base_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Base-NBR scenes per investigation period *********************************************************
        var NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normal2.qualityMosaic('NBR');
      
        // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
        var NBR_Imagecollection_second_normal1 = NBR_Imagecollection_second.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
      
        // Derive the Delta-NBR result ***************************************************************************************************************************
        var NBR_difference = NBR_Imagecollection_second_normalized_min.select('NBR').subtract(NBR_Imagecollection_base_normalized_min.select('NBR'));
        var NBR_difference_capped = NBR_difference.select('NBR').where(NBR_difference.select('NBR').lt(0), 0);
      
        // Display of condensed Base-NBR scene and information about the acquisition dates of the base satellite data per single pixel location ******************
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Reference L5 '+Start_base+' - '+End_base, false);
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('yearday'),{min: Start_base_number, max: End_base_number ,palette: 'ff0000,ffffff'},'Date rNBR-Reference L5 '+Start_base+' - '+End_base, false);
      
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Analysis L5 '+Start_second+' - '+End_second, false);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date rNBR-Analysis L5 '+Start_second+' - '+End_second, false);
      
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_base_2,'Reference period L5: '+Start_base+' - '+End_base);
        print (Imagecollection_second_2,'Analysis period L5: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
      
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_base_normalized_min_Export_L5 = NBR_Imagecollection_base_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_base_normalized_min_date_Export_L5 = NBR_Imagecollection_base_normalized_min.select('yearday').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_Export_L5 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L5 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        var NBR_difference_Export_L5 = NBR_difference_capped.unmask(-2);  
      
        if (Sensor === 'L57'){
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L5 '+Start_second+' - '+End_second, false);
          var NBR_difference_capped_L5 = ee.ImageCollection(NBR_difference_capped);
          // NBR_difference_capped = 0;
        }
        
        if (Sensor === 'L5'){
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L5 '+Start_second+' - '+End_second, true);
          // NBR_difference_capped = 0;
        }
      }

      if (Index === 'NBR'){
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');

        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_second_2,'Analysis period L5: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
         
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L5 '+Start_second+' - '+End_second, true);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date NBR-Analysis L5 '+Start_second+' - '+End_second, false);
        
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L5 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L5 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        
        if (Sensor === 'L57'){
        //  Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L8 '+Start_second+' - '+End_second, false);
          var NBR_Imagecollection_second_normalized_min_L5 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min);
        }
      }
    }   


    if (Sensor === 'L4' || Sensor === 'L45'){
      var resolution = 30;
      var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
      var band_1 = 'B4';
      var band_2 = 'B7';
     
      var Imagecollection_second_TOA = ee.ImageCollection('LANDSAT/LT04/C01/T1_TOA')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
      .map(ee.Algorithms.Landsat.simpleCloudScore)
      .select('cloud');
      var Imagecollection_second_SR = ee.ImageCollection('LANDSAT/LT04/C01/T1_SR')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
      var Imagecollection_second_SR_TOA = joinLandsatCollections(Imagecollection_second_SR, Imagecollection_second_TOA);
      var Imagecollection_second = Imagecollection_second_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
      buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1, band_2,BANDS)});
    
      // Data preparation and cloud masking ********************************************************************************************************************  
      var Imagecollection_second_2 = Imagecollection_second
      .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);

      // Calculation of single scenes of Second-NBR ************************************************************************************************************
      var NBR_Imagecollection_second = Imagecollection_second_2.map(NBR);

      if (Index === 'Change'){
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************  
        var Imagecollection_base_TOA = ee.ImageCollection('LANDSAT/LT04/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
        .map(ee.Algorithms.Landsat.simpleCloudScore)
        .select('cloud');
        var Imagecollection_base_SR = ee.ImageCollection('LANDSAT/LT04/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA = joinLandsatCollections(Imagecollection_base_SR, Imagecollection_base_TOA);
        var Imagecollection_base = Imagecollection_base_SR_TOA.map(function(image){return Masking_2(image.clip(image.geometry().
        buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
  
        // Data preparation and cloud masking ********************************************************************************************************************  
        var Imagecollection_base_2 = Imagecollection_base
        .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
  
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base = Imagecollection_base_2.map(NBR);
        
        // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
        var NBR_Imagecollection_base_normal1 = NBR_Imagecollection_base.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
        var NBR_Imagecollection_base_normal2 = NBR_Imagecollection_base_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Base-NBR scenes per investigation period *********************************************************
        var NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normal2.qualityMosaic('NBR');
  
        // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
        var NBR_Imagecollection_second_normal1 = NBR_Imagecollection_second.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
      
        // Derive the Delta-NBR result ***************************************************************************************************************************
        var NBR_difference = NBR_Imagecollection_second_normalized_min.select('NBR').subtract(NBR_Imagecollection_base_normalized_min.select('NBR'));
        var NBR_difference_capped = NBR_difference.select('NBR').where(NBR_difference.select('NBR').lt(0), 0);
      
        // Display of condensed Base-NBR scene and information about the acquisition dates of the base satellite data per single pixel location ******************
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Reference L4 '+Start_base+' - '+End_base, false);
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('yearday'),{min: Start_base_number, max: End_base_number ,palette: 'ff0000,ffffff'},'Date rNBR-Reference L4 '+Start_base+' - '+End_base, false);
      
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Analysis L4 '+Start_second+' - '+End_second, false);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date rNBR-Analysis L4 '+Start_second+' - '+End_second, false);
      
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_base_2,'Reference period L4: '+Start_base+' - '+End_base);
        print (Imagecollection_second_2,'Analysis period L4: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
      
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_base_normalized_min_Export_L4 = NBR_Imagecollection_base_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_base_normalized_min_date_Export_L4 = NBR_Imagecollection_base_normalized_min.select('yearday').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_Export_L4 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L4 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        var NBR_difference_Export_L4 = NBR_difference_capped.unmask(-2);  
      
        if (Sensor === 'L45'){
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L4 '+Start_second+' - '+End_second, false);
          var NBR_difference_capped_L4 = ee.ImageCollection(NBR_difference_capped);
          // NBR_difference_capped = 0;
        }
        
        if (Sensor === 'L4'){
          Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR L4 '+Start_second+' - '+End_second, true);
          // NBR_difference_capped = 0;
        }
      }
    
      if (Index === 'NBR'){    
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');

        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_second_2,'Analysis period L4: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
         
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L4 '+Start_second+' - '+End_second, true);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date NBR-Analysis L4 '+Start_second+' - '+End_second, false);
        
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L4 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L4 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        
        if (Sensor === 'L45'){
        //  Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L8 '+Start_second+' - '+End_second, false);
          var NBR_Imagecollection_second_normalized_min_L4 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min);
        }    
      }
    }
    
   
    if (Sensor === 'L78'){
      if (Index === 'Change'){
        var NBR_difference_capped_L78 = ee.ImageCollection(NBR_difference_capped_L7.merge(NBR_difference_capped_L8));
        var NBR_difference_capped = NBR_difference_capped_L78.qualityMosaic('NBR');
        Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Date rNBR-Analysis L78  '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_difference_Export_L78 = NBR_difference_capped.unmask(-2);
      }
      if (Index === 'NBR'){
        var NBR_Imagecollection_second_normalized_min_L78 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min_L7.merge(NBR_Imagecollection_second_normalized_min_L8));
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normalized_min_L78.qualityMosaic('NBR');
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L78 '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L78 = NBR_Imagecollection_second_normalized_min.unmask(-2);
      }      
    } 

    if (Sensor === 'L57'){
      if (Index === 'Change'){
        var NBR_difference_capped_L57 = ee.ImageCollection(NBR_difference_capped_L5.merge(NBR_difference_capped_L7));
        var NBR_difference_capped = NBR_difference_capped_L57.qualityMosaic('NBR');
        Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Date rNBR-Analysis L57  '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_difference_Export_L57 = NBR_difference_capped.unmask(-2);
      }
      if (Index === 'NBR'){
        var NBR_Imagecollection_second_normalized_min_L57 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min_L5.merge(NBR_Imagecollection_second_normalized_min_L7));
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normalized_min_L57.qualityMosaic('NBR');
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L57 '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L57 = NBR_Imagecollection_second_normalized_min.unmask(-2);
      }      
    }

    if (Sensor === 'L45'){
      if (Index === 'Change'){
        var NBR_difference_capped_L45 = ee.ImageCollection(NBR_difference_capped_L4.merge(NBR_difference_capped_L5));
        var NBR_difference_capped = NBR_difference_capped_L45.qualityMosaic('NBR');
        Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Date rNBR-Analysis L45  '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_difference_Export_L45 = NBR_difference_capped.unmask(-2);
      }
      if (Index === 'NBR'){
        var NBR_Imagecollection_second_normalized_min_L45 = ee.ImageCollection(NBR_Imagecollection_second_normalized_min_L4.merge(NBR_Imagecollection_second_normalized_min_L5));
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normalized_min_L45.qualityMosaic('NBR');
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis L45 '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L45 = NBR_Imagecollection_second_normalized_min.unmask(-2);
      }      
    }
    
    if (Sensor === 'L7' && Index === 'Change'){
        var NBR_difference_capped_L7improved = ee.ImageCollection(NBR_difference_capped_L7);
        var NBR_difference_capped = NBR_difference_capped_L7improved.qualityMosaic('NBR');
        // Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-r'+Index+' '+Sensor+' '+Start_second+' - '+End_second, true);
        // Prepare data for export (NoData is set to -2) *******************************************************************************************************
        var NBR_difference_Export_L7 = NBR_difference_capped.unmask(-2);
    }
    
    
    
    if (Sensor === 'L'){
      var resolution = 30;
      
      // L8 processing **************************************************************************************************************************************
      var Imagecollection_base_TOA_8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)      
    
      var Imagecollection_base_SR_8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)    
      
      var Imagecollection_second_TOA_8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
    
      var Imagecollection_second_SR_8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
        
      var Imagecollection_base_8_c = Imagecollection_base_TOA_8.size().add(Imagecollection_base_SR_8.size())
      var Imagecollection_second_8_c = Imagecollection_second_TOA_8.size().add(Imagecollection_second_SR_8.size()) 

      if (Imagecollection_second_8_c.gt(1)){
        var BANDS=['B5','B7','fmask','B10','BQA','B2','B3','B4','B6'];
        var band_1 = 'B5';
        var band_2 = 'B7';
      
        Imagecollection_second_TOA_8 = Imagecollection_second_TOA_8
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_second_SR_8 = Imagecollection_second_SR_8
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_second_SR_TOA_8 = joinLandsatCollections(Imagecollection_second_SR_8, Imagecollection_second_TOA_8);
        var Imagecollection_second_8 = Imagecollection_second_SR_TOA_8.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
        
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_second_8_2 = Imagecollection_second_8
          .map(function(image){return Masking_1QB(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
      
        // Calculation of single scenes of Second-NBR ************************************************************************************************************
        var NBR_Imagecollection_second_8 = Imagecollection_second_8_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
          var NBR_Imagecollection_second_normal1_8 = NBR_Imagecollection_second_8.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
          var NBR_Imagecollection_second_normal2_8 = NBR_Imagecollection_second_normal1_8.map(Capping);
        }
      }

      if (Imagecollection_base_8_c.gt(1)){
        var BANDS=['B5','B7','fmask','B10','BQA','B2','B3','B4','B6'];
        var band_1 = 'B5';
        var band_2 = 'B7';  
        
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        Imagecollection_base_TOA_8 = Imagecollection_base_TOA_8
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_base_SR_8 = Imagecollection_base_SR_8
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA_8 = joinLandsatCollections(Imagecollection_base_SR_8, Imagecollection_base_TOA_8);
        var Imagecollection_base_8 = Imagecollection_base_SR_TOA_8.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
    
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_base_8_2 = Imagecollection_base_8
          .map(function(image){return Masking_1QB(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
    
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base_8 = Imagecollection_base_8_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
          var NBR_Imagecollection_base_normal1_8 = NBR_Imagecollection_base_8.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
          var NBR_Imagecollection_base_normal2_8 = NBR_Imagecollection_base_normal1_8.map(Capping);
        } 
      }
        
        
      // L7 processing *******************************************************************************************************************************************    
      var Imagecollection_base_TOA_7 = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)      
    
      var Imagecollection_base_SR_7 = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)    
      
      var Imagecollection_second_TOA_7 = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
    
      var Imagecollection_second_SR_7 = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
        
      var Imagecollection_base_7_c = Imagecollection_base_TOA_7.size().add(Imagecollection_base_SR_7.size())
      var Imagecollection_second_7_c = Imagecollection_second_TOA_7.size().add(Imagecollection_second_SR_7.size()) 
      
      if (Imagecollection_second_7_c.gt(1)){
        var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
        var band_1 = 'B4';
        var band_2 = 'B7';
      
        Imagecollection_second_TOA_7 = Imagecollection_second_TOA_7
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_second_SR_7 = Imagecollection_second_SR_7
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_second_SR_TOA_7 = joinLandsatCollections(Imagecollection_second_SR_7, Imagecollection_second_TOA_7);
        var Imagecollection_second_7 = Imagecollection_second_SR_TOA_7.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
    
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_second_7_2 = Imagecollection_second_7
         .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
      
        // Calculation of single scenes of Second-NBR ************************************************************************************************************
        var NBR_Imagecollection_second_7 = Imagecollection_second_7_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
          var NBR_Imagecollection_second_normal1_7 = NBR_Imagecollection_second_7.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
          var NBR_Imagecollection_second_normal2_7 = NBR_Imagecollection_second_normal1_7.map(Capping);
        }
      }

      if (Imagecollection_base_7_c.gt(1)){
        var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
        var band_1 = 'B4';
        var band_2 = 'B7';;  
        
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        Imagecollection_base_TOA_7 = Imagecollection_base_TOA_7
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_base_SR_7 = Imagecollection_base_SR_7
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA_7 = joinLandsatCollections(Imagecollection_base_SR_7, Imagecollection_base_TOA_7);
        var Imagecollection_base_7 = Imagecollection_base_SR_TOA_7.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
      
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_base_7_2 = Imagecollection_base_7
          .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
    
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base_7 = Imagecollection_base_7_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
          var NBR_Imagecollection_base_normal1_7 = NBR_Imagecollection_base_7.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
          var NBR_Imagecollection_base_normal2_7 = NBR_Imagecollection_base_normal1_7.map(Capping);
        } 
      }


      // L5 processing *******************************************************************************************************************************************    
      var Imagecollection_base_TOA_5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)      
    
      var Imagecollection_base_SR_5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)    
      
      var Imagecollection_second_TOA_5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
    
      var Imagecollection_second_SR_5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
        
      var Imagecollection_base_5_c = Imagecollection_base_TOA_5.size().add(Imagecollection_base_SR_5.size())
      var Imagecollection_second_5_c = Imagecollection_second_TOA_5.size().add(Imagecollection_second_SR_5.size()) 
      
      if (Imagecollection_second_5_c.gt(1)){
        var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
        var band_1 = 'B4';
        var band_2 = 'B7';
      
        Imagecollection_second_TOA_5 = Imagecollection_second_TOA_5
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_second_SR_5 = Imagecollection_second_SR_5
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_second_SR_TOA_5 = joinLandsatCollections(Imagecollection_second_SR_5, Imagecollection_second_TOA_5);
        var Imagecollection_second_5 = Imagecollection_second_SR_TOA_5.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
    
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_second_5_2 = Imagecollection_second_5
         .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
      
        // Calculation of single scenes of Second-NBR ************************************************************************************************************
        var NBR_Imagecollection_second_5 = Imagecollection_second_5_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
          var NBR_Imagecollection_second_normal1_5 = NBR_Imagecollection_second_5.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
          var NBR_Imagecollection_second_normal2_5 = NBR_Imagecollection_second_normal1_5.map(Capping);
        }
      }

      if (Imagecollection_base_5_c.gt(1)){
        var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
        var band_1 = 'B4';
        var band_2 = 'B7';;  
        
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        Imagecollection_base_TOA_5 = Imagecollection_base_TOA_5
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_base_SR_5 = Imagecollection_base_SR_5
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA_5 = joinLandsatCollections(Imagecollection_base_SR_5, Imagecollection_base_TOA_5);
        var Imagecollection_base_5 = Imagecollection_base_SR_TOA_5.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
      
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_base_5_2 = Imagecollection_base_5
          .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
    
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base_5 = Imagecollection_base_5_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
          var NBR_Imagecollection_base_normal1_5 = NBR_Imagecollection_base_5.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
          var NBR_Imagecollection_base_normal2_5 = NBR_Imagecollection_base_normal1_5.map(Capping);
        } 
      }
      
      
      // L4 processing *******************************************************************************************************************************************    
      var Imagecollection_base_TOA_4 = ee.ImageCollection('LANDSAT/LT04/C01/T1_TOA')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)      
    
      var Imagecollection_base_SR_4 = ee.ImageCollection('LANDSAT/LT04/C01/T1_SR')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)    
      
      var Imagecollection_second_TOA_4 = ee.ImageCollection('LANDSAT/LT04/C01/T1_TOA')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
    
      var Imagecollection_second_SR_4 = ee.ImageCollection('LANDSAT/LT04/C01/T1_SR')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
        
      var Imagecollection_base_4_c = Imagecollection_base_TOA_4.size().add(Imagecollection_base_SR_4.size())
      var Imagecollection_second_4_c = Imagecollection_second_TOA_4.size().add(Imagecollection_second_SR_4.size()) 
      
      if (Imagecollection_second_4_c.gt(1)){
        var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
        var band_1 = 'B4';
        var band_2 = 'B7';
      
        Imagecollection_second_TOA_4 = Imagecollection_second_TOA_4
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_second_SR_4 = Imagecollection_second_SR_4
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_second_SR_TOA_4 = joinLandsatCollections(Imagecollection_second_SR_4, Imagecollection_second_TOA_4);
        var Imagecollection_second_4 = Imagecollection_second_SR_TOA_4.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
    
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_second_4_2 = Imagecollection_second_4
         .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
      
        // Calculation of single scenes of Second-NBR ************************************************************************************************************
        var NBR_Imagecollection_second_4 = Imagecollection_second_4_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
          var NBR_Imagecollection_second_normal1_4 = NBR_Imagecollection_second_4.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
          var NBR_Imagecollection_second_normal2_4 = NBR_Imagecollection_second_normal1_4.map(Capping);
        }
      }

      if (Imagecollection_base_4_c.gt(1)){
        var BANDS=['B4','B7','fmask','B6','B6','B1','B2','B3','B5'];
        var band_1 = 'B4';
        var band_2 = 'B7';;  
        
        // Data preparation, part of cloud maskig and masking of sensor errors and non-forest areas **************************************************************
        Imagecollection_base_TOA_4 = Imagecollection_base_TOA_4
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous
          .map(ee.Algorithms.Landsat.simpleCloudScore)
          .select('cloud');
        Imagecollection_base_SR_4 = Imagecollection_base_SR_4
          // .filter(ee.Filter.neq('LANDSAT_SCENE_ID','LC82300672014276LGN00')) // Use this line (or several) to exclude scenes that are erroneous;
        var Imagecollection_base_SR_TOA_4 = joinLandsatCollections(Imagecollection_base_SR_4, Imagecollection_base_TOA_4);
        var Imagecollection_base_4 = Imagecollection_base_SR_TOA_4.map(function(image){return Masking_2(image.clip(image.geometry()
          .buffer(-500)),forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
      
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_base_4_2 = Imagecollection_base_4
          .map(function(image){return Masking_1(image,cloud_buffer,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
    
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base_4 = Imagecollection_base_4_2.map(NBR);
        
        if (Index === 'Change'){
          // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
          var NBR_Imagecollection_base_normal1_4 = NBR_Imagecollection_base_4.map(function(image){return Adjustment_kernel(image,kernel_size)});
          
          // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
          var NBR_Imagecollection_base_normal2_4 = NBR_Imagecollection_base_normal1_4.map(Capping);
        } 
      }


      if (Index === 'Change'){
        // Combining Landsat family  *******************************************************************************************************************************
        var NBR_Imagecollection_base_normalized_combined = NBR_Imagecollection_base_normal2_8.merge(NBR_Imagecollection_base_normal2_7).merge(NBR_Imagecollection_base_normal2_5).merge(NBR_Imagecollection_base_normal2_4);
        var NBR_Imagecollection_second_normalized_combined = NBR_Imagecollection_second_normal2_8.merge(NBR_Imagecollection_second_normal2_7).merge(NBR_Imagecollection_second_normal2_5).merge(NBR_Imagecollection_second_normal2_4);
  
          
        // Condensation of all available self-referenced single Base-NBR scenes per investigation period *********************************************************
        var NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normalized_combined.qualityMosaic('NBR');
      
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normalized_combined.qualityMosaic('NBR');
   
        
        // Derive the Delta-NBR result ***************************************************************************************************************************
        var NBR_difference = NBR_Imagecollection_second_normalized_min.select('NBR').subtract(NBR_Imagecollection_base_normalized_min.select('NBR'));
        var NBR_difference_capped = NBR_difference.select('NBR').where(NBR_difference.select('NBR').lt(0), 0);
      
        // Display of condensed Base-NBR scene and information about the acquisition dates of the base satellite data per single pixel location ******************
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Reference Landsat '+Start_base+' - '+End_base, false);
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('yearday'),{min: Start_base_number, max: End_base_number ,palette: 'ff0000,ffffff'},'Date rNBR-Reference Landsat '+Start_base+' - '+End_base, false);
      
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'rNBR-Analysis Landsat '+Start_second+' - '+End_second, false);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date rNBR-Analysis Landsat '+Start_second+' - '+End_second, false);
      
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (NBR_Imagecollection_base_normalized_combined,'Reference period Landsat: '+Start_base+' - '+End_base);
        print (NBR_Imagecollection_second_normalized_combined,'Analysis period Landsat: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
      
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_base_normalized_min_Export_L = NBR_Imagecollection_base_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_base_normalized_min_date_Export_L = NBR_Imagecollection_base_normalized_min.select('yearday').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_Export_L = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
        var NBR_difference_Export_L = NBR_difference_capped.unmask(-2);  
        
        Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR Landsat '+Start_second+' - '+End_second, true);
      }
      
      if (Index === 'NBR'){
        // Combining Landsat family  *******************************************************************************************************************************
        var NBR_Imagecollection_second_combined = NBR_Imagecollection_second_8.merge(NBR_Imagecollection_second_7).merge(NBR_Imagecollection_second_5).merge(NBR_Imagecollection_second_4);
      
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second_combined.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
    
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (NBR_Imagecollection_second_combined,'Analysis period Landsat: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
         
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[0.3],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis Landsat '+Start_second+' - '+End_second, true);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date NBR-Analysis Landsat '+Start_second+' - '+End_second, false);
        
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_second_normalized_min_Export_L = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(-2);
        var NBR_Imagecollection_second_normalized_min_date_Export_L = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(-2);
      }
    }
    
    
    
    if (Sensor === 'S2'){
      var resolution = 10;
      var BANDS=['B2','B8','B9','B11','B12','B3','B4','B5','B6'];
      var band_1 = 'B8';
      var band_2 = 'B12';
      
      if (Index === 'Change'){
        var start_date='2018-01-01';   // to be defined 
        var end_date='2099-12-31'      // until ultimo
        var AnnualMedian1618 = ee.ImageCollection('COPERNICUS/S2').filterDate(start_date,end_date)  //
                           .filterMetadata('CLOUDY_PIXEL_PERCENTAGE',"less_than",101)
                           .filterBounds(studyarea)
                          //.filterMetadata('system:asset_size', 'greater_than', 900000000)
                           .map(function(image){return IFORCE_PINO_step1(image.clip(studyarea),"S2","HIGH","MASKED_IMAGE",true,cloud_buffer,false)})
                           .reduce(ee.Reducer.percentile([40])).select(["B2_p40","B3_p40","B4_p40","B8_p40","B11_p40","B12_p40"],["B2","B3","B4","B8","B11","B12"]);
                           //.select(["B2","B4","B11"])
                           //.median();   
      
        // Data preparation and cloud masking ********************************************************************************************************************
        var Imagecollection_base = ee.ImageCollection('COPERNICUS/S2')
        .filterDate(Start_base, End_base)
        .filterBounds(studyarea)
        .sort('CLOUDY_PIXEL_PERCENTAGE')
        .map(function(image){return Masking_2(image,forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
        var Imagecollection_second = ee.ImageCollection('COPERNICUS/S2')
        .filterDate(Start_second, End_second)
        .filterBounds(studyarea)
        .sort('CLOUDY_PIXEL_PERCENTAGE')
        .map(function(image){return Masking_2(image,forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)});
        
        // Data preparation and masking of sensor errors and non-forest areas ************************************************************************************
        // ORIGINAL
  
        var Imagecollection_base_2 = Imagecollection_base
        .map(function(image){return IFORCE_PINO_step2(image,AnnualMedian1618,true,cloud_buffer,false)}).select([band_1,band_2],['Band_1','Band_2']);
        var Imagecollection_second_2 = Imagecollection_second
        .map(function(image){return IFORCE_PINO_step2(image,AnnualMedian1618,true,cloud_buffer,false)}).select([band_1,band_2],['Band_1','Band_2']);
  
        // Calculation of single scenes of Base-NBR **************************************************************************************************************
        var NBR_Imagecollection_base = Imagecollection_base_2.map(NBR);
        
        // 'Self-referencing' or normalizatin of single scenes of Base-NBR ***************************************************************************************
        var NBR_Imagecollection_base_normal1 = NBR_Imagecollection_base.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Base-NBR scenes at 0 and -1 *****************************************************************************************
        var NBR_Imagecollection_base_normal2 = NBR_Imagecollection_base_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Base-NBR scenes per investigation period *********************************************************
        var NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normal2.qualityMosaic('NBR');
      
        // Calculation of single scenes of Second-NBR ************************************************************************************************************
        var NBR_Imagecollection_second = Imagecollection_second_2.map(NBR);
        
        // 'Self-referencing' or normalizatin of single scenes of Second-NBR *************************************************************************************
        var NBR_Imagecollection_second_normal1 = NBR_Imagecollection_second.map(function(image){return Adjustment_kernel(image,kernel_size)});
        
        // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
        var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second_normal1.map(Capping);
        
        // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
        var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR');
      
        // Derive the Delta-NBR result ***************************************************************************************************************************
        var NBR_difference = NBR_Imagecollection_second_normalized_min.select('NBR').subtract(NBR_Imagecollection_base_normalized_min.select('NBR'));
        var NBR_difference_capped = (NBR_difference.select('NBR').where(NBR_difference.select('NBR').lt(0), 0)).multiply(254).byte();
        
        NBR_Imagecollection_base_normalized_min = NBR_Imagecollection_base_normalized_min.multiply(254).byte();
        NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normalized_min.multiply(254).byte();
      
        // Display of condensed Base-NBR scene and information about the acquisition dates of the base satellite data per single pixel location ******************
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('NBR'),{min:[0],max:[80],palette:'D3D3D3,Ce0f0f'},'rNBR-Reference S2 '+Start_base+' - '+End_base, false);
        Map.addLayer (NBR_Imagecollection_base_normalized_min.select('yearday'),{min: Start_base_number, max: End_base_number ,palette: 'ff0000,ffffff'},'Date rNBR-Reference S2 '+Start_base+' - '+End_base, false);
      
        // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[80],palette:'D3D3D3,Ce0f0f'},'rNBR-Analysis S2 '+Start_second+' - '+End_second, false);
        Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date rNBR-Analysis S2 '+Start_second+' - '+End_second, false);
      
        // Display the Delta-NBR result **************************************************************************************************************************
        Map.addLayer (NBR_difference_capped.select('NBR'),{min:[0],max:[80],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR S2 '+Start_second+' - '+End_second, true);
      
        // Just some information regarding the used satellite data ***********************************************************************************************
        print (Imagecollection_base_2,'Reference period S2: '+Start_base+' - '+End_base);
        print (Imagecollection_second_2,'Analysis period S2: '+Start_second+' - '+End_second);
        // *******************************************************************************************************************************************************
      
        // Prepare data for export (NoData is set to -2) *********************************************************************************************************
        var NBR_Imagecollection_base_normalized_min_Export_S2 = NBR_Imagecollection_base_normalized_min.select('NBR').unmask(255);
        var NBR_Imagecollection_base_normalized_min_date_Export_S2 = NBR_Imagecollection_base_normalized_min.select('yearday').unmask(0);
        var NBR_Imagecollection_second_normalized_min_Export_S2 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(255);
        var NBR_Imagecollection_second_normalized_min_date_Export_S2 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(0);
        var NBR_difference_Export_S2 = NBR_difference_capped.unmask(255);
      }
      
      if (Index === 'NBR'){ 
      // Data preparation and cloud masking ********************************************************************************************************************
      var Imagecollection_second = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterDate(Start_second, End_second)
      .filterBounds(studyarea)
      //.filter(ee.Filter.neq('system:index','20190103T142031_20190103T142031_T21LTE'))
      .map(function(image){return Masking_S2_1(image,cloud_buffer)});   
      
      // Data preparation and masking of sensor errors and non-forest areas ************************************************************************************
      var Imagecollection_second_2 = Imagecollection_second
      .map(function(image){return Masking_2(image,forest_mask,forest_mask_year_select,forest_mask_select,band_1,band_2,BANDS)}).select([band_1,band_2],['Band_1','Band_2']);
    
      // Calculation of single scenes of Second-NBR ************************************************************************************************************
      var NBR_Imagecollection_second = Imagecollection_second_2.map(NBR);

      // Capping of self-referenced single Second-NBR scenes at 0 and -1 ***************************************************************************************
      var NBR_Imagecollection_second_normal2 = NBR_Imagecollection_second.map(Capping);
      
      // Condensation of all available self-referenced single Second-NBR scenes per investigation period *******************************************************
      var NBR_Imagecollection_second_normalized_min = NBR_Imagecollection_second_normal2.qualityMosaic('NBR').multiply(254).byte();

      // Display of condensed Second-NBR scene and information about the acquisition dates of the second satellite data per single pixel location **************
      Map.addLayer (NBR_Imagecollection_second_normalized_min.select('NBR'),{min:[0],max:[50],palette:'D3D3D3,Ce0f0f'},'NBR-Analysis S2 '+Start_second+' - '+End_second, true);
      Map.addLayer (NBR_Imagecollection_second_normalized_min.select('yearday'),{min: Start_second_number, max: End_second_number, palette: 'ff0000,ffffff'},'Date NBR Analysis S2 '+Start_second+' - '+End_second, false); // not working correctly with byte

      // Just some information regarding the used satellite data ***********************************************************************************************
      print (Imagecollection_second,'Analysis period S2: '+Start_second+' - '+End_second);
      // *******************************************************************************************************************************************************
      
      // Prepare data for export (NoData is set to -2) *********************************************************************************************************
      var NBR_Imagecollection_second_normalized_min_Export_S2 = NBR_Imagecollection_second_normalized_min.select('NBR').unmask(255);
      var NBR_Imagecollection_second_normalized_min_date_Export_S2 = NBR_Imagecollection_second_normalized_min.select('yearday').unmask(0);
      }
    }
    
    

    // Possible cleaning of the final Delta-rNBR result for Landsat ********************************************************************************************
    if (cleaning_select === true && Sensor !== 'S2' && Index === 'Change'){
      var NBR_difference_capped_1 = NBR_difference_capped.where(NBR_difference_capped.lt(threshold_conservative),0).and((NBR_difference_capped.where(NBR_difference_capped.gte(threshold_conservative),1)));
      var NBR_difference_capped_2 = NBR_difference_capped_1.reduceNeighborhood({
        reducer: ee.Reducer.sum().unweighted(),
        kernel: ee.Kernel.circle(kernel_clean_size,'meters'),
      })
      var NBR_difference_capped_3 = NBR_difference_capped.where(NBR_difference_capped_2.gte(min_disturbances),1).and((NBR_difference_capped.where(NBR_difference_capped_2.lt(min_disturbances),0))).unmask(-2);
      var NBR_difference_capped_4 = NBR_difference_capped_3.multiply(NBR_difference_capped);
      var NBR_difference_Export_cleaned = NBR_difference_capped_4.unmask(-2);
      
      // Display the cleaned Delta-rNBR result
      Map.addLayer (NBR_difference_capped_4,{min:[0],max:[0.15],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR filtered '+Sensor+' '+Start_second+' - '+End_second, true);
    }


    // Possible cleaning of the final Delta-rNBR result for Sentinel-2******************************************************************************************
    if (cleaning_select_S2 === true && Sensor === 'S2' && Index === 'Change'){
      var NBR_difference_capped_1 = NBR_difference_capped.where(NBR_difference_capped.lt(threshold_conservative_S2),0).and((NBR_difference_capped.where(NBR_difference_capped.gte(threshold_conservative_S2),1)));
      var NBR_difference_capped_2 = NBR_difference_capped_1.reduceNeighborhood({
        reducer: ee.Reducer.sum().unweighted(),
        kernel: ee.Kernel.circle(kernel_clean_size_S2,'meters'),
      })
      var NBR_difference_capped_3 = NBR_difference_capped.where(NBR_difference_capped_2.gte(min_disturbances_S2),1).and((NBR_difference_capped.where(NBR_difference_capped_2.lt(min_disturbances_S2),0))).unmask(255);
      var NBR_difference_capped_4 = NBR_difference_capped_3.multiply(NBR_difference_capped);
      var NBR_difference_Export_cleaned = NBR_difference_capped_4.unmask(255);
      
      // Display the cleaned Delta-rNBR result
      Map.addLayer (NBR_difference_capped_4,{min:[0],max:[80],palette:'D3D3D3,Ce0f0f'},'Delta-rNBR filtered '+Sensor+' '+Start_second+' - '+End_second, true);
    }    
    
    // *********************************************************************************************************************************************************
    // Export of results ***************************************************************************************************************************************
    // *********************************************************************************************************************************************************
    
    if (export_select === true){
    
      // Make a collection of the information that will be exported to a CSV file
      var features = ee.FeatureCollection([
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Investigation periods:'}),
        ee.Feature(null, {name: 'Start_analysis: '+Start_second}),
        ee.Feature(null, {name: 'End_analysis: '+End_second}),
        ee.Feature(null, {name: 'Start_reference: '+Start_base}),
        ee.Feature(null, {name: 'End_reference: '+End_base}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Index selection:'}),
        ee.Feature(null, {name: 'Analysis methodology: '+Index}),
        ee.Feature(null, {name: 'Sensor selection:'}),
        ee.Feature(null, {name: 'Sensor: '+Sensor}),
        ee.Feature(null, {name: 'Improve_L7: '+improve_L7}),
        ee.Feature(null, {name: 'Improve_threshold: '+improve_threshold}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Geographic area analyzed:'}),
        ee.Feature(null, {name: 'Countryname: '+countryname}),
        ee.Feature(null, {name: 'AOI: '+AOI_select}),
        ee.Feature(null, {name: 'Asset: '+Asset_select}),
        ee.Feature(null, {name: 'Asset selected by AOI: '+AOI_Asset_select}),
        ee.Feature(null, {name: 'Center: '+center}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Cloud masking:'}),
        ee.Feature(null, {name: 'Cloud_buffer: '+cloud_buffer}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Forest map:'}),
        ee.Feature(null, {name: 'Forest_map_select: '+forest_mask_select}),
        ee.Feature(null, {name: 'Forest_map_year_select: '+forest_mask_year_select}),
        ee.Feature(null, {name: 'Global forest cover: '+hansen_treecover}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Self-referencing:'}),
        ee.Feature(null, {name: 'Kernel_size: '+kernel_size}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Disturbance-density-related filtering (Landat):'}),
        ee.Feature(null, {name: 'Optical cleaning_select: '+cleaning_select}),
        ee.Feature(null, {name: 'Export_file: '+'Delta-rNBR_all_cleaned_'+countryname.replace(/ /g,'')+'_'+End_second+'--'+Start_base}), 
        ee.Feature(null, {name: 'Threshold_conservative: '+threshold_conservative}),
        ee.Feature(null, {name: 'Kernel_clean_size: '+kernel_clean_size}),
        ee.Feature(null, {name: 'Min_disturbances: '+min_disturbances}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Disturbance-density-related filtering (S2):'}),        
        ee.Feature(null, {name: 'Radar cleaning_select: '+cleaning_select_S2}),
        ee.Feature(null, {name: 'Export_file: '+'Delta-SPE_all_cleaned_'+countryname.replace(/ /g,'')+'_'+End_second+'--'+Start_base}), 
        ee.Feature(null, {name: 'Threshold_conservative: '+threshold_conservative_S2}),
        ee.Feature(null, {name: 'Kernel_clean_size: '+kernel_clean_size_S2}),
        ee.Feature(null, {name: 'Min_disturbances: '+min_disturbances_S2}),        
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: 'Export option:'}),
        ee.Feature(null, {name: 'Export_select: '+export_select}),
        ee.Feature(null, {name: 'Export_file: '+'Delta'+Index+'_'+Sensor+'_'+countryname.replace(/ /g,'')+'_'+End_second+'--'+Start_base}),    
        ee.Feature(null, {name: 'Export_select_single_r'+Index+'_'+Sensor+': '+export_select_singleNBRs}),
        ee.Feature(null, {name: 'Export_select_single_dates: '+export_select_singleNBRdates}),
        ee.Feature(null, {name: 'Export_select_forestmask: '+export_select_forestmask}),
        ee.Feature(null, {name: '*************************************************'}),
        ee.Feature(null, {name: '*************************************************'}),
      ]);
      
      Export.table.toDrive({
        collection: features,
        description:'Report_FCDM_'+Index+'_session_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
        fileFormat: 'CSV'
      });

      if ((Sensor === 'L8' || Sensor === 'L78') && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_L8,
          description: 'Delta-rNBR_L8_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
        if (export_select_singleNBRs === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_Export_L8,
            description: 'rNBR_reference_L8_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_Export_L8,
            description: 'rNBR_analysis_L8_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
        if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_date_Export_L8,
            description: 'Date_rNBR_reference_L8_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L8,
            description: 'Date_rNBR_analysis_L8_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }
      
      if ((Sensor === 'L8' || Sensor === 'L78') && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L8,
          description: 'NBR_analysis_L8_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
         if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L8,
            description: 'Date_NBR_analysis_L8_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }

      
      if ((Sensor === 'L7' || Sensor === 'L78' || Sensor === 'L57') && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_L7,
          description: 'Delta-rNBR_L7_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
        if (export_select_singleNBRs === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_Export_L7,
            description: 'rNBR_reference_L7_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_Export_L7,
            description: 'rNBR_analysis_L7_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
        if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_date_Export_L7,
            description: 'Date_rNBR_reference_L7_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L7,
            description: 'Date_rNBR_analysis_L7_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }
      
      if ((Sensor === 'L7' || Sensor === 'L78' || Sensor === 'L57') && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L7,
          description: 'NBR_analysis_L7_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
         if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L7,
            description: 'Date_NBR_analysis_L7_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }      
      
      
      if ((Sensor === 'L5' || Sensor === 'L57') && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_L5,
          description: 'Delta-rNBR_L5_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
        if (export_select_singleNBRs === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_Export_L5,
            description: 'rNBR_reference_L5_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_Export_L5,
            description: 'rNBR_analysis_L5_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
        if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_date_Export_L5,
            description: 'Date_rNBR_reference_L5_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo() 
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L5,
            description: 'Date_rNBR_analysis_L5_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }
      
      if ((Sensor === 'L5' || Sensor === 'L57') && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L5,
          description: 'NBR_analysis_L5_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
         if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L5,
            description: 'Date_NBR_analysis_L5_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }       
      
      
      if ((Sensor === 'L4' || Sensor === 'L45') && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_L4,
          description: 'Delta-rNBR_L4_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo() 
        })
        if (export_select_singleNBRs === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_Export_L4,
            description: 'rNBR_reference_L4_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo() 
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_Export_L4,
            description: 'rNBR_analysis_L4_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
        if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_date_Export_L4,
            description: 'Date_rNBR_reference_L4_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()  
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L4,
            description: 'Date_rNBR_analysis_L4_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()  
          });
        }
      }
      
      if ((Sensor === 'L4' || Sensor === 'L45') && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L4,
          description: 'NBR_analysis_L4_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
         if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L4,
            description: 'Date_NBR_analysis_L4_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }       



      if (Sensor === 'L' && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_L,
          description: 'Delta-rNBR_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
        if (export_select_singleNBRs === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_Export_L,
            description: 'rNBR_reference_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_Export_L,
            description: 'rNBR_analysis_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
        if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_date_Export_L,
            description: 'Date_rNBR_reference_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L,
            description: 'Date_rNBR_analysis_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }
      
      if (Sensor === 'L' && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L,
          description: 'NBR_analysis_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
         if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_L,
            description: 'Date_NBR_analysis_Landsat_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }


     
      if (Sensor === 'L78' && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_L78,
          description: 'Delta-rNBR_L78_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo() 
        })
      }
      if (Sensor === 'L78' && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L78,
          description: 'NBR_analysis_L78_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo() 
        })
      }
      
      if (Sensor === 'L57' && Index === 'Change'){
          Export.image.toDrive({
          image: NBR_difference_Export_L57,
          description: 'Delta-rNBR_L57_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()  
        })
      }
      if (Sensor === 'L57' && Index === 'NBR'){
          Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L57,
          description: 'NBR_analysis_L57_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()  
        })
      }

      if (Sensor === 'L45' && Index === 'Change'){
          Export.image.toDrive({
          image: NBR_difference_Export_L45,
          description: 'Delta-rNBR_L45_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo() 
        })
      }
      if (Sensor === 'L45' && Index === 'NBR'){
          Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_L45,
          description: 'NBR_analysis_L45_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo() 
        })
      }


      if (Sensor === 'S2' && Index === 'Change'){
        Export.image.toDrive({
          image: NBR_difference_Export_S2,
          description: 'Delta-r'+Index+'_S2_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
        if (export_select_singleNBRs === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_Export_S2,
            description: 'r'+Index+'_reference_S2_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo() 
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_Export_S2,
            description: 'r'+Index+'_analysis_S2_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
        if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_base_normalized_min_date_Export_S2,
            description: 'Date_reference_S2_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_S2,
            description: 'Date_analysis_S2_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      }

      if (Sensor === 'S2' && Index === 'NBR'){
        Export.image.toDrive({
          image: NBR_Imagecollection_second_normalized_min_Export_S2,
          description: 'NBR_analysis_S2_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        })
         if (export_select_singleNBRdates === true){
          Export.image.toDrive({
            image: NBR_Imagecollection_second_normalized_min_date_Export_S2,
            description: 'Date_NBR_analysis_S2_'+countryname.replace(/ /g,'')+'_'+Start_base+'--'+End_base,
            scale: resolution,
            maxPixels: 1e13,
            skipEmptyTiles: true,
            region: studyarea.geometry().bounds().getInfo()
          });
        }
      } 
      
  
      if (cleaning_select === true){
        Export.image.toDrive({
          image: NBR_difference_Export_cleaned,
          description: 'Delta-r'+Index+'_filtered_'+Sensor+'_'+countryname.replace(/ /g,'')+'_'+Start_second+'--'+End_second,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        });
      }

      if (export_select_forestmask === true){
        Export.image.toDrive({
          image: forest_mask_display,
          description: 'Forestmask_'+countryname.replace(/ /g,'')+'_'+forest_mask_select+'--'+forest_mask_year_select,
          scale: resolution,
          maxPixels: 1e13,
          skipEmptyTiles: true,
          region: studyarea.geometry().bounds().getInfo()
        });
      }
    }
  }


// *********************************************************************************************************************************************************
// ******************************************************************* END *********************************************************************************
// *********************************************************************************************************************************************************

