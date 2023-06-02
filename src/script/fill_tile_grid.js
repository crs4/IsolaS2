// requires load_composite.js
// requires load_calendar.js
window.CACHING=false;
window.CACHING=true;

function set_stored_month()
{
 if( !window.CACHING )  return;  

 var yyyy_mm = document.getElementById('day').getAttribute('day').substr(0,7);
    if( future_month( yyyy_mm ) != -1 )  return; // not in the past - so don't store
    var key = document.getElementById('tiles').getAttribute('name') // Sardinia 
            + '-' +  yyyy_mm ;
    try 
    {
      localStorage.setItem( key , document.getElementById('calendar').innerHTML ); 
    } 
    catch (e)     // If localstorage is full we need to clear some for next time
    {  
      console.log('localStorage is full - removing some items: ' + e );
      var keyArr=[];
      for( var i=0; i<localStorage.length/2; i++ ) // remove first half of items
         keyArr.push(localStorage.key(i));
      for( var i=0; i<keyArr.length; i++ ) 
        localStorage.removeItem( keyArr(i) );
    }
}

function get_stored_month( yyyy_mm )
{
 if( !window.CACHING )  return('');  

 var key = document.getElementById('tiles').getAttribute('name') // Sardinia
         + '-' +  yyyy_mm ;
 return( localStorage.getItem( key , key ) );  
}


function searchToObject() { // https://stackoverflow.com/a/7090123/3507061
  var pairs = window.location.search.substring(1).split("&");
  var obj = {};
  for ( var i in pairs ) {
    if ( pairs[i] === "" ) continue;
    pair = pairs[i].split("=");
    obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
  }
  return obj;
}


// polygon = 'POLYGON((8.02+39,10.12+39,10.12+41,8.02+41,8.02+39))'; // Sardinia

function get_creodias_url_proxy( polygon, day1, day2 )
{
 var  site = 'https://creodias.sentineltwosardinia.workers.dev'; // CORS proxy
//return( 'https://datahub.creodias.eu/resto/api/collections/Sentinel2/search.json?maxRecords=400&startDate='
  return( site + '/' + 'search.json?maxRecords=400&startDate='
          + day1 + 'T00:00:00Z&completionDate=' + day2 + 'T23:59:59Z&geometry=' + polygon
          + '&sortParam=startDate&sortOrder=descending&status=all&dataset=ESA-DATASET'
  );
}

function get_creodias_url( polygon, day1, day2 )
{
//return( 'https://datahub.creodias.eu/resto/api/collections/Sentinel2/search.json?maxRecords=400&productIdentifier=%2532%25&startDate='
  return( 'https://datahub.creodias.eu/resto/api/collections/Sentinel2/search.json?maxRecords=400&startDate='
          + day1 + 'T00:00:00Z&completionDate=' + day2 + 'T23:59:59Z&geometry=' + polygon
          + '&sortParam=startDate&sortOrder=descending&status=all&dataset=ESA-DATASET'
  );
}


function get_fetch_url( is_proxy, is_resto, polygon, day1, day2 )
{
 const DIRECT_SITE = 'https://datahub.creodias.eu';
 const RESTO_PROXY = 'https://creodias.sentineltwosardinia.workers.dev';
 const ODATA_PROXY = 'https://odata.sentineltwosardinia.workers.dev';
 const RESTO_PATH = '/resto/api/collections/Sentinel2/';
 const ODATA_PATH = '/odata/v1/';

  let url = DIRECT_SITE;
  if( is_proxy )
  {
      if( is_resto ) url = RESTO_PROXY; // n.b. the proxy already embeds the path
      else           url = ODATA_PROXY;
  }
  else
  {
     if( is_resto ) url += RESTO_PATH;
     else           url += ODATA_PATH;
  }

  if( is_resto )
    url +=  'search.json?maxRecords=400&startDate='
    + day1 + 'T00:00:00Z&completionDate=' + day2 + 'T23:59:59Z&geometry=' + polygon
    + '&sortParam=startDate&sortOrder=descending&status=all&dataset=ESA-DATASET';
  else // odata
    url +=  'Products?$filter=Collection/Name%20eq%20%27SENTINEL-2%27%20and%20ContentDate/Start%20gt%20'
    + day1
    + 'T00:00:00.000Z%20and%20ContentDate/Start%20lt%20'
    + day2
    + 'T23:59:59.999Z%20and%20OData.CSC.Intersects(area=geography%27SRID=4326;'
    +  polygon //.replace('+', '%20')
    + '%27)&$expand=Attributes&$top=400' ;
  
  console.log( 'url:' + url );
  return url;
}

