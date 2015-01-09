<?php
	// link the Station class
	include("station.php");
	
	global $in_lat, $in_lng;
	$in_lat = $_GET["lat"];
	$in_lng = $_GET["lng"];
	
	// open the data files
	file_init();
	
	// grab the nearest weather station
	$s_near = getNearestStationID();
	
	// load the precipitation data for that station
	loadAverages($s_near);
	
	// turn the data into JSON
	$encoded = create_json($s_near);
	
	// return the result
	echo $encoded;
	
	// close the file streams
	file_close();
	
	
	
	
	// create the JSON object from the nearest station
	// returns the encoded JSON object
	function create_json($s_near)
	{
		$json = array();
		
		$json["s_lat"] = $s_near->lat;
		$json["s_lng"] = $s_near->lng;
		$json["s_dist"] = $s_near->dist;
		
		$json["p_year"] = $s_near->getYearlyMean();
		
		for($i=0; $i<12; $i++)
			$json["p_mo_$i"] = $s_near->getMonthlyMean($i+1);
		
		return json_encode($json);
	}
	
	
	// load average precipitation data into the nearest station
	// s_near is inout
	function loadAverages(&$s_near)
	{
		global $fin_precip;
		
		// advance the file to the station's data
		$line = scanToStation($s_near->station_id);
		
		do
		{
			// parse the line
			$tok = strtok($line, " -\n");
			$tok = strtok(" -\n"); // skip to first precip value
			
			// average in values for each month
			for( $i=0; $i<12; $i++ )
			{
				if( $tok == 8888 ) // trace rainfall
					$tok = 0;
				
				if( $tok != 9999 ) // no data
					$s_near->addRainfall($i+1, $tok);
				
				// next token
				$tok = strtok(" -\n");
			}
			
			// next line of data
			$line = nextDataLine($s_near->station_id);
		} while( $line !== false ); // not identical*/
	}
	
	
	// get the next line of data for s_id
	// s_id is the station's id
	// returns false if no more station_id data
	function nextDataLine($s_id)
	{
		global $fin_precip;
		
		if( feof($fin_precip) )
			return false; // end of file
		
		$line = fgets($fin_precip);
		$id = strtok($line, " -\n");
		
		// only interested in first 11 digits
		$id = substr($id, 0, 11);
		
		if( $id != $s_id )
			return false;
		
		return $line;
	}
	
	
	// advance the file reader to the start of the station's data
	// . the tokenizer will have already read the station's id
	// . so it will need to be restarted
	// s_id is the station id to scan to
	// returns the first line of station data
	function scanToStation($s_id)
	{
		global $fin_precip;
		
		while( !feof($fin_precip) )
		{
			// next line
			$line = fgets($fin_precip);
			// first token
			$tok = strtok($line, " -\n");
			
			// only interested in first 11 digits
			$tok = substr($tok, 0, 11);
			
			// break at first station line
			if( $tok == $s_id )
				break;
		}
		
		return $line;
	}
	
	
	// search the meta file for a nearby station id
	// uses $fin_meta
	function getNearestStationID()
	{
		global $fin_meta;
		//global $s_tenths, $s_ones, $s_fives;
		global $in_lat, $in_lng;
		
		// distance from s_near to coords
		$dist = 9999999999; // excessivly large
		
		
		while( !feof($fin_meta) )
		{
			// load a line of data
			$s_next = getNextStation();
			
			if( isNearest($dist, $s_next) )
				$s_near = $s_next;
		}
		
		//echo "Distance is " . round($dist, 2) . "mi<br/>";
		
		return $s_near;
	}
	
	
	// check if station is closer to coords
	// updates $dist to new value if closer
	// returns true if closer
	function isNearest(&$near_dist, $s_check)
	{
		$near = false;
		
		if( $s_check->dist < $near_dist )
		{
			$near_dist = $s_check->dist;
			$near = true;
		}
		
		return $near;
	}
	
	
	// returns distance in miles
	// from: http://www.johndcook.com/python_longitude_latitude.html
	function findDistance($lat1, $lng1, $lat2, $lng2)
	{
		$deg2rad = pi()/180;
		
		$phi1 = (90 - $lat1) * $deg2rad;
		$phi2 = (90 - $lat2) * $deg2rad;
		
		$theta1 = $lng1 * $deg2rad;
		$theta2 = $lng2 * $deg2rad;
		
		$cos = ( sin($phi1) * sin($phi2) * cos($theta1 - $theta2) +
		         cos($phi1) * cos($phi2) );
		$arc = acos( $cos );
		return $arc * 6373; // dist in km
	}
	
	
	// parse a meta line for the station id and coords
	// station_id, lat, lng are out parameters
	// returns the next station of type Station
	function getNextStation()
	{
		// load next line
		global $fin_meta;
		$line = fgets($fin_meta);
		
		// station id
		$station_id = strtok($line, " \n");
		
		// skip to coords
		/**
		 * Must check four at a time since city info
		 * is completely unpredictable. The only certainty
		 * is that there will be three numbers at the end
		 * of each line.
		 */
		$one = strtok(" \n");
		$two = strtok(" \n");
		$thr = strtok(" \n");
		$fou = strtok(" \n");
		while( $fou !== false ) // not identical
		{
			// shift values down the line
			$one = $two;
			$two = $thr;
			$thr = $fou;
			$fou = strtok(" \n");
		}
		
		// lat
		$lat = $one;
		// lng
		$lng = $two;
		
		// find distance to coords
		global $in_lat, $in_lng;
		$dist = findDistance($in_lat, $in_lng, $lat, $lng);
		// only need 2 digits
		$dist = round($dist, 2);
		
		return new Station($station_id, $lat, $lng, $dist);
	}
	
	// open and create file streams
	function file_init()
	{
		global $fin_precip, $fin_meta;
		
		$fin_precip = fopen("v2.prcp", 'r');
		$fin_meta = fopen("v2.prcp.inv", 'r');
	}
	
	// close file streams
	function file_close()
	{
		global $fin_precip, $fin_meta;
		
		fclose($fin_precip);
		fclose($fin_meta);
	}
	
?>