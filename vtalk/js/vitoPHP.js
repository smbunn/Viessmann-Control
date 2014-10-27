//gauge constants
var OutsideMax = 40;
var OutsideMin = -20;
var RoomMax = 30;
var RoomMin = 15;
var WWMax = 70;
var WWMin = 5;

// system constants
var Server="http://192.168.1.164/";
var DataFile="vito_data.php";
var SendFile="vito_change.php";
var ReadTimersFile="vito_getTimers.php";
var SetTimersFile="vito_setTimers.php";
var RefreshRate = 5000;	//5000 = 5 sec.  Change if you want to try quicker refresh...
var TimerIcons = ["ui-icon-arrow-2-n-s", "ui-icon-check", "ui-icon-arrowrefresh-1-e"];

//Global variables
var Refresher;
var VitoData = new Array();
var rAjax;

function startRefreshing() {
	Refresher = window.setInterval(function(){getVitoData()}, RefreshRate);
}

function stopRefreshing() {
	window.clearInterval(Refresher);
}
 
function updateTemperatureTag(value, container){ //for slide bars setting temperatures
	$("#t"+container.attr("id").substring(1)).text(value+sTemperatureLabel);
	var min = container.slider("option","min");
	var value = container.slider("value")
	//change the background of the slider
	container.find(".ui-slider-range" ).css('background', container.data('backgrounds')[value-min]);
};

function sendWidgetValue(command, value) {
	var SearchSuccess = false;
	//check if the last data from Vito is different then the one that is to be sent
	for (var i=0; i<VitoData.length; i++) {
		if (VitoData[i][0] == command) {
			SearchSuccess = true;
			if (value!==parseFloat(VitoData[i][1])) {
				sendVitoData(command, value);
			}
		}
	}
	if (!SearchSuccess) {//command not serviced
		console.log("Trying to write, but.. nothing found");
	}
	SearchSuccess=false;
}

function sendVitoData(inCommand, inValue) {
	$("#Status").text("...Sending values");
	
	//abort reading from Vito
	if ((rAjax.readyState>0) && (rAjax.readyState<4)){
		rAjax.abort();
	}
	stopRefreshing();
	
	//validate values
	var validationError = false;
	switch (inCommand) {
		case "mode":
			if (inValue < 0 || inValue > 2) {
				validationError = true;
			};
			break;
		case "raum_soll_temp":
		case "red_raum_soll_temp":
		case "party_soll_temp":
			if (inValue < 10 || inValue > 30) {
				validationError = true;
			};
			break;
		case "ww_soll_temp":
			if (inValue < 5 || inValue > 60) {
				validationError = true;
			};
			break;
		case "neigung":
			if (inValue < 0.2 || inValue > 3.2) {
				validationError = true;
			};
			break;
		case "niveau":
			if (inValue < -5 || inValue > 5) {
				validationError = true;
			};
			break;
	}
	
	if (validationError) {
		$("#Status").text("...Value incorrect, sending aborted");
	}
	else {
		var AjaxObj = $.ajax({
			type: 'POST',
			url: Server+SendFile,
			data: {command: inCommand, value: inValue},
			success: function(data, status, xhr){
				$("#Status").text("...Sending completed.  Result: "+data);
				startRefreshing();
			}
			
		});
	}
}


function getVitoData() {
		$("#Status").text("...Waiting for data");
		rAjax = $.ajax({
			type: 'POST',
			url: Server+DataFile,
			success: function(data, status, xhr){
				$("#Status").text("...Updating elements");
				VitoData=data.split(";");
				var TempArray;
				for (var i=0; i<VitoData.length; i++) {
					TempArray = VitoData[i].split(":");
					VitoData[i]=TempArray;
				}
				updatePage();
			}
	});

};

