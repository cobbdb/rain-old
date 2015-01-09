
/**
 * Units in the RCC:
 *  All calculations are done in metric. By enforcing this
 *  standard, there is no need to track mismatched units
 *  that aren't made obvious in screen output. Think of the
 *  system as a filter where the only time units are
 *  converted is when they pass from internal (javascript)
 *  to the screen (HTML/HighChart) and vice versa.
 */

// --- Enumerated Unit Types ---
var u_metric = 0;
var u_us = 1;

var current_unit = u_us;


var factor_L2gal = 0.264172052;
var factor_mm2in = 0.0393700787;
var factor_km2mi = 0.621371192;
var factor_m22ft2 = 10.7639104;
var factor_m2ft = 3.2808399;
var factor_kg2lb = 2.20462262;

// unit conversions
// use as (BNF): <value>*<unit_array>[current_unit]
var unit_L = [1, factor_L2gal];
var unit_mm = [1, factor_mm2in];
var unit_km = [1, factor_km2mi];
var unit_m = [1, factor_m2ft];
var unit_m2 = [1, factor_m22ft2];
var unit_kg = [1, factor_kg2lb];

// unit names
var unit_name_L = ["L", "gal"];
var unit_name_mm = ["mm", "in"];
var unit_name_km = ["km", "mi"];
var unit_name_m = ["m", "ft"];
var unit_name_m2 = ["m&sup2;", "ft&sup2;"];
var unit_name_kg = ["kg", "lb"];



// switch between US and metric
// callback for units button
function toggleGlobalUnit()
{
	var new_unit = (current_unit == u_us) ? u_metric : u_us;
	setGlobalUnit( new_unit );
	
	// regraph if currently showing a graph
	if( $("#graph_area").is(":visible") )
		changeGraphic( currentGraphic ); // regraph
}


// change the global unit and update the page
function setGlobalUnit( new_unit )
{
	var old_unit = current_unit;
	
	// update the global
	current_unit = new_unit;
	
	// update page button
	$("#unit_setting").html( (current_unit) ? "US" : "metric" );
	
	// update the page titles
	$(".unit_mm").html( unit_name_mm[current_unit] );
	$(".unit_m").html( unit_name_m[current_unit] );
	$(".unit_km").html( unit_name_km[current_unit] );
	$(".unit_L").html( unit_name_L[current_unit] );
	$(".unit_m2").html( unit_name_m2[current_unit] );
	
	// update input boxes
	convertArea( old_unit );
	convertPrecipitation( old_unit );
	convertDistance( old_unit );
	convertUsage( old_unit );
	
	// update outputs
	//convertStationDist( old_unit );
}


// deprecated
/*function convertStationDist( old_unit )
{
	var val_dist = s_dist; // metric
	val_dist *= unit_km[current_unit]; // to current
	val_dist = roundToFixed( val_dist, 2 );
	
	$("#out_statation_dist").html( val_dist + " " + unit_name_km[current_unit] );
}*/


// convert input value to current units
function convertArea( old_unit )
{
	var val_area = stringToInt( $("#io_input_area").val() );
	val_area /= unit_m2[old_unit]; // to metric
	val_area *= unit_m2[current_unit]; // to current
	val_area = roundToFixed( val_area, 1 );
	
	$("#io_input_area").val( val_area );
	$("#out_area").html( val_area + " " + unit_name_m2[current_unit] );
	
	// adjust first flush
	setFirstFlush();
}

function convertDistance( old_unit )
{
	var val_dist = stringToInt( $("#input_storage_box").val() );
	val_dist /= unit_m[old_unit]; // to metric
	val_dist *= unit_m[current_unit]; // to current
	val_dist = roundToFixed( val_dist, 1 );
	
	$("#input_storage_box").val( val_dist );
	$("#out_flush_dist").html( val_dist + " " + unit_name_m[current_unit] );
}

function convertPrecipitation( old_unit )
{
	var val_rain;
	for( var i=0; i<12; i++ )
	{
		val_rain = stringToInt( $("#io_rain_inputs_" + i + "_box").val() );
		val_rain /= unit_mm[old_unit]; // to metric
		val_rain *= unit_mm[current_unit]; // to current
		val_rain = roundToFixed( val_rain, 1 );
		
		$("#io_rain_inputs_" + i + "_box").val( val_rain );
	}
	
	// update the calculations for rainfall
	newPrecipitation();
}

