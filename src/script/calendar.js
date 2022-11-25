
function create_calendar( callback ) // leave empty for plain calendar
{
  var lang = document.getElementById('day').getAttribute('lang').split(' ')[0]; // could crash
  //document.getElementById('d3').textContent = "lang: " + lang;

  if( !lang ) lang = 'en';
    var html='';
    for( var i=0; i<7; i++ ) // 0 = Monday
    {
       html += '<div class="grid-item dow"></div>\n';
    }
    html += '\n';
    for( var i=7; i<49; i++ )
    {
       html += '<div class="grid-item dom"></div>\n';
    }
    document.getElementById('calendar').innerHTML = html;
    var yyyy_mm_dd = document.getElementById('day').getAttribute('day' ); // could crash
    if( !yyyy_mm_dd || ! isDate( yyyy_mm_dd ) )
      yyyy_mm_dd = new Date().toISOString().substring(0,10); // today
    mk_calendar_heading( lang, yyyy_mm_dd, callback );
    //document.getElementById('d4').textContent = "yyyy_mm_dd: " + yyyy_mm_dd;

    fill_calendar_grid( yyyy_mm_dd );
    if( callback ) callback();
}

function isDate( str ) {
  var dt;
  return 'string' === typeof str 
         && (dt = new Date(str)) 
         && !isNaN(dt) 
         && str === dt.toISOString().substr(0, 10);
}

function label_weekdays( lang )
{
  var els = document.querySelectorAll('#calendar > div.dow');
  var format='short';
  if( lang == 'sw' ) format = 'narrow';
  for( var i=0; i<els.length; i++ )
  { //https://stackoverflow.com/a/34015511/3507061
    var weekdayname =   new Date(1970, 1 - 1, i+5 ).toLocaleString( lang, { weekday: format}); // 'narrow'
    // console.log('weekdayname: ',weekdayname);
     els[i].innerHTML = weekdayname;
  }
}

function fill_month_year( lang, yyyy_mm_dd )
{
    var yyyy = yyyy_mm_dd.substr(0,4);
    document.getElementById('year').textContent = yyyy;
    var monthname = new Date( yyyy_mm_dd ).toLocaleString( lang, { month: 'short' });
    document.getElementById('month').textContent = monthname;
}

function mk_calendar_heading( lang, yyyy_mm_dd, callback ) // Mon Tue Wed etc intl language
{
  label_weekdays( lang );
  var day_el = document.getElementById('day');
  if( day_el )               // « »  ❮❮ ❯❯  ⮜ ⮞
  {
    var html = '<a id="home" href="../index.html">▲</a> <span id="prev_y">❮❮</span> <span id="prev_m">&lt;</span><span id="month">'
             + '</span> <span id="today">⦾</span> <span id="year">'
             +'</span><span id="next_m">&gt;</span> <span id="next_y">❯❯</span><span id="lang">文</span>\n';
    day_el.innerHTML = html;
    day_el.setAttribute( 'day', yyyy_mm_dd );
    fill_month_year( lang, yyyy_mm_dd );

    if( callback )
    {
        console.log('callback:', callback);
    document.getElementById('prev_m').onclick = function() { change_month( -1 ); callback(); };
    document.getElementById('next_m').onclick = function() { change_month(  1 ); callback();};
    document.getElementById('prev_y').onclick = function() { change_year( -1 ); callback();};
    document.getElementById('next_y').onclick = function() { change_year(  1 ); callback();};
    document.getElementById('today' ).onclick = function() { this_month( ); callback();};
    }
    else
    {
    document.getElementById('prev_m').onclick = function() { change_month( -1 ); };
    document.getElementById('next_m').onclick = function() { change_month(  1 ); };
    document.getElementById('prev_y').onclick = function() { change_year( -1 ); };
    document.getElementById('next_y').onclick = function() { change_year(  1 ); };
    document.getElementById('today' ).onclick = function() { this_month( ); };
    }
    document.getElementById('lang' ).onclick = function() { switch_lang( ); };
  }
}

function switch_lang( )
{
  console.log('switch_lang');
//var lang_str =  document.getElementById('day').getAttribute('lang');
  var myArr = document.getElementById('day').getAttribute('lang').split(' '); 
  if( myArr.length < 2 ) return; // do nothing

  console.log('length: ', myArr.length );
  var tmp = myArr[0];
  for( var i=0; i< myArr.length-1; i++ ) myArr[i] = myArr[i+1]; // rotate left
  myArr[ myArr.length-1 ] = tmp;

  var lang_str = myArr.join(' ');
  console.log('lang_str: ', lang_str );
  document.getElementById('day').setAttribute('lang', lang_str );
  var lang = myArr[0];
  var yyyy_mm_dd = document.getElementById('day').getAttribute('day');
  label_weekdays( lang );
  fill_month_year( lang, yyyy_mm_dd );
}