/*
https://datahub.creodias.eu/odata/v1/
Products?$filter=Collection/Name%20eq%20%27SENTINEL-2%27%20and%20ContentDate/Start%20gt%20
2023-02-27
T00:00:00.000Z%20and%20ContentDate/Start%20lt%20
2023-02-27
T23:59:59.999Z%20and%20OData.CSC.Intersects(area=geography%27SRID=4326;
POLYGON((8.02%2039,10.12%2039,10.12%2041,8.02%2041,8.02%2039))
%27)&$expand=Attributes&$top=400
*/


function isDate(str) { // https://stackoverflow.com/a/51759570/3507061
  return( 'string' === typeof str && (dt = new Date(str)) && !isNaN(dt) && str === dt.toISOString().substr(0, 10) );
}


function get_day_from_params() // from search string in url
{
  var params = searchToObject();
  console.log('params: ' + params.day  );
  if( params.day &&  isDate( params.day ) )  return( params.day );
  return(''); 
}

function get_yyyy_mm( els )
{
  var day =  els[Math.floor(els.length/2)].getAttribute('date'); // some day mid month
  return day.substr(0,7)
}

function future_month( yyyy_mm ) // reurns either past:-1, this: 0, future: 1
{
   var yyyy = yyyy_mm.substr(0,4);
   var mm   = yyyy_mm.substr(5,2);
   var today_str = new Date().toISOString().substring(0,10); // yyyy-mm-dd
   var yyyy_t = today_str.substr(0,4);
   var mm_t   = today_str.substr(5,2);
   if( yyyy  < yyyy_t ) return -1; // in the past
   if( yyyy  > yyyy_t ) return  1; // in the future
   if( mm    <   mm_t ) return -1; // in the past
   if( mm    >   mm_t ) return  1; // in the future
   return 0; // i.e. this month
}

function fill_tile_grid( ) 
{ 
  var polygon  = document.getElementById('tiles').getAttribute('polygon' ); // guaranteed to exist
  var day1,day2;
  var els = document.querySelectorAll('#calendar .dom');
  if( !els.length )
  {
      console.log('Error: no valid calendar found on page');
      return;
      // legacy single day version
      // day1 = get_day_from_params();
      // if( day1 ) document.getElementById('tiles').setAttribute('day', day1);
      // else       day1 = document.getElementById('tiles').getAttribute('day');
      // day2 = day1;
  }
  day1 = els[0].getAttribute('date');
  day2 = els[els.length-1].getAttribute('date');
  var orbitArr = list_orbits(); // integer array
  for( var i=0; i<els.length; i++ ) // mark transit days in red
         if( is_transit_day( orbitArr, els[i].getAttribute('date') ) ) els[i].classList.add('due');
         
  // abort query if whole month is in the future
  var yyyy_mm = get_yyyy_mm( els );
  var month_state = future_month( yyyy_mm ); // past:-1, this: 0, future: +1
  if( month_state == 1) return; // no fetching since month is in the future
     
  // try to use local storage cached month

  var stored_html = get_stored_month( yyyy_mm );
  if( stored_html ) 
  {   // should purify stored_html before using it DOMPurify.sanitize(stored_html);
      document.getElementById('calendar').innerHTML = stored_html;               // XSS vunerability
      // now add onclick handlers and load_tiles
      var els = document.querySelectorAll('#calendar .dom[cloud]');
      for( var i=0; i< els.length; i++ )
         els[i].onclick = function(ev) { load_tiles( ev.target.getAttribute('date') ); };
      // get latest date shown in calendar
      var latest_day =  get_latest_day(); // '2018-10-31' ;//'2021-05-21';
      load_tiles( latest_day );
      return ; // done
  }
  
  document.title =  document.title.split('-')[0] + ' - ' + day1;
 
//var url_direct = get_creodias_url( polygon, day1, day2 );
//var url_proxy  = get_creodias_url_proxy( polygon, day1, day2 );
  var url_direct = get_fetch_url( false, false, polygon, day1, day2 );
  var url_proxy  = get_fetch_url( true,  false, polygon, day1, day2 );
  do_fetch( url_direct, url_proxy );  // Hope direct comes back one day
}
  