function convertUsage( old_unit )
{
	var val_use;
	for( var i=0; i<12; i++ )
	{
		val_use = stringToInt( $("#input_usage_" + i + "_box").val() );
		val_use /= unit_L[old_unit]; // to metric
		val_use *= unit_L[current_unit]; // to current
		val_use = roundToFixed( val_use, 0 );
		
		$("#input_usage_" + i + "_box").val( val_use );
	}
	
	// update the calculations for rainfall
	newUsage();
}











/**
 * Code that didn't end up being required.. but was just too darn
 * neat to let go. Maybe will be useful in future iterations of the
 * calculator.
 */
/*

var uu_gal = 'gal', uu_mi = 'mi', uu_ft = 'ft', uu_in = 'in', uu_ft2 = 'ft2';
var um_L = 'L', um_mm = 'mm', um_m = 'm', um_km = 'km', um_m2 = 'm2';

// calculate equivilant between metric and US units
// val is the value in metric as a NUMBER
// unit_in/unit_out -> {'gal', 'L', 'mi', 'ft', 'in', 'mm', 'm', 'km', 'ft2', 'm^2'}
// returns converted value in US units
// NOTE: gal refers to US gallons
// NOTE: wrong conversions are unchecked.. so use with care
// . ie) Litres to miles
// . Assumes:    Litres <> gal
//  kilo-/milli-/metres <> inches/feet/miles
//                  m^2 <> ft^2
function convertUnit( val, unit_in, unit_out )
{
	var convert = val;
	
	// convert to metres to remove conversion cases
	if( unit_in == 'mm' )
	{
		val *= 0.001; // mm > m
		unit_in = 'm';
	}
	else if( unit_in == 'km' )
	{
		val *= 1000; // km > m
		unit_in = 'm';
	}
	
	// do the actual conversions
	switch( unit_in )
	{
	// volume
	case 'L':
		convert *= 0.264172052; // L > gal
		break;
	case 'gal':
		convert *= 3.78541178; // gal > L
		break;
	
	// distance
	case 'm':
		if( unit_out == 'mi' ) // m > mi
			convert *= 0.000621371192;
		else if( unit_out == 'ft' ) // m > ft
			convert *= 3.2808399;
		else if( unit_out == 'in' ) // m > in
			convert *= 39.3700787;
		break;
	case 'mi':
		convert *= 1609.344; // mi > m
		break;
	case 'ft':
		convert *= 0.3048; // ft > m
		break;
	case 'in':
		convert *= 0.0254; // in > m
		break;
		
	// area
	case 'm2':
		convert *= 10.7639104; // m^2 > ft^2
		break;
	case 'ft2':
		convert *= 0.09290304; // ft^2 in m^2
		break;
	} // switch
	
	// restore from metres
	if( unit_out == 'mm' )
		convert *= 1000; // m > mm
	else if( unit_out == 'km' )
		convert *= 0.001; // m > km
	
	
	return convert;
}


// 'Class' RCCNumber
// val > value as a NUMBER
// unit_metric > the metric version to use
// unit_us > the US version to use
// unit_type > the unit type upon instanciation
// . u_metric / u_us
function RCCNumber( val, unit_metric, unit_us, unit_type )
{
	// the actual number
	this.value = ( isNaN(val) ) ? stringToInt(val) : val;
	
	// units to use when converting back and forth
	this.unit_type = unit_type;
	this.unit_metric = unit_metric;
	this.unit_us = unit_us;
	
	// returns the value in current unit system
	this.val = function()
	{
		var val_out = this.value;
		
		// check if conversion is needed
		if( this.unit_type != current_unit )
		{
			if( current_unit == u_metric ) // US > metric
				val_out = convertUnit( this.value, this.unit_us, this.unit_metric );
			else // metric > US
				val_out = convertUnit( this.value, this.unit_metric, this.unit_us );
		}
		
		return val_out;
	};
}
*/















