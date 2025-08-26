function eobrowser()
{
//var BASE = 'https://browser.creodias.eu/#';
//var BASE = 'https://apps.sentinel-hub.com/eo-browser/?';
 var BASE = 'https://browser.dataspace.copernicus.eu/?';

  document.getElementById('eob').onclick=function(ev){ 
     var el = ev.target;
     var geoloc= el.getAttribute('geoloc');
     if( !geoloc ) return;
     var shown_el = document.querySelector('#calendar .shown');
     if( !shown_el ) return;
     var day = shown_el.getAttribute('date');
     if( !day ) return;
     var att = shown_el.getAttribute('l2a');
     var level = 'L1C';
     if( att && att != '' ) level = 'L2A';
     
     var url = BASE + geoloc + '&'+'time=' + day 
       + '&datasetId=S2_L2A_CDAS&fromTime=' 
       + day + 'T00%3A00%3A00.000Z&toTime=' 
       + day + 'T23%3A59%3A59.999Z&layerId=1_TRUE_COLOR';

//     + '&preset=1_TRUE_COLOR&datasource=Sentinel-2%20'+level;
      console.log('EOB url: ' + url );
      window.open( url, '_EOB' ).focus();
  };
}