function updatePage() { //reading data from Vito completed.  Update all that there is to see on the main screen
	$('[refreshedBy]').each(function(){
		var SearchSuccess = false;
		for (var i=0; i<VitoData.length; i++) {
			if (VitoData[i][0] == $(this).attr("refreshedBy")) {
				if ($(this).hasClass("gauge")) {
					$(this).data("gauge").refresh(parseFloat(VitoData[i][1]).toFixed(1));
				}
				if ($(this).hasClass("slider")) {
					var value = parseInt(VitoData[i][1]);
					$(this).slider("value", value).slider("enable");
					updateTemperatureTag(value, $(this));
				}
				if ($(this).hasClass("pomp")) {
					if (parseInt(VitoData[i][1])>0 && $(this).data("state")!="ON") {
						$(this).data("state", "ON");
						$(this).attr("src","images/pomp_ON.GIF");
					}
					if (parseInt(VitoData[i][1])==0 && $(this).data("state")!="OFF") {
						$(this).data("state", "OFF");
						$(this).attr("src","images/pomp_OFF.PNG");
					}
				}
				if ($(this).hasClass("inputButton")) {
					$(this).button('option', 'label', VitoData[i][1]);
				}
				if ($(this).hasClass("inputTime")) {
					$(this).button('option', 'label', VitoData[i][1]+":"+VitoData[i][2]+":"+VitoData[i][3]);
				}
				if ($(this).hasClass("sendSlopeButton")||$(this).hasClass("sendLevelButton")) {
					$(this).spinner("value",VitoData[i][1]);
				}
				SearchSuccess = true;
			}
		}
		if (!SearchSuccess) {
			console.log($(this).attr("id")+": not found");
		}
		SearchSuccess = false;
	});
	$("#Status").text("...Refreshing completed");
};

function getTimers(timer) {//used to get scheduler data.  Uses different approach - raw address requests defined in PHP files
	$("#timerTable_"+timer).find("input").timespinner("disable"); 
	var getTimerAjax = $.ajax({
		type: 'POST',
		url: Server+ReadTimersFile,
		//url: "temp.txt",
		data: {timer: timer},
		dataType: "json",
		success: function(data, status, xhr){
			for (var i=0; i<7; i++){
				for (var j=0; j<4; j++) {
					$("#Timer"+timer+"_"+i+"_"+j+"_ON").val(data.days[i].timers[j].ON);
					if (j==0) $("#Timer"+timer+"_"+i+"_"+j+"_ON").data('address', data.days[i].address);
					$("#Timer"+timer+"_"+i+"_"+j+"_OFF").val(data.days[i].timers[j].OFF);
				}	

			}
			$("#timerTable_"+timer).find("input").timespinner("enable");
		}
	});
}
function setTimers(timer, day) {//Sets timers one-by-one starting from Monday.  On success reads another timer...until Sunday.
	$("#timerTable_"+timer).find("input").timespinner("disable");
	var port = $("#Timer"+timer+"_"+day+"_"+0+"_ON").data('address');
	var values = new Array();
	for (var j=0; j<4; j++) {
		values[j*2] = $("#Timer"+timer+"_"+day+"_"+j+"_ON").val();
		values[j*2+1] = $("#Timer"+timer+"_"+day+"_"+j+"_OFF").val();
	}
	
	var setTimerAjax = $.ajax({
		type: 'POST',
		url: Server+SetTimersFile,
		data: {port: port, values: values},
		success: function(data, status, xhr){
			if (day<6) {
				setTimers(timer, day+1)
			}
			else {
				$("#timerTable_"+timer).find("input").timespinner("enable");
			}
		}
		
	});
}


