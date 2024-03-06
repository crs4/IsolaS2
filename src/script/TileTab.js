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

function get_days( date, today )
{
    date = new Date(date.substr(0,10));
    //calculate time difference  
    const time_diff = today.getTime() - date.getTime();  
    //calculate days difference by dividing total milliseconds in a day  
    return Math.floor(time_diff / (1000 * 60 * 60 * 24));
}


///////////////   MAIN

// 1. get tile and stems from Search object - e.g. ?&tile=T32TML&stems=......
var params = searchToObject();
if( !params || !params.stems || !params.tile )
{
  console.log('no params provided - using defaults' );
  if( !params ||  !params.tile ) params.tile='T32TMK';
  if( !params || !params.stems  ) params.stems='S2B_MSIL2A_20210521T101559_N0300_R065_T_20210521T135728+S2B_MSIL2A_20210521T101559_N0300_R065_T_20210521T131630';
}

console.log('params: ' + params.tile + ' ' + params.stems );


var yyyymmdd = params.stems.substr(11,8);
var day = yyyymmdd.substr(0,4) + '-' +  yyyymmdd.substr(4,2) + '-' + yyyymmdd.substr(6,2);

document.title = params.tile + ' - ' + day + ' | ' + document.title;
var tile_id = params.tile;
var stemArr = params.stems.split('+');


// Assign stems as col ids
var els = document.querySelectorAll('div.row > div.col');
var max = stemArr.length;
if( 2 < stemArr.length ) max = 2;
console.log('stemArr.length: ' + stemArr.length + ' ' + max);

for( var i=0,count=0; i< max; i++ )
{
 var el = els[i];
  el.classList.remove('off'); // display this column / panel
  el.id = stemArr[i].replaceAll( '_T_',  '_' + tile_id + '_'); // assign id
  el.getElementsByClassName('day' )[0].textContent = day;
  el.getElementsByClassName('tile')[0].textContent = tile_id.substr(1);

  document.getElementById('EOB').setAttribute( 'day', day );

  var tile_el = el.querySelector('div.img');
  tile_el.setAttribute( 'day', day );
  
  var img_src = get_img_src_dataspace( stemArr[i], tile_id );
  var alt_str =
              get_img_src_peps( stemArr[i], tile_id ) 
              +','
              + get_img_src_roda( stemArr[i], tile_id, count++ );
  
  insert_image( tile_el, img_src, alt_str );
/*  
  var img_el =  el.querySelector('div.img > img');
  img_el.alt = 'Image loading...';
  img_el.setAttribute('data-alternative', 
       get_img_src_peps( stemArr[i], tile_id ) 
       +','
       + get_img_src_roda( stemArr[i], tile_id, count++ )
  );
  img_el.onerror = loadAlternative; // a function
  img_el.src = get_img_src_creodias( stemArr[i], tile_id ) ; // triggers load or  onerror
*/
}

function insert_image( tile_el, img_src, alt_str ) // now without assigning innerHTML
{
    tile_el.replaceChildren(); // clear any existing contents of tile
    var img_el =  tile_el.appendChild( document.createElement('img') ); // now insert the IMG

    img_el.alt = 'Image loading...';
    img_el.setAttribute('data-alternative', alt_str );
    // if( alt_str.includes('roda.sentinel-hub.com') ) el.onload = fix_roda;
    img_el.onerror = loadAlternative; // a event listening function
    img_el.src = img_src;  // triggers load or  onerror
}



// Show warning if 2 days have not yet passed since acquistion
var yyyy_mm_dd = yyyymmdd.substr(0,4) + '-' +  yyyymmdd.substr(4,2) + '-' +  yyyymmdd.substr(6,2)
const today = new Date();
var days = get_days( yyyy_mm_dd, today );
console.log('days: ',days)
if (days < 2) 
{
  var els = document.getElementsByClassName('warn');
  for( var i=0; i< els.length; i++ )   els[i].classList.add("on");
  var els = document.getElementsByClassName('fail');
  for( var i=0; i< els.length; i++ )   els[i].classList.add("off");
  var els = document.getElementsByClassName('info');
  for( var i=0; i< els.length; i++ )   els[i].classList.add("off");
}

// now assign links by consulting the MTD
var els = document.querySelectorAll('div.row div.col[id]');