function do_fetch( url, url_bak )
{
  deactivate_ui();
  fetch( url ) //, { headers: {'Origin': document.location.origin } } )
      .then((response) => {
          if(response.ok) {
             return response.json();
         }
         throw new Error("fetching creodias failed ****");
      })
      .then((jsonResponse) => { process_features(jsonResponse) })
      .catch((error) => {
          if( url_bak )
              do_fetch( url_bak, null ); // on fail try proxy
          else
            activate_ui();            // failed even via proxy
      });

}



function lookup_index( itemArr, key)
{
  for( var i=0; i<itemArr.length; i++ )
    if( key == itemArr[i].key ) return (i); // found
  return (-1); // not found
}

function get_tileArr()
{
  var els = document.querySelectorAll('#tiles div[orbits]');
  var myArr=[];
  for( var i=0; i<els.length; i++ )
      myArr[i] = els[i].id;
  return myArr;  
}

function process_features( json )
{
var itemArr = [];

  if( json.features && json.features.length ) {  // resto
    console.log('features.length', json.features.length);
    arr_to_items( true, itemArr, json.features );
  }
  else if( json.value && json.value.length) {    // odata
    console.log('value.length', json.value.length);
    arr_to_items( false, itemArr, json.value );
  } else {                                     // no data
    console.log('No data found.');
    activate_ui();
    return;
  }

    console.log('2 itemArr:', itemArr);
    itemArr.sort( compareItems ); 
    console.log( 'itemArr: ', itemArr );
    average_cloud( itemArr );
    
    for( ; ; ) //remove rare rogue duplicates and NOBS
    { 
      var dup = find_duplicate( itemArr );
      if ( dup == -1 ) break; // out of loop
      //console.log('dup:', dup );
      itemArr.splice(dup, 1); // delete the item from the array
    }
    deploy_items( itemArr );    // in calendar // now sorts
    set_stored_month();

   // get latest date shown in calendar
   var latest_day =  get_latest_day(); // '2018-10-31' ;//'2021-05-21';
   load_tiles( latest_day );
}
// use localStorage.clear();

//console.log('features[0].properties.title', features[0].properties.title);
   //  0   1a 1b         2         3     4    5             6  
   // S2B_MSIL1C_20210508T100549_N0300_R022_T32TNL_20210508T140010.SAFE

