//////////// load_composite.js ////////////////
// create canvas1 - as child inside myDiv
// create canvas2 - as child inside myDiv
// create img1 in canvas1 - get access to image data1
// at end of onload trigger ...
// create canvas1 - as child as myDiv
// create img2 in canvas2 - get access to image data1
// at end of onload trigger ...
// combine image data1 and data2 into data1
// write data1 to canvas1

function load_composite( id_str, src1, src1_bak, src2, src2_bak )
{
  var myDiv = document.getElementById( id_str );
  myDiv.style.position = 'relative';
  
  var img1 = new Image();
  img1.setAttribute('parent_id', id_str );
  img1.crossOrigin = 'anonymous';
  img1.onerror= function(ev) { ev.target.onerror=null; if(src1_bak) ev.target.src = src1_bak; }
  img1.onload = function( ) {
     if( img1.width + img1.height == 0 ) { img1.onerror(); return; }
     img_to_canvas( img1 ); 
     var img2 = new Image();
     img2.setAttribute('parent_id', id_str );
     img2.crossOrigin = 'anonymous';
     img2.onerror= function(ev) { ev.target.onerror=null; if(src2_bak) ev.target.src = src2_bak; }
     img2.onload = function( ) { 
         if( img2.width + img2.height == 0 ) { img2.onerror(); return; }
         img_to_canvas(img2)
     }
     img2.src = src2; // triggers img2.onload()
  }
  img1.src = src1; // triggers img1.onload()
}

function img_to_canvas( img ) // img is a node/element <- this
{
    var canvas = document.createElement('canvas');
    style_canvas( canvas, img.width, img.height, 1 );
    
    const id_str = img.getAttribute('parent_id' );
    var myDiv = document.getElementById( id_str );
    myDiv.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    set_black_transparent( data, 3 ); // fuzz = 3
    imageData.data = data;
    ctx.putImageData(imageData, 0, 0); // update into canvas
}


function style_canvas( canvas, width, height, zIndex )
{
  canvas.width=width;    canvas.height=height; canvas.style.position = 'absolute'; 
  canvas.style.left = 0; canvas.style.top = 0; canvas.style.zIndex = zIndex;
}


function set_black_transparent( data, fuzz )
{
  for( var i=0; i<data.length; i+=4 ) 
  {
    if( (data[i] < fuzz) && (data[i + 1] < fuzz) && (data[i + 2] < fuzz) ) // black found.
    {
      data[i + 3] = 0; // set alpha = transparent where image is black
    }
  }
}

/////////////////////////////////////////////////////////////////

function fix_roda( ev ) // uses style_canvas()
{   
    var myImg = ev.target;
    if( ! myImg.src.includes('roda.sentinel-hub.com') ) return; // not roda so do nothing
    const myDiv = myImg.parentNode;
    console.log( 'fix_roda: '  + myDiv.id + ' ' + myImg.src + ' ' + myImg.width + ' ' + myImg.height);
    myDiv.style.position = 'relative';
    var img = new Image();
    img.setAttribute('parent_id', myDiv.id );
    img.alt = "Loading...";
    img.crossOrigin =  ": *";
    img.onerror= function( ev ) { console.log('img.onerror: ' + this.src ); ev.target.onerror=null; };
    img.onload = function( ) {
        roda_to_canvas( img );
    }
    console.log('img.src = myImg.src');
    img.src = myImg.src; // triggers img.onload()
}

function roda_to_canvas( img ) // img is a node/element <- this
{
    var canvas = document.createElement('canvas');
    style_canvas( canvas, img.width, img.height, 1 );
    
    const id_str = img.getAttribute('parent_id' );
    var myDiv = document.getElementById( id_str );
    myDiv.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    do_fix( data, canvas.width, canvas.height );
    imageData.data = data;
    ctx.putImageData(imageData, 0, 0); // update into canvas
}


function is_white(data, i)
{ const TOP=240;
  return( (data[i++] > TOP) && (data[i++] > TOP) && (data[i] > TOP) ) ;
}

function is_255(data, i)
{ 
//return( (data[i++] > 253) && (data[i++] > 253) && (data[i] > 253) ) ;
  return( (data[i++] > 250) && (data[i++] > 250) && (data[i] > 250) ) ;
}

function set_black(data, i)
{
  data[i++] = 0; data[i++] = 0; data[i] = 0;
}