for( var i=0; i<els.length; i++ )
{
  var product = els[i].id;
    console.log('MTD '+ i + ': ' + product );
  mtd_url_bak = get_creodias_mtd_url( product );
//mtd_url = get_google_mtd_url( product ); 
  // mtd_url += 'XX';
  mtd_url = get_google_proxy_mtd_url( product ); // via CORS reverse proxy to avoid failure
  console.log('mtd_url', mtd_url );
  do_fetch_mtd( mtd_url ); //, mtd_url_bak ); // callback = update_links
}


////////////////// end of MAIN

function getImageCoords( ev )
{
 var el = ev.target;
//console.log("tagName: ", el.tagName );
  var posX = ev.offsetX ? (ev.offsetX) : ev.pageX - el.offsetLeft;
  var posY = ev.offsetY ? (ev.offsetY) : ev.pageY - el.offsetTop;
//console.log("posX posY: ", posX, posY );
  var ulx = parseInt(el.parentElement.getAttribute( 'ulx' ));
  var uly = parseInt(el.parentElement.getAttribute( 'uly' ));
  var hemisphere = 'N';
  var zone = el.parentElement.getAttribute('zone');
//console.log("ulx uly zone: ", ulx, uly, zone );
  var width  = el.clientWidth;
  var height = el.clientHeight; 
//console.log("width height: ", width, height );
  var utm_x = Math.floor( ulx + (posX * 109800)/  width ); // 109800 = 100km + 2 margins of 4900 m
  var utm_y = Math.floor( uly - (posY * 109800)/  height);
  console.log("utm_x utm_y: ", utm_x, utm_y );
  var myArr = UTM2latlng( utm_y, utm_x, zone ) // northing, easting, zone e.g. 32N
  document.getElementById('lat').value = myArr[0].toFixed(2);
  document.getElementById('lng').value = myArr[1].toFixed(2);
  document.getElementById('zoom').value = 16;
  document.getElementById('EOB').onclick = eobrowser;
  document.getElementById('GMaps').onclick = GMaps;
}

// https://apps.sentinel-hub.com/eo-browser/?lat=40.092&lng=8.357&zoom=16&time=2019-08-10&preset=1_TRUE_COLOR&datasource=Sentinel-2%20L2A
function activate_img( xml_data, product )
{
    var ulx = xml_data.querySelector('ULX').textContent;
    var uly = xml_data.querySelector('ULY').textContent;
    var zone= xml_data.querySelector('HORIZONTAL_CS_NAME').textContent; // WGS84 / UTM zone 32N
    zone = zone.split(' ').pop(); // 32N
    console.log('ULX ULY zone: ', ulx,  uly, zone );
    var el = document.querySelector('#' + product + ' .img');
    el.setAttribute( 'ulx',  ulx ); 
    el.setAttribute( 'uly',  uly );
    el.setAttribute( 'zone', zone );
    el.onclick =  getImageCoords;
}


/////////////////////////////////////////////////////////////////
function do_fetch_mtd( url) //, url_bak )
{
const exception = new Error(); 
exception.name = "CustomError";
exception.response = { status: 0, data: {detail: "my custom error"} };

  fetch( url ) //, { headers: {'Origin': document.location.origin } } )
    .then((response) => {
          if(response.ok) {
             return response.text();
         }
         exception.response.status = response.status;
         throw exception
    })
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(xml_data => {
         update_links( xml_data ); // call back
     })
     .catch((err) => {
          // if( url_bak ) do_fetch_mtd( url_bak, null ); // on fail try proxy
          // else
          if( err.response && err.response.status == 429 ) // Too many requests so wait and retry
          {
            console.log('429 retrying in 1s: ' + url );
            setTimeout(() => { do_fetch_mtd( url ) },1000);
          }
          else
            myError('mtd failed even via proxy');            // failed even via proxy
     });
}

function do_fetch_mtd_tl( url, product )
{
const exception = new Error(); 
exception.name = "CustomError";
exception.response = { status: 0, data: {detail: "my custom error"} };

  fetch( url )
    .then((response) => {
          if(response.ok) {
             return response.text();
         }
         exception.response.status = response.status;
         throw exception
    })
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(xml_data => {
         activate_img( xml_data, product ); // call back
     })
     .catch((err) => {
          // if( url_bak ) do_fetch_mtd_tl( url_bak, null, product ); // on fail try proxy
          // else
          if( err.response && err.response.status == 429 ) // Too many requests so wait and retry
          {
            console.log('429 retrying in 1s: ' + url );
            setTimeout(() => { do_fetch_mtd_tl( url, product ) },1000);
          }
          else
            myError('mtd failed even via proxy');            // failed even via proxy
     });

}