function arr_to_items( resto, itemArr, arr )
{   
    const tileArr = get_tileArr();
    for( var i=0; i<arr.length; i++ )
    { 
      let id;
      if( resto ) id = arr[i].properties.title;
      else        id = arr[i].Name;  // odata
      
      id = id.split('.')[0]; // remove the .SAFE
      if( id.match(/_MSI_NOBS__/) ) continue; // next iteration
      var myArr = id.split('_');
//    var head  = myArr[0] + '_' + myArr[1].substr(0,3)  // S2B_MSI
      var level = myArr[1].substr(3,3);  // L1C
//    var utc   = myArr[2];  // 20210508T100549
      var proc  = myArr[3];  // N0300 // 
      if( proc == 'N9999' ) continue; // next iteration (experimental processor)

      var orbit = myArr[4];  // R022
      var tile  = myArr[5];  // T32TML
      
      // filter out extraneous tiles 
      if( ! tileArr.includes( tile ) )  continue; // next iteration
      var orbits = document.getElementById( tile ).getAttribute('orbits');
      if( ! orbits.includes( orbit ) )  continue; // next iteration
      
      
      var key   = level +'_' + myArr[6];  // L1C_20210508T140010
      id =  myArr[0] + '_' + myArr[1] + '_' + myArr[2] + '_' + myArr[3] + '_' + myArr[4] + '_T_' + myArr[6]; // excise tile
      var cloud =0;
      if( resto ) cloud = arr[i].properties.cloudCover; // floating point percentage
      else
      {   const atts = arr[i].Attributes;              // odata
          for( var j=0; j<atts.length ; j++ )
          {
             const att = atts[j];
             if( att.Name && att.Name == "cloudCover"  && att.Value )
             {
                 cloud = att.Value;
                 break;
             }
          }
      }
      
      var indx = lookup_index( itemArr, key );
      //console.log( indx, 'feature:', key, level, tile, id );
      if( indx != -1 ) // found existing item
      {
         itemArr[indx].tiles.push( tile.substr(1) ); // e.g. 32TML
         itemArr[indx].cloud += cloud; // keep the sum - to average later
      }
      else 
      {  // create a new object in the item array
        itemArr.push({
          key: key,
          cloud: cloud,
          id: id,
          level: level,
          tiles: [ tile.substr(1) ] // array inside object
        });
      }
    }
}

function compareItems( a, b ) { // itemArr.sort comparision function
 const aa = a.id.substr(7); // starting at level
 const bb = b.id.substr(7);
  if ( aa < bb )    return -1;
  if ( aa > bb )    return +1;
  return 0;
}

function get_latest_day()
{
  var els = document.querySelectorAll('#calendar .dom');
  for( var i=els.length-1 ; 0<=i; i-- ) // search backwards
  {
    var el = els[i]
    if( el.getAttribute('L1C') || el.getAttribute('L2A') )  return el.getAttribute('date');
  }
  console.log('Warning: no latest date found in calendar using default')
  return document.getElementById('tiles').getAttribute('day');
}

function average_cloud( itemArr )
{
   for( var i=0; i<itemArr.length; i++ )
   {
     var obj_i  = itemArr[i];
     var n = obj_i.tiles.length;
     obj_i.cloud = obj_i.cloud/n; // cloud = cloud/n
     
   }
}

function find_duplicate( itemArr ) // S2B_MSIL2A_20181031T101139_N0211_R022_T
{                                  // S2B_MSIL2A_20181031T101139_N0209_R022_T
const len_max = document.querySelectorAll('#tiles > div').length;
   for( var i=0; i<itemArr.length; i++ ) // O(n^2) 
   {
     var obj_i  = itemArr[i];
     var stem_i = obj_i.id.substr(0,27); // S2B_MSIL2A_20181031T101139_
     var utc_i  = obj_i.key.substr(4); 
//   if( stem_i.match(/_NOBS__/) )
//   {
//       console.log('find_duplicate: NOBS being eliminated: ', obj_i.id )
//       return( i );  // eliminate any NOBS early experimental products
//   }
     
     var proc_i = obj_i.id.substr(27,5); // N0211
     var len_i  = obj_i.tiles.length;    // number of tiles

      for( var j=i+1; j<itemArr.length; j++ )
      {
         var obj_j   = itemArr[j];
         var stem_j = obj_j.id.substr(0,27); // S2B_MSIL2A_20181031T101139_
         var utc_j  = obj_j.key.substr(4); 
         var len_j  = obj_j.tiles.length;    // number of tiles
         var proc_j = obj_j.id.substr(27,5); // N0209
         
// Darwin
// S2B_MSIL1C_20190609T013719_N0207_R031_T_20190626T082128 52LFM 52LFN 52LGM 52LGN 52LHM 52LHN
// S2B_MSIL1C_20190609T013719_N0207_R031_T_20190609T030326 52LFM 52LFN 52LGM 52LGN 52LHM 52LHN
// Yorkshire
// S2B_MSIL2A_20190507T110629_N0212_R137_T_20190507T130231 30UWE 30UWF 30UWG 30UXE 30UXF 30UXG
// S2B_MSIL2A_20190507T110629_N0212_R137_T_20190524T084519 30UWE 30UWF 30UWG 30UXE 30UXF 30UXG
//
         if( (stem_i == stem_j) && (len_i == len_max ) && (len_j == len_max ) && (4 < len_i ) ) // nasty edge case
         { // avoids labelling split where there are rare full duplicates
            console.log('find_rare duplicate: ', i, utc_i, stem_i, proc_i, len_i,  j, utc_j, stem_j, proc_j, len_j );
            if( proc_i < proc_j ) return (j); // keep the product oldest baseline
            else                  return (i);
         }
         if( (stem_i + utc_i) == (stem_j + utc_j) ) // found
         {
           console.log('find_duplicateN: ', i, utc_i, stem_i, proc_i, len_i,  j, utc_j, stem_j, proc_j, len_j );
           if( len_i == len_j )
           {
              if( proc_i < proc_j ) return (j); // keep the product oldest baseline
              else                  return (i);
           }
           if( len_i < len_j )     return (i); // return item index with least number of tiles // to be deleted
           else                    return (j);
         }
      }
   }
   return (-1); // not found
}

