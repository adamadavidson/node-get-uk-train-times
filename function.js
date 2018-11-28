var trains = {};
var station = msg.payload.locationName;
var nextTrains = [];
var messages = [];
var updatedAt = new Date(msg.payload.generatedAt);

if (msg.payload.hasOwnProperty('trainServices') === false){
	var nre = '';
}
else {
	var nre = msg.payload.trainServices.service;
}
if (msg.payload.hasOwnProperty('nrccMessages') === false){
	var nrccMessages = '';
}
else {
	var nrccMessages = msg.payload.nrccMessages.message;
}

//extract generated date from API results (in UTC) and convert to local time
var updatedDate = formatDate(updatedAt);
var updatedTime = formatTime(updatedAt);

function formatDate(date) {
  var day = date.getDate();
  day = "0" + day;
  day = day.slice(-2);
  var month = date.getMonth()+1;
  month = "0" + month;
  month = month.slice(-2);
  var year = date.getFullYear();

  return day + '/' + month + '/' + year;
}

function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  hours = "0" + hours;
  hours = hours.slice(-2);
  minutes = "0" + minutes;
  minutes = minutes.slice(-2);
  return hours + ':' + minutes;
}

//	var updated = updatedTime + " on " + updatedDate;
	var updated = updatedTime;

if (nre !== '') {
	// iterate through all schedule records and save required data
		for (var i = 0; i < nre.length; i++) {
			nextTrains.push({
				'To': (nre[i].destination.location[0].locationName),
				'Scheduled': (nre[i].std),
				'Due': (nre[i].etd)
			});
		}
	
	trains.schedule = nextTrains;
		
	// display and send schedule data
	var trainsDue = true;
} else {
	 var trainsDue = false;
	 trains.schedule = "No trains due.";
	 if (msg.payload.hasOwnProperty('busServices') === true){
		trains.schedule += "\n" + "Bus services in operaton.";
	}
else {
	var nre = msg.payload.trainServices.service;
}
}

if (nrccMessages !== '') {
	var messagesnumber = nrccMessages.length;
	// iterate through all schedule records and save required data
	for (var i = 0; i < nrccMessages.length; i++) {
		nrccMessages[i] = nrccMessages[i].replace(/<(?:.|\n)*?>/gm, '');
		messages.push({
			'Message': (nrccMessages[i])
		});
	}
} else {
	var messagesnumber = 0;
	messages.push({
		'Message': "No messages."
	});
}

//Create output objects for msg results
trains.station = station;
trains.updated = updated;
trains.trainsDue = trainsDue;
trains.messages = messages;
trains.messagesnumber = messagesnumber;

//Messge to go to ui template nodes for times and messages
var msg1 = {payload:trains,topic:msg.topic};


//Format train times for MQTT to send to display
var schedule = trains.schedule;
var stationUC = station.toUpperCase();
var msg2payload = stationUC + "\n" + "\n";
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
} else {
	msg2payload += schedule + "\n";
}
msg2payload += "\n" + "Updated at " + updated;
var msg2 = {payload:msg2payload};

//Format NRCC messages for MQTT to send to display
if (messagesnumber > 0) {
	var msg3 = [];
	for(var x = 0; x < messages.length; x++){
		msg3.push({payload:messages[x].Message});
		}
	return [ msg1,msg2,msg3 ];
}
else {
	 return [ msg1,msg2,null ];
}