function myError( statusText )
{
 console.log('MTD: ' + statusText);
 var els = document.getElementsByClassName('links');
  for( var i=0; i< els.length; i++ )
  {
     els[i].textContent = 'L2A metadata: not (yet) available';
     els[i].classList.add('failed');
     console.log('L2A metadata: ' + statusText );
  }
  els = document.getElementsByClassName('info');
  for( var i=0; i< els.length; i++ ) els[i].classList.add("off");

}

/////////////////////////////////////////////////////////////////

function eobrowser(ev) // handler
{
//var BASE = 'https://browser.creodias.eu/#';
 var BASE = 'https://apps.sentinel-hub.com/eo-browser/?';
 var el = ev.target;
     var lat = document.getElementById('lat').value;
     var lng = document.getElementById('lng').value;
     var zoom= document.getElementById('zoom').value;
     var day = el.getAttribute('day');
     console.log('EOB', day, lat, lng, zoom );
     if( !day ) return;
     
     var url = BASE
             + 'lat=' + lat + '&lng=' + lng + '&zoom=' + zoom
             + '&time=' + day + '&preset=1_TRUE_COLOR&datasource=Sentinel-2%20L2A';
     console.log('EOB url: ' + url );
     window.open( url, '_EOB' ).focus();
}

function GMaps(ev) // handler
{
 var el = ev.target;
     var lat = document.getElementById('lat').value;
     var lng = document.getElementById('lng').value;
     var zoom= document.getElementById('zoom').value;

     var url = 'https://www.google.com/maps/@?api=1&map_action=map&center='+ lat+'%2C'+lng+'&zoom='+zoom+'&basemap=satellite' ;
     console.log('GMaps url: ' + url );
     window.open( url, '_GMaps' ).focus();
}

function quality_check( xml_data )
{
   var els = xml_data.querySelectorAll('Quality_Control_Checks > Quality_Inspections > quality_check');
   for( var i=0; i<els.length; i++ )
     if( els[i].textContent ==  'FAILED' ) return 0;
   return 1;
}   


function update_links( xml_data ) 
{
  var product = xml_data.querySelector('PRODUCT_URI').textContent.substr(0,60);
// S2B_MSIL2A_20210521T101559_N0300_R065_T32TMK_20210521T131630.SAFE
  console.log('product: ' + product );
  
  if( !quality_check( xml_data ) )
  {
    console.log('quality check failed\n');
    var els = document.getElementsByClassName('fail');
    for( var i=0; i< els.length; i++ )   els[i].classList.add("on");
    var els = document.getElementsByClassName('warn');
    for( var i=0; i< els.length; i++ )   els[i].classList.add("off");
    var els = document.getElementsByClassName('info');
    for( var i=0; i< els.length; i++ )   els[i].classList.add("off");
  }
  var xml_el = xml_data.querySelector('IMAGE_FILE');              // just get the first
  if( !xml_el ) xml_el = xml_data.querySelector('IMAGE_FILE_2A'); // hack prior to 2018
  if( !xml_el ) 
  {
    var els = document.getElementsByClassName('links');
    for( var i=0; i< els.length; i++ )
    {
          els[i].textContent = 'L2A metadata: not (yet) available';
          els[i].classList.add('failed');
    }
    els = document.getElementsByClassName('info');
    for( var i=0; i< els.length; i++ ) els[i].classList.add("off");
    return;
  }
  var image_file = xml_el.textContent; // GRANULE/L2A_T32TML_A025044_20200408T101923/IMG_DATA/R10m/T32TML_20200408T101021_B02_10m

  var els = document.querySelectorAll('#' + product + ' .links a[href]');
  console.log('update_links els.length: ' + els.length + ' ' + product );
  for( var i=0; i<els.length; i++ )
  {
    var band_str = els[i].textContent + '_10m.jp2'; // e.g. B03_10m.jp2
    els[i].href = get_google_url( product, image_file, band_str );
    els[i].target = '_blank';
  }
  
  var mtd_tl_url_bak = get_creodias_mtd_tl_url( product, image_file );
  // mtd_tl_url += 'XX';
  var mtd_tl_url = get_google_proxy_mtd_tl_url( product, image_file );
  console.log('mtd_tl_url: ', mtd_tl_url );
  do_fetch_mtd_tl( mtd_tl_url, product ); // callback = activate_img

}