function sort_tiles( itemArr )
{
   for( var i=0; i<itemArr.length; i++ )
   {
      itemArr[i].tiles.sort();
   }
}

function deploy_items( itemArr )
{
   for( var i=0; i<itemArr.length; i++ ) // S2B_MSIL1C_20191129T095249_N0208_R079_T_20191201T134050
   {
     var obj=itemArr[i];
     var item_day = obj.id.substr(11,4) + '-' + obj.id.substr(15,2) + '-' + obj.id.substr(17,2);
     //console.log('item_day: ', item_day );
     var selector = "#calendar div.dom[date='" + item_day + "']";
     //console.log( 'selector: ' + selector );
     var cal_el = document.querySelector( selector );
     if( !cal_el ) 
     {
        console.log( 'Warning: not found in calendar: ' + item_day, obj.id );
     }
     else
     { var val = obj.id + ' ' + obj.tiles.sort().join(' '); // now sorting alphanumerically
       var att = cal_el.getAttribute( obj.level ); //  (2nd time) not empty for split tiles
       if( att ) // we have a split
       {
           val = att + '+' + val;
           cal_el.classList.add('split');
       }
       cal_el.setAttribute( obj.level, val );
       if( !cal_el.getAttribute('cloud') ) // cloud: use L1C (1st) over L2A (2nd) // Hebrides-2018-05-06
       {
         var label ='☀';
         if( obj.cloud > 10.0 ) {label='⛅'};
         if( obj.cloud > 75.0 ) {label='☁'};
         cal_el.setAttribute('cloud', label ); 
       }
       cal_el.onclick = function(ev) { load_tiles( ev.target.getAttribute('date') ); };
     }
   }
   var els = document.querySelectorAll('#calendar div.dom.split[L1C][L2A]'); // getAttribute guaranteed
   for( var i=0; i<els.length; i++ ) // remove any split that weirdly occurs in L1C but not L2A
   {
     var el = els[i];
      if( el.getAttribute('L2A').includes('+') ) return; // no change needed
      if( el.getAttribute('L1C').includes('+') ) el.classList.remove('split');
   }
}


