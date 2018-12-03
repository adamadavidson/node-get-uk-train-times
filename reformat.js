var darwinOutput = msg.payload;
var station = darwinOutput.locationName;
var updatedAt = new Date(darwinOutput.generatedAt);
var trains = {};
var nextTrains = [];
var messages = [];

//extract generated time from Darwin results (in UTC) and convert to local time.
var updated = formatTime(updatedAt);
function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  hours = "0" + hours;
  hours = hours.slice(-2);
  minutes = "0" + minutes;
  minutes = minutes.slice(-2);
  return hours + ':' + minutes;
}

//If trains are showing in Darwin output, iterate through all schedule records and save required data.
if (darwinOutput.hasOwnProperty('trainServices') === true){
	var trainsDue = true;
	var nre = darwinOutput.trainServices.service;
	for (var i = 0; i < nre.length; i++) {
		nextTrains.push({
			'To': (nre[i].destination.location[0].locationName),
			'Scheduled': (nre[i].std),
			'Due': (nre[i].etd)
		});
	}
}
//If no trains are showing in Darwin output, use a default 'no trains due' message.
else {
	var trainsDue = false;
	var scheduleText = "No trains due.";
	if (darwinOutput.hasOwnProperty('busServices') === true){
		scheduleText += "\n" + "Bus services in operaton.";
	}
}

//If NRCC messages are showing in Darwin output, iterate through all message records and save required data.	
if (darwinOutput.hasOwnProperty('nrccMessages') === true){
	var nrccMessages = darwinOutput.nrccMessages.message;
	var messagesnumber = nrccMessages.length;
	// iterate through all schedule records and save required data
	for (var i = 0; i < nrccMessages.length; i++) {
		nrccMessages[i] = nrccMessages[i].replace(/<(?:.|\n)*?>/gm, '');
		messages.push({
			'Message': (nrccMessages[i])
		});
	}
}
//If no NRCC messages are showing in Darwin output, set number of messages to zero and set default message to display on UI.
else {
	var messagesnumber = 0;
	messages.push({
		'Message': "No messages."
	});
}

//Create output 'train' object properties for msg results.
trains.station = station;
trains.updated = updated;
trains.schedule = nextTrains;
trains.trainsDue = trainsDue;
trains.messages = messages;
trains.messagesnumber = messagesnumber;

//Messge to go to ui template nodes for train times and NRCC messages.
var msg1 = {payload:trains,topic:msg.topic};


//Format train times for MQTT to send to display
var schedule = trains.schedule;
var stationUC = station.toUpperCase();
var msg2payload = stationUC + "\n" + "\n";
//If trains are showing in Darwin output, iterate through the results to reformat for MQTT.
if (trainsDue === true) {
	for(var x = 0; x < schedule.length; x++){
		if (schedule[x].Due === "On time") {
			schedule[x].Due2 = schedule[x].Scheduled + " ";}
		else if (schedule[x].Due === "Cancelled") {
			schedule[x].Due2 = "xx:xx ";}	
		else if (schedule[x].Due === "Delayed") {
			schedule[x].Due2 = "??:?? ";}
		else if (schedule[x].Due !==schedule[x].Scheduled) {
			schedule[x].Due2 = schedule[x].Due + "d";}
		schedule[x].To2 = schedule[x].To;
		schedule[x].To2 = schedule[x].To2.replace("Manchester", "MCR");
		schedule[x].To2 = schedule[x].To2.replace("Road", "Rd");
		msg2payload += schedule[x].Due2 + " " + schedule[x].To2 + "\n";
	}
}
//If no trains are showing in Darwin output, send the default 'no trains due' message.
else {
	msg2payload += scheduleText + "\n";
}
msg2payload += "\n" + "Updated at " + updated;
var msg2 = {payload:msg2payload};

//Format NRCC messages for MQTT to send to display
//If NRCC messages are showing in Darwin output, iterate through the results to reformat for MQTT.
if (messagesnumber > 0) {
	var msg3 = [];
	for(var x = 0; x < messages.length; x++){
		msg3.push({payload:messages[x].Message});
		}
	return [ msg1,msg2,msg3 ];
}
//If no NRCC messages are showing in Darwin output, do not send an MQTT message to the display for messages.
else {
	 return [ msg1,msg2,null ];
}