function gap( curr, prev )
{
    return( 1 < Math.abs(curr.x - prev.x) || 1 < Math.abs(curr.y - prev.y) );
}

function mk_borderArr( data, width, height )
{
  var borderArr = [];
    var col=0,row=0,i=0;
    
    for(  ; col<width-1; col++, i+=4 ) // top left -> top right-1
        if( is_255(data, i) ) { borderArr.push({x: col, y: row}); }
            
    for( ; row<height-1; row++, i+=(4*width) ) // top right -> bot right-1
        if( is_255(data, i) ) { borderArr.push({x: col, y: row}); } 
   
    for(  ; 0<col; col--, i-=4 ) // bot right -> bot left-1
        if( is_255(data, i) ) { borderArr.push({x: col, y: row}); } 
    
    for( ; 0<row; row--, i-=(4*width) ) // bot left -> top left-1
        if( is_255(data, i) ) { borderArr.push({x: col, y: row}); }

  return borderArr;
}

function mk_segmentArr( borderArr )
{
  var segArr = []; // array of segments
    var prev = borderArr[0];
    segArr.push([prev]); // start first segment
    for( var k=1,seg_indx=0; k<borderArr.length; k++ )
    {
        curr = borderArr[k];  // col, row
        if( gap(curr, prev) ) // gap
        {
            segArr.push([curr]);  // start next segment
            seg_indx++;
        }
        else
            segArr[seg_indx].push(curr);
        prev = curr;
    }
  return segArr;
}

function do_closure( segArr )
{
    var nb_segs  = segArr.length;
    var last_seg = segArr[nb_segs-1];
    var coord_N  = last_seg[last_seg.length-1];
    var coord_0  = segArr[0][0];
    
    if( 1<nb_segs && !gap( coord_N, coord_0 ) )
    {
         console.log('joining: ' + nb_segs + ' ' + coord_N + ' ' + coord_0 );
         var tmpArr = last_seg.concat(segArr[0]);
         segArr[0] = tmpArr;
         segArr.pop();  // removes last item
         // nb_segs--;
    }
}
    
function mk_polygonArr( segArr )
{
    var polygonArr = []; 
    for( var s=0; s<segArr.length; s++ )  
    {
        var seg = segArr[s];
        if( (seg.length) < 3) continue; // next s 
        var a = seg[0];
        var b = seg[1];
        var pointArr = [a];  // start points Array
        for( var k=2; k<seg.length; k++ )
        {
           var c = seg[k];
           var is_linear = (a.x == b.x && b.x == c.x)  // linear col
                         ||
                           (a.y == b.y && b.y == c.y); // linear row
           if ( !is_linear )
               pointArr.push(b);
           a = b; 
           b = c;
        }
        pointArr.push(c);
        if( 2 < pointArr.length ) polygonArr.push(pointArr);
    }
    return polygonArr;
}

function get_best_polygon( polygonArr )
{
    var best_indx=0;
    for( var i=0,best_perim=0; i<polygonArr.length; i++ )
    {
       var polygon = polygonArr[i];
       var a = polygon[0];
       var perim=0; 
       for( var k=1; k<polygon.length; k++ )
       {
         var b = polygon[k];
         perim += Math.abs(b.x - a.x) + Math.abs(b.y - a.y); // includes repeats at corners
       }
       if( best_perim < perim )
       {
            best_indx = i;
            best_perim = perim;
       }
    }
    console.log( 'best_indx = ' +best_indx   );
    return( polygonArr[best_indx] );
}

function calc_line( pt0, ptN )
{
  var m = (pt0.y - ptN.y)/(pt0.x - ptN.x);  // m = (y1-y2)/(x1-x2)
  var c = pt0.y - m*pt0.x;                  // c =  y - m.x
  var coef = 1.0/Math.sqrt(m*m + 1); 
  return( { m: m, c: c, coef: coef } );
}


function get_line( polygon )
{
    var nb = polygon.length ;
    return calc_line( polygon[0], polygon[nb-1] );
};

function calc_dist( coord, line )
{
  return( (coord.y - line.m*coord.x - line.c) * line.coef );
}