function load_tiles( day )
{
  var day_el = document.querySelector('#calendar .dom[date="'+day+'"]');
  if( ! day_el )
  {
     console.log('load_tiles - date not found in calendar: ', day);
     activate_ui(); // so the user can nagivate to last month - say
     return ;
  }
  document.title =  document.title.split('-')[0] + ' - ' + day;

  var L1C = day_el.getAttribute('L1C');
  var L2A = day_el.getAttribute('L2A'); 

  if( !L1C && !L2A )
  {
     console.log('load_tiles - neither L1C nor L2A found on day: ', day);
     activate_ui(); // so the user can nagivate to last month - say
     return ;
  }
  var el = document.querySelector('#calendar .dom.shown');
  if( el ) el.classList.remove('shown');
  day_el.classList.add('shown');
    
    // fill item tile grid with images
    var tile_els = document.querySelectorAll('#tiles > div.grid-item');
    for( var i=0; i<tile_els.length; i++ ) //for each tile
    {

      var tile_el = tile_els[i];
      tile_el.textContent = ''; // blank an existing tile
      // unlinkify
      if( tile_el.onclick ) tile_el.onclick = null; // remove onclick handlers from tile
      tile_el.classList.remove('active'); // switch off

      var tile_id = tile_el.id;        // e.g. T32TML
      var tile    = tile_id.substr(1); // e.g.  32TML
      var orbits = tile_el.getAttribute('orbits'); // if empty then the tile will remain blank

      if( orbits && L2A && L2A.includes( tile ) )
      {
          if( !L2A.includes('+') ) { simple_img2( L2A, L1C, tile_el, '✅' ); } // emoji Check Mark Button
          else // L2A: split possible
          {
             split_possible2( L2A, L1C, tile_el, '📉', '✅' );
          }
      }
      else if ( orbits && L1C && L1C.includes( tile ) )
      {
          if( !L1C.includes('+') ) { simple_img( L1C, tile_el, '🟡' ); } // Yellow circle
          else // L1C: split possible
          {
             split_possible1( L1C, tile_el, '📉','🟡' );
          }
      }
      else // no L1C nor L2A // make sure it becomes empty
      { 
        console.log('empty tile: ', tile_id );
        label_tile( tile_el, '⚪' ); // emoji White circle
      }
      
    }
    activate_ui();
}


function activate_ui()
{  
 var el = document.getElementById('day');
  if( el ) el.classList.remove('has-overlay');
}

function deactivate_ui()
{
 var el = document.getElementById('day');
  if( el ) el.classList.add('has-overlay');
}

function split_possible1( L1C, tile_el, label1, label2 )
{            
    var L1CArr = L1C.split('+');
    var tile_id = tile_el.id;    
    var tile = tile_id.substr(1); 
    if( L1CArr[0].includes(tile) && L1CArr[1].includes(tile)) // split found
    {
       mk_composite1( L1CArr, tile_id ); 
       label_tile( tile_el, label1 ); // Chart with Downwards Trend 
    } 
    else  
    {
        if( L1CArr[0].includes(tile) ) simple_img( L1CArr[0], tile_el, label2 );
        else                           simple_img( L1CArr[1], tile_el, label2 );

    }  
}    

function split_possible2( L2A, L1C, tile_el, label1, label2 )
{            
    var L2AArr = L2A.split('+');
    var L1CArr = L1C.split('+');
    var tile_id = tile_el.id;    
    var tile = tile_id.substr(1); 
    if( L2AArr[0].includes(tile) && L2AArr[1].includes(tile)) // split found
    {
       mk_composite2( L2AArr, L1CArr, tile_id, L2AArr.length ); 
       label_tile( tile_el, label1 ); // Chart with Downwards Trend 
    } 
    else if( 1 < L1CArr.length )
    {
        if( L2AArr[0].includes(tile) ) simple_img2( L2AArr[0], L1CArr[0], tile_el, label2 );
        else                           simple_img2( L2AArr[1], L1CArr[1], tile_el, label2 );
    }  
    else 
    {
        if( L2AArr[0].includes(tile) ) simple_img( L2AArr[0], tile_el, label2 );
        else                           simple_img( L2AArr[1], tile_el, label2 );

    }  
}    