///////////////////////////////////////////////////////////////

function get_google_url( product, image_file, band_str ) // band_str ends with '.jp2' which is missing in image_file
{ 
 var subdir= product.substr(39,2) + '/' + product.substr(41,1) + '/' + product.substr(42,2); // e.g 32/T/ML
//  return( 'https://storage.cloud.google.com/gcp-public-data-sentinel-2/L2/tiles'
    return( 'https://storage.googleapis.com/gcp-public-data-sentinel-2/L2/tiles'
            + '/' + subdir
            + '/' + product + '.SAFE'
            + '/' + image_file.replace( 'B02_10m',  band_str )
          );
}            

///////////////////////////////////////////////////////////////////////

function get_creodias_mtd_url( product )
{
 var subdir = product.substr(11,4) + '/' + product.substr(15,2) + '/' + product.substr(17,2); // e.g 2022/10/30
 var site = 'https://finder.creodias.eu/files/Sentinel-2/MSI/L2A';
  return ( site + '/' + subdir  + '/' + product + '.SAFE/MTD_MSIL2A.xml' );
}

https://finder.creodias.eu/files/Sentinel-2/MSI/L2A/2022/10/30/S2B_MSIL2A_20221030T101039_N0400_R022_T32TMK_20221030T125556.SAFE/MTD_MSIL2A.xml

function get_google_mtd_url( product ) 
{ 
 var subdir= product.substr(39,2) + '/' + product.substr(41,1) + '/' + product.substr(42,2); // e.g 32/T/ML
 var  site = 'https://storage.googleapis.com/gcp-public-data-sentinel-2/L2/tiles'; 
  return( site + '/' + subdir  + '/' + product + '.SAFE/MTD_MSIL2A.xml' );
} 

function get_google_proxy_mtd_url( product ) // cloudflare reverse proxy into https://storage.googleapis.com/gcp-public-data-sentinel-2/L2/tiles
{ 
 var subdir= product.substr(39,2) + '/' + product.substr(41,1) + '/' + product.substr(42,2); // e.g 32/T/ML
 var  site = 'https://gentle-leaf-64c5.sentineltwosardinia.workers.dev'; 
  return( site + '/' + subdir  + '/' + product + '.SAFE/MTD_MSIL2A.xml' );
} 

///////////////////////////////////////////////////////////////////////

function get_creodias_mtd_tl_url( product, image_file )
{
 var subdir = product.substr(11,4) + '/' + product.substr(15,2) + '/' + product.substr(17,2); // e.g 2022/10/30
 var site = 'https://finder.creodias.eu/files/Sentinel-2/MSI/L2A';
 var myArr = image_file.split('/');
// GRANULE/L2A_T32TML_A014920_20200114T101254/MTD_TL.xml
  return( site + '/' + subdir  + '/' + product + '.SAFE/' + myArr[0] + '/' + myArr[1] + '/MTD_TL.xml' );
}

function get_google_mtd_tl_url( product, image_file ) 
{ 
 var subdir= product.substr(39,2) + '/' + product.substr(41,1) + '/' + product.substr(42,2); // e.g 32/T/ML
 var  site = 'https://storage.googleapis.com/gcp-public-data-sentinel-2/L2/tiles';
 var myArr = image_file.split('/');
// GRANULE/L2A_T32TML_A014920_20200114T101254/MTD_TL.xml
  return( site + '/' + subdir  + '/' + product + '.SAFE/' + myArr[0] + '/' + myArr[1] + '/MTD_TL.xml' );
} 

   
function get_google_proxy_mtd_tl_url( product, image_file ) 
{ 
 var subdir= product.substr(39,2) + '/' + product.substr(41,1) + '/' + product.substr(42,2); // e.g 32/T/ML
 var  site = 'https://gentle-leaf-64c5.sentineltwosardinia.workers.dev';
 var myArr = image_file.split('/');
// GRANULE/L2A_T32TML_A014920_20200114T101254/MTD_TL.xml
  return( site + '/' + subdir  + '/' + product + '.SAFE/' + myArr[0] + '/' + myArr[1] + '/MTD_TL.xml' );
}




