<?php
	$error = false;
	$valid_functions = ['mode', 'ww_soll_temp', 'raum_soll_temp', 'red_raum_soll_temp', 'party_soll_temp', 'niveau', 'neigung'];
	
	if(in_array($_POST['command'], $valid_functions)) {
		$command = $_POST['command'];
	}
	else {
		$error = true;
	}
	
	$value = floatval($_POST['value']);
	
	if ($error==false && $value>=0) {
	
		require_once "Telnet.class.php";

		$telnet = new Telnet('localhost', 83);

		$connection=$telnet->connect();

		if ($connection==1) {
			$result=$telnet->exec("s ".$command." ".strval($value));
			echo $result;
		}
		else {
			echo "Connection Error";
		}

		$telnet->disconnect();
	}
	else {
		echo "Wrong Command";
	
	}