function insert_image( tile_el, img_src, alt_str ) // now without assigning innerHTML
{
    //tile_el.replaceChildren(); // clear any existing contents of tile
    var img_el =  tile_el.appendChild( document.createElement('img') ); // now insert the IMG

    img_el.alt = 'Image loading...';
    img_el.setAttribute('data-alternative', alt_str );
    if( alt_str.includes('roda.sentinel-hub.com') )
        img_el.onload = fix_roda; // will make white background black
    img_el.onerror = loadAlternative; // an event listening function
    img_el.src = img_src;  // triggers load or  onerror
}



function simple_img2( L2A, L1C, tile_el, label )
{
    // if( tile_el == null ) return;   // blank tile 
    var tile_id = tile_el.id;  
    if( L1C == null ) L1C = "";
    if( L2A == null ) L2A = "";
    var L2Astem = L2A.split(' ')[0];
    var L1Cstem = L1C.split(' ')[0];
    
    var img_src  = get_img_src_mundis( L2Astem, tile_id ) ;// + 'XX'; 
 // var img_src  = get_img_src_peps( L2Astem, tile_id );
    var alt_str ="";
    if( L2Astem ) // false: L2A peps images never seem to be available
    {
        alt_str +=  get_img_src_peps( L2Astem, tile_id ); // ???? peps quicklook only for L1C
     // alt_str +=  get_img_src_creodias( L2Astem, tile_id ); // ???? peps quicklook only for L1C
    }
    if( L1Cstem )
    {
        if(alt_str) alt_str += ',';
        alt_str +=  get_img_src_mundis( L1Cstem, tile_id ); // feb 2023
        if(alt_str) alt_str += ',';
        alt_str += get_img_src_peps( L1Cstem, tile_id ) ;// + 'XX'; 
        if(alt_str) alt_str += ',';
        alt_str += get_img_src_roda( L1Cstem, tile_id, 0 ); // fix 10/05/2023
    }

    insert_image( tile_el, img_src, alt_str );
   
    if( label != '🟡' ) // Yellow Circle
       linkify_tile( document.getElementById( tile_id ), L2Astem );
    //linkify_tile2( document.getElementById( tile_id ), L2Astem, L1Cstem );
    label_tile( tile_el, label )
}



function simple_img( str, tile_el, label )
{
    // if( tile_el == null ) return;   // blank tile 
    var tile_id = tile_el.id;  
    var stem = str.split(' ')[0];
    
    var level = stem.substr(7,3); // L1C or L2A
    //console.log('simple_img: ', str, tile_el, label, level, stem );

    var img_src = get_img_src_mundis( stem, tile_id );
    
    var alt_str =  get_img_src_peps( stem, tile_id ); 
                +  ','
                +  get_img_src_roda( stem, tile_id, 0 ); // poorman's L2C -> L1C fallback for 20181031
    
    insert_image( tile_el, img_src, alt_str );
    
    if( label != '🟡' ) // Yellow Circle
       linkify_tile( document.getElementById( tile_id ), stem );
    label_tile( tile_el, label )

}

function mk_composite1( L1CArr, tile_id )
{             
    if( 1 < L1CArr.length ) 
    {
      for( var i=0; i<L1CArr.length; i++)
         L1CArr[i] = L1CArr[i].split(' ')[0]; // just the stems
      src1 = get_img_src_mundis( L1CArr[0], tile_id );
      src2 = get_img_src_mundis( L1CArr[1], tile_id );
      
      alt_str1 += get_img_src_peps( L1CArr[0], tile_id )
               + ','
               + get_img_src_roda( L1CArr[0], tile_id,0 );
      
      alt_str2 += get_img_src_peps( L1CArr[1], tile_id )
               + ','
               + get_img_src_roda( L1CArr[1], tile_id,0 );

      load_composite( tile_id, src1, alt_str1, src2, alt_str2 );
    }
}