function get_corner( line, polygon )
{
    var dist = 0;
    var indx, coord;
    for( var k=1; k<polygon.length-1; k++ ) // 
    {
        coord = polygon[k]; //  a corner
        // calc perpendicular distance to that corner
        var d = calc_dist( coord, line );
        console.log( k + ' x:' + coord.x + ' y:' + coord.y  + ' d:' + d.toFixed(0) );
        if( k==1 || Math.abs(dist) < Math.abs(d) )
        {
            indx = k;
            dist = d;
        }
    }
    coord = polygon[indx];
    return { x: coord.x, y: coord.y, dist: dist, sign: Math.sign(dist) };
}
 
function mk_darkArr( data, width, height, line, corner )
{
    var darkArr = [];
    var col_step=1;
    var row_step=1;
    if( 0 < corner.x  ) col_step = -1;
    if( 0 < corner.y  ) row_step = -1;
    
    console.log( 'col_step, row_step ' + col_step + ' ' +  row_step);
    var count=0;
    
    for( var row=corner.y; true; row += row_step )
    {
        if( row < 0 || height <= row ) break; // out of for/row
        var indx = 4*row*width + 4*corner.x;
        for( var col=corner.x; true ; col += col_step, indx += 4*col_step )
        {
            if( col < 0 || width <= col ) break; // out of for/col
            var d = calc_dist( {x: col, y:row}, line );
            if( Math.sign(d) != corner.sign ) break; // not inside polygon
            count++;
            if( ! is_white(data,indx) )
            {
                 darkArr.push( {x: col, y:row, dist: d} );
              // set_red(data,indx);
                 break; // don't bother looking in further cols
            }
        }
    }
    console.log( 'count ' + count + ' / ' + width*height );    
    return darkArr ;
}


function set_white_black( data, width, height, line, corner ) // same logistics as mk_darkArr
{
    var sign = Math.sign(corner.dist);
    var col_step=1;
    var row_step=1;
    if( 0 < corner.x  ) col_step = -1;
    if( 0 < corner.y  ) row_step = -1;
    
    for( var row=corner.y; true; row += row_step )
    {
        if( row < 0 || height <= row ) break; // out of for/row
        var indx = 4*row*width + 4*corner.x;
        for( var col=corner.x; true ; col += col_step, indx += 4*col_step )
        {
            if( col < 0 || width <= col ) break; // out of for/col
            var d = calc_dist( {x: col, y:row}, line );
            if( Math.sign(d) != sign ) break; // not inside polygon
            set_black(data,indx);
        }
    }
}

function nb_dark( darkArr, line, sign )
{
  var count=0;
    for( var k=0; k<darkArr.length; k++ )
    {
        var coord = { x: darkArr[k].x, y: darkArr[k].y };
        var d = calc_dist( coord, line );
        darkArr[k].dist = d; // for later ?
        if( sign == Math.sign(d) ) count++;  // same sign means inside polygon
    }
  return count;
}


function bad_ratio( segArr )
{
    var best_len=0;
    var second_best_len=0;
    var best_indx;

    for( var s=0; s<segArr.length; s++ )  
    {
        var seg = segArr[s];
        if( s==0 || best_len < seg.length )
        {
            best_len = seg.length;
            best_indx =  s;
        }
    }
console.log('best len: '  + best_len );
    for( var s=0; s<segArr.length; s++ ) if( s != best_indx ) 
    {
        var seg = segArr[s];
        if( second_best_len < seg.length )
        {
            second_best_len = seg.length;
        }
    }
console.log('second_best len: '  + second_best_len );

    if( best_len < 7*second_best_len ) // too cloudy, so give up
    {
        console.log('too cloudy, so give up');
        return true;
    }
    return false;
}