$(document).ready(function() { //when document loads
	//initiate gauges
	$("#gOutsideTemp").data("gauge", new JustGage({
		id: "gOutsideTemp", 
		value: 10, 
		min: OutsideMin,
		max: OutsideMax,
		title: sOutsideTemp,
		label: sTemperatureLabel,
		valueFontColor: "white"
	}));
	
	$("#gRoomTemp").data("gauge", new JustGage({
		id: "gRoomTemp", 
		value: 10, 
		min: RoomMin,
		max: RoomMax,
		title: sRoomTemp,
		label: sTemperatureLabel,
		valueFontColor: "white"
	}));
	$("#gWWTemp").data("gauge", new JustGage({
		id: "gWWTemp", 
		value: 10, 
		min: WWMin,
		max: WWMax,
		title: sWWTemp,
		label: sTemperatureLabel,
		valueFontColor: "white"
	}));
	$("#gBoilerTemp").data("gauge", new JustGage({
		id: "gBoilerTemp", 
		value: 10, 
		min: 0,
		max: 100,
		title: sBoilerTemp,
		label: sTemperatureLabel,
		valueFontColor: "white"
	}));
	$("#gFumesTemp").data("gauge", new JustGage({
		id: "gFumesTemp", 
		value: 10, 
		min: 0,
		max: 100,
		title: sFumesTemp,
		label: sTemperatureLabel,
		valueFontColor: "white"
	}));
	$("#gPower").data("gauge", new JustGage({
		id: "gPower", 
		value: 10, 
		min: 0,
		max: 100,
		title: sPower,
		label: "%",
		valueFontColor: "white"
	}));
	//initiate sliders
	$( "#sRoomTemperature, #sRoomRedTemperature, #sPartyTemperature" ).slider({
		orientation: "horizontal",
		min: 10,
		max: 30,
		range: "min",
		value: 10,
		slide: function (event, ui) {
			updateTemperatureTag(ui.value, $(this));
		},
		change: function(event, ui) { sendWidgetValue($(this).attr("refreshedBy"), ui.value);},
		disabled: true
	});
	$( "#sWWTemperature" ).slider({
		orientation: "horizontal",
		min: 5,
		max: 60,
		range: "min",
		value: 10,
		slide: function (event, ui) {
			updateTemperatureTag(ui.value, $(this));
		},
		change: function(event, ui) { sendWidgetValue($(this).attr("refreshedBy"), ui.value);},
		disabled: true
	});
	$( "#sOperatingMode" ).slider({
		orientation: "horizontal",
		min: 0,
		max: 2,
		value: 0,
		change: function(event, ui) { sendWidgetValue($(this).attr("refreshedBy"), ui.value);},
		disabled: true
	});
	//initiate spinners
	$(".sendSlopeButton").spinner({
		max: 3.4,
		min: 0.2,
		numberFormat: "n",
		step: 0.1,
		spin: function(event, ui) { sendWidgetValue($(this).attr("refreshedBy"), ui.value);}
	});
	$(".sendLevelButton").spinner({
		max: 40,
		min: -13,
		numberFormat: "n",
		step: 1,
		spin: function(event, ui) { sendWidgetValue($(this).attr("refreshedBy"), ui.value);}
	});
	
	//prepare spinners for schedulers... proper handling of time.
	$.widget( "ui.timespinner", $.ui.spinner, {
		options: {
			step: 10,
			page: 6
		},
		_parse: function(value) { 
			if ( typeof value === "string" ) {
				var timeA = value.split(":");
				if (timeA.length<2) return 0;
				var time = Number(timeA[0])*60 + Number(timeA[1]);
				return time;
			}
			return value;
		},
		_format: function( value ) {
			var hour = Math.floor(value/60,0);
			if (hour>23) {hour=23; value = 23*60+50};
			if (hour<0) hour = 0;
			hour+="";
			if (hour.length<2) hour="0"+hour;
			
			var minute = value % 60;
			if (minute>50) minute = 50;
			if (minute<0) minute = 0;
			minute+="";
			if (minute.length<2) minute="0"+minute;
			
			var time = hour+":"+minute;
			return time;
		}
	});
	
	//initiate buttons
	$(".inputButton").button();
	$(".inputTime").button();
	
	//adjust sliders: prepare backgrounds table
	$(".slider").each(function(){
		var min = $(this).slider("option","min");
		var max = $(this).slider("option","max");
		
		var backgrounds = new Array();
		for (var i = min; i<(max+1); i++) {
			var phase = 5.5*(i-min)/(max-min);
			var shift = 3.2;
		
			var red   = Math.round(Math.sin(phase + 0 + shift) * 127 + 128);
			var green = Math.round(Math.sin(phase + 2 + shift) * 127 + 128);
			var blue  = Math.round(Math.sin(phase + 4 + shift) * 127 + 128);
			
			backgrounds.push('rgb('+red+','+green+','+blue+')');
		}
		
		$(this).data('backgrounds', backgrounds);		
		updateTemperatureTag($(this).slider("option","value"), $(this));
	});
	//initiate accordions
	$("#mainAccordion").accordion({heightStyle: "content"});
	$("#timerAccordion").accordion({heightStyle: "content"});
	$("#settings").accordion({heightStyle: "content"});
		
	$("#mainAccHeader2").click(function(){//refresh timers when the 2nd accordion header is pressed
		for (var i=0; i<3; i++) {
			getTimers(i);
		}
	});
	
	//fill shcedulers with elements dynamically
	buildTimerDiv();
	
	//START!!
	getVitoData();
	startRefreshing();

	
});