function mk_composite2( L2AArr, L1CArr, tile_id, link_flag )
{             
    for( var i=0; i<L2AArr.length; i++) L2AArr[i] = L2AArr[i].split(' ')[0]; // just the stems
    var src1 =  get_img_src_mundis( L2AArr[0], tile_id );
    var src2 =  get_img_src_mundis( L2AArr[1], tile_id );
    var alt_str1='',alt_str2='';
    //alt_str1 = get_img_src_peps( L2AArr[0], tile_id );
    //alt_str2 = get_img_src_peps( L2AArr[1], tile_id );
    if( 1 < L1CArr.length ) 
    {
      for( var i=0; i<L1CArr.length; i++) L1CArr[i] = L1CArr[i].split(' ')[0]; // just the stems
      
      alt_str1 += get_img_src_peps( L1CArr[0], tile_id )
               + ','
               + get_img_src_roda( L1CArr[0], tile_id,0 );
               
      alt_str2 += get_img_src_peps( L1CArr[1], tile_id )
               + ','
               + get_img_src_roda( L1CArr[1], tile_id,0 );
    }
    load_composite( tile_id, src1, alt_str1, src2, alt_str2 ); 
    if( link_flag ) 
      linkify_tile( document.getElementById( tile_id ), L2AArr.join('+') ); // stem1+stem2
//  linkify_tile2( document.getElementById( tile_id ), L2AArr.join('+'), L1CArr.join('+') ); // stem1+stem2 twice
}

function linkify_tile2( el, stems, L1Cstems )
{
  el.onclick=function() {
    var url = './downloader4.html?tile=' + this.id + '&stems=' + stems + '&L1Cstems=' + L1Cstems;
    window.open( url, '_blank' ).focus();
  };
  el.classList.add('active'); // must switch off later
}

function linkify_tile( el, stems )
{
  el.onclick=function() {
    var url = './TileTab.html?tile=' + this.id + '&stems=' + stems;
    window.open( url, '_blank' ).focus();
  };
  el.classList.add('active'); // must switch off later
}


function label_tile( el, label )
{
  var node = document.createElement('span');
  var textnode = document.createTextNode(label);
  node.appendChild(textnode);           
  el.appendChild(node);
}

function remove_duplicates(arr)  // https://stackoverflow.com/a/9229784/3507061
{
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
}

function list_orbits()
{
   var els = document.querySelectorAll('#tiles .grid-item[orbits]');
   var str = '';
   for( var i=0; i<els.length; i++ )
   {
      str += els[i].getAttribute('orbits') + ' ' ;
   }
   var myArr = remove_duplicates( str.trim().split(' ') );
   console.log('orbits are: ', myArr );
   var intArr=[];
   for( var i=0; i<myArr.length; i++ ) // convert orbits to intergers
   {
     intArr[i] = parseInt( myArr[i].substr(1) );  // remove leading 'R' first
   }
   //console.log('ints are: ', intArr );
   return( intArr );
}

function date_diff(day1,day2) // https://stackoverflow.com/a/543152/3507061
{
  var date1 = new Date(day1);
  var date2 = new Date(day2);  
  return Math.round((date1-date2)/(1000*60*60*24)); // ms to days
}

function is_transit_day( orbitArr, day ) // orbitArr contains integers not strings
{
const ref_orbit = 22; // i.e. 'R022';
const S2A_d = (date_diff(day, '2015-07-04'))%10;  // first available S2A for R022
const S2B_d = (date_diff(day, '2017-07-08'))%10;  // first available S2B for R022
//console.log('is_transit_day: ',day, S2A_d,S2B_d, orbitArr);

  for( var i=0; i<orbitArr.length; i++ )
  {
      var d =  orbitArr[i] - ref_orbit;
      if( d < 0 ) d += 143; // wrap around
      d =  Math.round( (d*10)/143 ); // 143 orbits in 10 days
      if( d == S2A_d)
      {    
//       console.log('is_transit_day: ', day, 'S2A', orbitArr[i] );
         return (1);
      }
      if( d == S2B_d)
      {    
//       console.log('is_transit_day: ', day, 'S2B', orbitArr[i] );
         return (1);
      }
      //if( (d == S2A_d) || (d == S2B_d) )   return (1);
  }
  return (0);
}      

