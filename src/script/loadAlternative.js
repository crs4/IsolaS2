function loadAlternative(ev) // onerror event handler for img
{
  var el = ev.target;
  var status=0;

  var att = el.getAttribute('data-alternative');
  if( att )
  {
      var list = att.split(',');
      // console.log('List: ' +  list );
      status = list.length;
  }
     
  switch( status )
  {
    case 0:
        console.log( 'Failed: src:' ); console.log( el.src );
        return; // leave without updating el.src
        break;
    case 1:
        var new_src = list[0]; //  the remaining url in the array /list
        el.removeAttribute('data-alternative');
        break;
    case 2:
    default:
        var new_src = list.shift(); //  pick off the first url in the array /list
        // console.log('Trying: ' +  new_src );
        // console.log('NewList: ' +  list );
        el.setAttribute('data-alternative', list.join(',') );
        break;
  }
  el.src = new_src;     // triggers load, may trigger  onerror 
}

/////////////////////////////////////////////// 

function get_img_src_dataspace( stem, tile_id )    // S2B_MSIL2A_20181031T101139_N0211_R022_T_20190116T215303
{ 
  const key = stem.replaceAll( '_T_',  '_' + tile_id + '_');
  const Id  = sessionStorage.getItem( key );  // should check for failure

    return( 'https://catalogue.dataspace.copernicus.eu/odata/v1/Assets(' + Id + ')/$value' );
}            

function get_img_src_dataspace_proxy( stem, tile_id )    // S2B_MSIL2A_20181031T101139_N0211_R022_T_20190116T215303
{ 
  const key = stem.replaceAll( '_T_',  '_' + tile_id + '_');
  const Id  = sessionStorage.getItem( key );  // should check for failure

    return( 'https://catalogue-dataspace-copernicus-eu.sentineltwosardinia.workers.dev'
            + encodeURI('/Assets(' + Id + ')/$value') );
}            

/////////////////////////////////////////////// 

function get_img_src_creodias( stem, tile_id )    // S2B_MSIL2A_20181031T101139_N0211_R022_T_20190116T215303
{ 
    var level = stem.substr(7,3); 
    var yyyy  = stem.substr(11,4); 
    var mm    = stem.substr(15,2); 
    var dd    = stem.substr(17,2); 

    return( 'https://finder.creodias.eu/files/Sentinel-2/MSI'
            + '/' + level + '/' + yyyy + '/' + mm  +  '/' + dd
            + '/' + stem + '.SAFE'
            + '/' + stem + '-ql.jpg'
          ).replaceAll( '_T_',  '_' + tile_id + '_');
}            

function get_img_src_peps( stem, tile_id )    // S2B_MSIL2A_20181031T101139_N0211_R022_T_20190116T215303
{ 
    var s2x   = stem.substr(0,3); 
    var yyyy  = stem.substr(11,4); 
    var mm    = stem.substr(15,2); 
    var dd    = stem.substr(17,2); 

    return ( 'https://peps.cnes.fr/quicklook'
            + '/' + yyyy + '/' + mm  +  '/' + dd + '/' + s2x
            + '/' + stem + '_quicklook.jpg'
           ).replaceAll( '_T_',  '_' + tile_id + '_'); //e.g.  _T_ to _T32TML_
}           

function get_img_src_peps_proxy( stem, tile_id )    // S2B_MSIL2A_20181031T101139_N0211_R022_T_20190116T215303
{ 
    var s2x   = stem.substr(0,3); 
    var yyyy  = stem.substr(11,4); 
    var mm    = stem.substr(15,2); 
    var dd    = stem.substr(17,2); 

    return ( 'https://peps.cnes.fr.sentineltwosardinia.workers.dev'
            + '/' + yyyy + '/' + mm  +  '/' + dd + '/' + s2x
            + '/' + stem + '_quicklook.jpg'
           ).replaceAll( '_T_',  '_' + tile_id + '_'); //e.g.  _T_ to _T32TML_
}     

function get_img_src_roda( stem, tile_id, count )    // S2B_MSIL2A_20181031T101139_N0211_R022_T_20190116T215303
{ 
    var yyyy  = stem.substr(11,4); 
    var mm    = parseInt( stem.substr(15,2) ); // removes leading zeros
    var dd    = parseInt( stem.substr(17,2) ); 

    return ( 'https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles'
            + '/' + tile_id.substr(1,2) + '/' + tile_id.substr(3,1)  +  '/' + tile_id.substr(4,2)
            + '/' + yyyy + '/' + mm  +  '/' + dd
            + '/'+count+'/preview.jpg'
           ).replaceAll( '_T_',  '_' + tile_id + '_'); //e.g.  _T_ to _T32TML_
}           
// https://roda.sentinel-hub.com/sentinel-s2-l1c/tiles/32/T/NL/2018/10/14/0/preview.jpg