function do_fix( data, width, height )
{
    var borderArr = mk_borderArr( data, width, height );
    console.log('borderArr: ');
    console.log(borderArr);

    // console.log(borderArr.length + ' ' + (2*(width + height) - 4) );

    // edge case - when all border is white
    if( borderArr.length == (2*(width + height) - 4) )  // perimeter length (-4 duplicate corners)
    {
        console.log('do_fix fails: border is all white!');
        return;
    }

    var segArr = mk_segmentArr( borderArr );
    console.log('segArr: ');
    console.log(segArr);

    do_closure( segArr ); // join first to last segment if no gap

    if( 1<segArr.length && bad_ratio(segArr) ) return; // too cloudy ?

    var polygonArr = mk_polygonArr( segArr ); // find corner / polygons
    console.log( 'polygonArr: ');
    console.log(  polygonArr );
    
    if( polygonArr.length < 1 ) return;  // no polygon found

    // get index of longest remaining polygon segment -- assume it is the one we want
    var polygon = get_best_polygon( polygonArr );
    console.log( 'polygon: ');
    console.log(  polygon );

    var line = get_line(polygon);
    console.log( 'line: ');
    console.log( line );


    var corner = get_corner( line, polygon );
    console.log( 'Corner: ' );
    console.log( corner );
    
    var darkArr =  mk_darkArr( data, width, height, line, corner );
    console.log( 'darkArr: ');
    console.log( darkArr );
    
    var spot;
    if( 0<darkArr.length )  spot = get_spot( darkArr );
    else                    spot = get_mid_pt( polygon );
    console.log( 'spot:' );
    console.log( spot );

        var pt0 = polygon[0];
        var ptN = polygon[polygon.length-1];
        console.log( 'pt0:' ); console.log( pt0 );
        console.log( 'ptN:' ); console.log( ptN );

        var line0 = calc_line( pt0, spot );
        var lineN = calc_line( spot, ptN );
        console.log( 'line0:' ); console.log( line0 );
        console.log( 'lineN:' ); console.log( lineN );

        var myObj = get_flag_line_nb( darkArr, line0, lineN, corner.sign );
        console.log( 'myObj:' ); console.log( myObj );



        if( 1 < myObj.nb ) // worth iterative refinement
        {
            line = myObj.line;
            var old_nb = myObj.nb; 
            var flag   = myObj.flag;
            for( var count=0; count < 10; count++ ) // refine line until it excludes all/most dark pixels
            {
                // console.log('pt0 = (' + pt0.x + ',' + pt0.y + ')  ptN = (' + ptN.x + ',' + ptN.y + ')');
                if( flag == 0 ) ptN = refine_pt(line, ptN, polygon[polygon.length-2]); 
                else            pt0 = refine_pt(line, pt0, polygon[1]);

                var nb = nb_dark( darkArr, line, corner.sign );
                console.log('new pt0, ptN:  ('  + ptN.x + ',' + ptN.y + ') ('  + ptN.x + ',' + ptN.y + ')  nb: ' + nb );
                if( nb == old_nb || nb < 2 )
                    break; // out of while
                line = calc_line( pt0, ptN );  // refine line
                flag = !flag; // alternate
                old_nb = nb;
            }
        }
        // stop we should have a good line
        console.log('good line:' );
        console.log( line );
        set_white_black( data, width, height, line, corner );
}

function get_mid_pt( polygon )
{
    var pt0 = polygon[0];
    var ptN = polygon[polygon.length-1];
    var x = Math.round( (pt0.x + ptN.x) / 2 );
    var y = Math.round( (pt0.y + ptN.y) / 2 );
    return {x: x, y: y};
}

function get_spot( darkArr )
{
    var d_max = 0;
    var dark_indx;
    for( var k=0; k<darkArr.length; k++ )
    {
        if( k==0 || d_max < darkArr[k].d )
        {
            d_max = darkArr[k].d;
            dark_indx = k;
        }
    }
    return darkArr[dark_indx];
}

function get_flag_line_nb( darkArr, line0, lineN, sign )
{
    var n0 = nb_dark( darkArr, line0, sign );
    var nN = nb_dark( darkArr, lineN, sign );
    console.log('n0 = ' + n0 + '  nN = ' + nN );
    if( n0 < nN ) return { flag: 0, line: line0, nb: n0 }
    else          return { flag: 1, line: lineN, nb: nN }
}

function refine_pt(line, pt, pt_)
{
    console.log('line (line0):' );
    console.log( line );
    var pt_ = polygon[polygon.length-2];
    if( pt.x == pt_.x ) pt.y = Math.round(line.m * pt.x + line.c); // intersect the vertical
    else                pt.x = Math.round((pt.y - line.c)/line.m); // intersect the horizontal
    return pt;
}

//                                            R                G                 B
function set_cyan(data, i)    { data[i++] =   0; data[i++] = 255;  data[i  ] = 255; }
function set_yellow(data, i)  { data[i++] = 255; data[i++] = 255;  data[i  ] =   0; }
function set_red(data, i)     { data[i++] = 255; data[i++] =   0;  data[i  ] =   0; }
function set_magenta(data, i) { data[i++] = 255; data[i++] =   0;  data[i  ] = 255; }
function set_blue(data, i)    { data[i++] =   0; data[i++] =   0;  data[i  ] = 255; }