function change_year( offs )
{
  var yyyy_mm_dd = document.getElementById('day').getAttribute('day');
  console.log('change_year:', yyyy_mm_dd )
  var yyyy = parseInt( yyyy_mm_dd.substr(0,4) );
  yyyy = yyyy + offs;
  date_str = yyyy + yyyy_mm_dd.substr(4);
  console.log('change_year:', date_str )
  document.getElementById('day').setAttribute( 'day', date_str ); 
  document.getElementById('year' ).textContent = yyyy;
  document.getElementById('day').setAttribute('day', date_str );
  document.title =  document.title.split('-')[0] + ' - ' + date_str;

  fill_calendar_grid( date_str );
}

function this_month()
{
  var today_str = new Date().toISOString().substring(0,10); // yyyy-mm-dd
  document.getElementById('day').setAttribute('day', today_str );
  change_month(0);
}

function change_month( offs ) // offs = -1 or +1  or 0 for today // no others
{
  var yyyy_mm_dd = document.getElementById('day').getAttribute('day');
  var lang = document.getElementById('day').getAttribute('lang').split(' ')[0];
  if( !lang ) lang = 'en';
  console.log('change_month:', yyyy_mm_dd, lang);
  var yyyy = parseInt( yyyy_mm_dd.substr(0,4) ); 
  var mth  = parseInt( yyyy_mm_dd.substr(5,2) );
  
  if(      mth ==  1 && offs == -1 ) { yyyy--; mth = 12; }
  else if( mth == 12 && offs ==  1 ) { yyyy++; mth =  1; }
  else                               { mth = mth + offs; }
  
  var mm = mth +'';                             // string
  if( mm.length ==1 ) mm = '0' + mm;            // zero padded
  var date_str = yyyy + '-' + mm + '-' + '01';  // first of new month
  console.log('date_str:', date_str );

  var date = new Date( date_str );
  var monthname = date.toLocaleString( lang, { month: 'short' });
  document.getElementById('month').textContent = monthname;
  document.getElementById('year' ).textContent = yyyy;
  document.getElementById('day').setAttribute('day', date_str );
  document.title =  document.title.split('-')[0] + ' - ' + date_str;
  fill_calendar_grid( date_str );
}

function new_noon_Date( yyyy_mm_dd ) // works also for iOS
{
   var str = yyyy_mm_dd.substring(0,8) + '01 12:00:00';  // 12 noon fixes DST months
   var arr = str.split(/[- :]/);
   return( new Date( arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5] ) );
}

function fill_calendar_grid( yyyy_mm_dd ) // yyyy-mm-dd
{ 
//var date1_str = yyyy_mm_dd.substring(0,8) + '01'; // 12 noon fixes DST months
//var date1 = new Date( date1_str, '12:00' );  
  var date1 = new_noon_Date( yyyy_mm_dd );  
 //document.getElementById('d4').textContent = "date1: " + date1;
  
  var dow = date1.getDay() -1;  // index of day of week  [0,6]   -> [6,0,1,2,3,4,5]
 //document.getElementById('d5').textContent = "got here: " + dow;
  if( dow == -1 ) dow = 6; // coz Sun is 0 not Mon
 //document.getElementById('d6').textContent = "got here: " + dow;

  console.log('yyyy_mm_dd: ', yyyy_mm_dd );
  console.log('date1: ', date1.toISOString().substring(0,10) );
  console.log('dow: ', dow );
  
  var nodeArr = document.querySelectorAll('#calendar > div.dom');
  var state='prev';
  //document.getElementById('d7').textContent = "nodeArr.length: " + nodeArr.length;

  for( var i=0,offs = -dow; i<nodeArr.length; i++, offs++ ) // 6x7 = 42
  {
    //document.getElementById('d6').textContent = "index: " + i;
   var el = nodeArr[i];
   // clean out old classes and attributes
   clearAttributes( el ); // whitelist = 'class'
   el.classList.add('grid-item','dom')
   if( el.onclick ) el.onclick = null; // remove onclick handlers from that date
   
   var date = addDays( date1, offs ); 
   var date_str = date.toISOString().substring(0,10);
   var d=date.getDate();
    el.textContent =  d;
    el.setAttribute('date', date.toISOString().substring(0,10) );
    if( d == 1 ) // transition state on 1st of Month
    {
      if( state=='curr' )  state = 'next';
      if( state=='prev' )  state = 'curr';
    }
    el.classList.add(state);
  }
  highlight_today();
}

/*
function clearAttributes( el, whitelist ) 
{
   var myArr;
   for( var i=0, atts=el.attributes, n=atts.length, myArr=[]; i<n; i++ ) { myArr.push(atts[i].nodeName); }
   for( var i=0; i<myArr.length; i++ ) { if( ! whitelist.includes( myArr[i] ) ) el.removeAttribute( myArr[i] ); }
}
*/

function clearAttributes( el ) 
{
   var myArr;
   for( var i=0, atts=el.attributes, n=atts.length, myArr=[]; i<n; i++ ) { myArr.push(atts[i].nodeName); }
   for( var i=0; i<myArr.length; i++ ) {  el.removeAttribute( myArr[i] ); }
}

function highlight_today()
{
 var today_str = new Date().toISOString().substring(0,10); // yyyy-mm-dd
  var el = document.querySelector('#calendar > div.dom.today');
  if (el) el.classList.remove('today');
  var el = document.querySelector('#calendar > div.dom[date="'+today_str+'"]');
  if (el) el.classList.add('today');
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
