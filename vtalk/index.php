<?php
require_once('class.translation.php');
$translate = new Translator('en');
?><!doctype html>
<head>
	<meta charset="utf-8">
	<title><?php $translate->__('Vito Control'); ?></title>
	
	<link href="css/dot-luv/jquery-ui-1.10.4.custom.css" rel="stylesheet">
	<link href="css/vito.css" rel="stylesheet">
	
	<script src="js/jquery-1.10.2.js"></script>
	<script src="js/jquery-ui-1.10.4.custom.js"></script>
	
	<script src="js/raphael.2.1.0.min.js"></script>
    <script src="js/justgage.1.0.1.min.js"></script>
	
    <script src="js/vitoPHP.js"></script>
	<script>
	//language constants for JavaScript
		var sOutsideTemp = "<?php $translate->__('Outside'); ?>";
		var sRoomTemp = "<?php $translate->__('Inside'); ?>";
		var sTemperatureLabel = "°C";
		var sWWTemp= "<?php $translate->__('Warm water'); ?>";
		var sBoilerTemp = "<?php $translate->__('Boiler temperature'); ?>";
		var sFumesTemp = "<?php $translate->__('Fumes temperature'); ?>";
		var sPower = "<?php $translate->__('Burner power'); ?>";

		var timerButtons = ["<?php $translate->__('Copy Monday'); ?>", "<?php $translate->__('Save'); ?>", "<?php $translate->__('Read'); ?>"];
		var dayNames = ["<?php $translate->__('Mon'); ?>", "<?php $translate->__('Tue'); ?>", "<?php $translate->__('Wed'); ?>", "<?php $translate->__('Thu'); ?>", "<?php $translate->__('Fri'); ?>", "<?php $translate->__('Sat'); ?>", "Sun"]
	
	</script>

</head>
<body>
	<div id="mainPage" class="mainPageClass">
		<div id="mainAccordion">
			<h3><?php $translate->__('Vito info'); ?></h3>
			<div>
				<table width="100%" class="centerTable">
					<tr>
						<td width="42%" >
							<div id="gOutsideTemp" class="gauge" refreshedBy="outdoor_temp"></div>
							<div id="gRoomTemp" class="gauge" refreshedBy="raum_ist_temp"></div>
							<div id="gWWTemp" class="gauge" refreshedBy="ww_ist_temp"></div>
						</td>
						<td width="16%" style="vertical-align: top;">
							<h3><?php $translate->__('Operating mode'); ?></h3>
							<table width="100%">
								<tr>
									<td width="33%" style="text-align: left;"><?php $translate->__('OFF'); ?></td>
									<td width="34%"><?php $translate->__('WW'); ?></td>
									<td width="33%" style="text-align: right;"><?php $translate->__('WW+H'); ?></td>
								</tr>								
								<tr>
									<td colspan="3">
										<div id="sOperatingMode" class="slider" refreshedBy="mode"></div>
									</td>
									
								</tr>
							</table>	
						</td>
						<td width="42%">
							<div id="gBoilerTemp" class="gauge" refreshedBy="k_ist_temp"></div>
							<div id="gFumesTemp" class="gauge" refreshedBy="k_abgas_temp"></div>
							<div id="gPower" class="gauge" refreshedBy="power"></div>
						</td>
					</tr>
				</table>
				<hr>
				<table width="100%" class="centerTable">
					<tr>
						<td width="15%">
							<?php $translate->__('WW circ.'); ?><br>
							<img id="WWCirc" src="images/pomp_OFF.PNG" refreshedBy="circ_pomp" class="pomp"><br>
							<?php $translate->__('WW heating'); ?><br>
							<img id="WWLoad" src="images/pomp_OFF.PNG" refreshedBy="WW_pomp" class="pomp"><br>
							<?php $translate->__('Heating circ.'); ?><br>
							<img id="HCirc" src="images/pomp_OFF.PNG" refreshedBy="H_pomp" class="pomp">

						</td>
						<td width="65%" class="centerTable">	
							<table width="90%" align="center">
								<tr >
									<td width="25%"><?php $translate->__('Normal (day)'); ?>:</td>
									<td width="10%"><span id="tRoomTemperature">..&deg;C</span></td>
									<td width="65%"><div id="sRoomTemperature" class="slider" refreshedBy="raum_soll_temp"></div></td>
								</tr>
								<tr>
									<td colspan="3"><hr></td>
								</tr>	
								<tr>
									<td><?php $translate->__('Reduced (night)'); ?>:</td>
									<td><span id="tRoomRedTemperature" class="sliderTag">..&deg;C</span></td>
									<td><div id="sRoomRedTemperature" class="slider" refreshedBy="red_raum_soll_temp"></div></td>
								</tr>
								<tr>
									<td colspan="3"><hr></td>
								</tr>	
								<tr>
									<td><?php $translate->__('Party Mode'); ?>:</td>
									<td><span id="tPartyTemperature" class="sliderTag">..&deg;C</span></td>
									<td><div id="sPartyTemperature" class="slider"  refreshedBy="party_soll_temp"></div></td>
								</tr>
								<tr>
									<td colspan="3"><hr></td>
								</tr>	
								<tr>
									<td><?php $translate->__('Warm water'); ?>:</td>
									<td><span id="tWWTemperature" class="sliderTag">..&deg;C</span></td>
									<td><div id="sWWTemperature" class="slider" refreshedBy="ww_soll_temp"></div></td>
								</tr>
								<tr>
									<td colspan="3"><hr></td>
								</tr>
							</table>

						</td>			

						<td width="20%">
							<?php $translate->__('Boiler time'); ?><br>
							<input type="text" id="bSystemTime" readonly="true" class="inputTime" refreshedBy="time"><br><br>
							<?php $translate->__('Burner starts'); ?><br>
							<input type="text" id="bBurnerStarts" readonly="true" class="inputButton" refreshedBy="starts"><br><br>
							<?php $translate->__('Working time'); ?><br>
							<input type="text" id="bBurnerHours" readonly="true" class="inputButton" refreshedBy="runtime_h"><br><br>
							
						</td>
						
					</tr>
				</table>
			</div>
			<h3 id="mainAccHeader2"><?php $translate->__('Schedulers'); ?></h3>
			<div id="timerAccordion">
				<h3><?php $translate->__('Normal/reduced mode'); ?></h3>
				<div>
				</div>
				<h3><?php $translate->__('Warm water'); ?></h3>
				<div>
				</div>	
				<h3><?php $translate->__('WW circ.'); ?></h3>
				<div>
				</div>			
			</div>
			<!-- <h3><?php $translate->__('Settings'); ?></h3>
			<div id="settings">
				<h3><?php $translate->__('Basic'); ?></h3>
				<div id="Basic">
					<table width="80%" align="center">
						<tr>
							<td width="25%"><?php $translate->__('Curve slope'); ?></td>
							<td width="25%"><input type="text" size="6" id="bCurveSlope" class="sendSlopeButton" refreshedBy="neigung"></td>
							<td width="25%"><?php $translate->__('Curve level'); ?></td>
							<td width="25%"><input type="text" size="6" id="bCurveLevel" class="sendLevelButton" refreshedBy="niveau"></td>
						</tr>
					</table>
				</div>
				<h3><?php $translate->__('Coding 1'); ?></h3>
				<div id="Coding1">
				</div>
				<h3><?php $translate->__('Coding 2'); ?></h3>
				<div id="Coding1">
				</div>
			</div> -->
		</div>
	</div>
	<div id="Status" width="100%" class="status"></div>
</body>
</html>