function buildTimerDiv() {
	var i=0;	
	i=0; //different timers: mode, WW, circulation
	$("#timerAccordion").find("div").each(function(){
		var Table = $('<table>').appendTo($(this));
		Table
			.attr("width", "100%")
			.attr("id", "timerTable_"+i)
			.addClass("timerTable");
		//header
		var Row = $('<tr>').appendTo(Table);
		Row.append('<th width="11%"></th>');
		for (var k=0; k<4; k++) {
			Row.append('<th width="10%">'+(k+1)+': ON</th>');
			Row.append('<th width="10%">'+(k+1)+': OFF</th>');
			if (k<3) Row.append('<th width="3%"></th>');
		}

		for (var j=0; j<7; j++) { //days of the week
			var Row = $('<tr>').appendTo(Table);
			var Cell = $('<td>').appendTo(Row);
			Cell.append(dayNames[j]);
			
			for (var k=0; k<4; k++) { //timers
				var Cell = $('<td>').appendTo(Row);
				Cell.append('<input id="Timer'+i+'_'+j+'_'+k+'_ON" size="4" value="0" class="timerSpinner">');
				var Cell = $('<td>').appendTo(Row);
				Cell.append('<input id="Timer'+i+'_'+j+'_'+k+'_OFF" size="4" value="0" class="timerSpinner">');
				if (k<3) {
					var Cell = $('<td>').appendTo(Row);
				}
			}
		};
		$(this).append('<br>');
		var Center = $('<center>').appendTo($(this));
		for (var j=0; j<timerButtons.length; j++){
			var Button = $('<button>').appendTo(Center);
			Button
				.attr("id", timerButtons[j]+i)
				.text(timerButtons[j]);
			Button.button({ icons: { primary: TimerIcons[j]}});
		}
		i++;
	});
	
	$('button[id^="'+timerButtons[0]+'"]').click(function(){
		var timer = $(this).attr("id").slice(-1);
		var CurrentTime_ON;
		var CurrentTime_OFF;
		
		for (var j=0;j<4; j++) {
			CurrentTime_ON = $("#Timer"+timer+"_"+0+"_"+j+"_ON").val();
			CurrentTime_OFF = $("#Timer"+timer+"_"+0+"_"+j+"_OFF").val();
			
			for (var i=1; i<7; i++) {
				$("#Timer"+timer+"_"+i+"_"+j+"_ON").val(CurrentTime_ON);
				$("#Timer"+timer+"_"+i+"_"+j+"_OFF").val(CurrentTime_OFF);
			}
		}
	});
	$('button[id^="'+timerButtons[1]+'"]').click(function(){
		var TimerNo = $(this).attr("id").slice(-1);
		setTimers(TimerNo,0);
	});
	
	$('button[id^="'+timerButtons[2]+'"]').click(function(){
		var TimerNo = $(this).attr("id").slice(-1);
		getTimers(TimerNo);
	});
	
	$(".timerSpinner").timespinner();
	
	$(".timerSpinner").change(function() {
		var current = $(this).val();
		var timeA = current.split(":");
		if (timeA.length<2) {
			var time ="00:00";
		}
		else {
			timeA[0] = parseInt("0"+timeA[0]);
			timeA[1] = parseInt("0"+timeA[1]);
			if ( timeA[0]<0) timeA[0] = 0;
			if ( timeA[0]>23) timeA[0] = 23;
			if (timeA[1]<0) timeA[1] = 0;
			if (timeA[1]>50) timeA[1] = 50;
			timeA[1]=Math.floor(timeA[1]/10)*10;
			timeA[0]=timeA[0]+'';
			timeA[1]=timeA[1]+'';
			if (timeA[0].length<2) timeA[0]="0"+timeA[0];
			if (timeA[1].length<2) timeA[1]="0"+timeA[1];
			var time = timeA[0]+":"+ timeA[1];
		}
		$(this).val(time);
    });
	
}
