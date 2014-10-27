<?php

$timers =  array(array("2000", "2008", "2010", "2018", "2020", "2028", "2030"),
		 array("2100", "2108", "2110", "2118", "2120", "2128", "2130"),
		 array("2200", "2208", "2210", "2218", "2220", "2228", "2230"));

$timer = 0;

if (isset($_POST['timer']) and $_POST['timer']!=='') {
        $timer = intval($_POST['timer']);
}

if ($timer<0 || $timer>2) {
        $timer = 0;
}


require_once "Telnet.class.php";

$telnet = new Telnet('localhost', 83);

$connection=$telnet->connect();

if ($connection==1) {
	$onOf = array ("ON", "OFF");
        echo '{"days": [{';
        $j = 0;
        for ($i=0; $i<7; $i++) {
                $result=$telnet->exec("rg ".$timers[$timer][$i]." 8");
                $times = explode(";", $result);
                echo '"address":"'.$timers[$timer][$i].'",';
 		echo '"timers":[{';
                for ($j = 0; $j<8; $j++) {
			$intTime = intval($times[$j]);
                        if ($intTime==255) $intTime=0;
			echo '"'.$onOf[$j % 2].'":"';
       	                printf ("%02d",  $intTime/8|0);
               	        echo ':';
                       	printf ("%02d",  ($intTime % 8) * 10);
                        echo '"';
			if ($j % 2 ==0) {
				echo ',';
			}
                        else {
                                echo '}';
				if ($j<7) echo ',{';
                        }
                }
                echo ']}';
                if ($i<6) {
                        echo ',{';
                }
        };
        echo ']}';
}
else {
        echo "ERROR";
}

$telnet->disconnect();

