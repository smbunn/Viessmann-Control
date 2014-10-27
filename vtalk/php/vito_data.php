<?php
$commands = ['mode',  'outdoor_temp', 'raum_ist_temp', 'ww_ist_temp', 'k_ist_temp', 'k_abgas_temp', 'power', 'circ_pomp', 'WW_pomp', 'H_pomp', 'raum_soll_temp', 'red_raum_soll_temp', 'party_soll_temp', 'ww_soll_temp', 'time', 'starts', 'runtime_h' ];

require_once "Telnet.class.php";

$telnet = new Telnet('localhost', 83);

$connection=$telnet->connect();

if ($connection==1) {
	for ($i=0; $i<count($commands); $i++) {
		echo $commands[$i];
		echo ":";
		$result=$telnet->exec("g ".$commands[$i]);
		echo $result;
		echo ";";
	};
}
else {
	echo "ERROR";
}

$telnet->disconnect();
