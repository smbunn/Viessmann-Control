<?php
	$error = false;

	$port = $_POST['port'];

	$values;
	$valuesToSend = '';

	$valuesCount = count($_POST['values']);
	$values = $_POST['values'];

	//fill missing timers if needed, must be 8
	for ($i=$valuesCount; $i<8; $i++) {
		$values[$i] = "00:00";
	}

	for ($i=0; $i<8; $i++) {
		$skipped = false;
		if ($i % 2 ==0) {
			if ($values[$i] == "00:00" && $values[$i+1] == "00:00") {
				$valuesToSend.="255;255;";
				$i++;
				$skipped = true;
			}
	
		}
		if ($skipped==false) {
			$time = split(":", $values[$i]);
			$valuesToSend.=strval(max(0,min(24,intval($time[0])))*8+floor(intval($time[1])/10)).";";
		}
	}
//	echo $valuesToSend;
	require_once "Telnet.class.php";
	$telnet = new Telnet('localhost', 83);
	$connection=$telnet->connect();

	if ($connection==1) {
		$result=$telnet->exec("rs ".trim($port)." ".$valuesToSend);
		echo $result;
	}
	else {
		echo "Connection Error";
	}
	$telnet->disconnect();
