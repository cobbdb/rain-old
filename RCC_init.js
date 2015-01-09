var p_year = 0;


// on page load
$(function()
{

	// start up the GMap
	mapInit();
	
	$("#graph_area").hide();
	//$("#graph_link").hide();
	$("#io_reset").hide();
	
	// load the initial material name into output
	$("#out_material").html( $("#input_material_box option:selected").text() );
	// load the new material value into output
	$("#out_efficiency").html( getEfficiency()*100 + "%" );
	
	clearDoneButton();
	$("#img_arrow_reset").hide();
	
	// load certain page elements
	loadMonths("io_rain_inputs", "precip");
	loadMonths("input_usage", "usage");
	loadPrecipitationValues();
	
	toggleAutoFill(); // turn on by default
	
	
	////////////////////////////
	//// JQuery Inits Below ////
	
	// help overlays
	$("img[rel]").overlay({
		top: "30%",
		mask: "#789",
		closeOnClick: true
	});
	$("#b_done[rel]").overlay({
		top: "30%",
		mask: "#789",
		closeOnClick: false,
		closeOnEsc: false
	});
	
	// ensure the GMap
	map.checkResize();
	
	// calculate initial tank size
	updateTankSize();
	
	// start in US unit system
	setGlobalUnit( u_us );
});



















