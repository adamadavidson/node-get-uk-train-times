//open the node-red settings.js file, which is in ~/.node-red/
//Find the functionGlobalContext section and insert:
// functionGlobalContext: {
//	ukTrains: require('uk-trains')
//},

//Install the 'uk-trains' NPM module in the ~/.node-red/ directory.
//Run 'sudo npm install uk-trains'
//Find the uk-trains module and edit the index.js file to update to the latest Darwin version date and to return all results, not just train services.

//Inputs
var station = 'EUS'; // Departure station CRS code (Required).
var destination_station = ''; //Only show departures to this station CRS code (Optional) - leave balnk if not required.
var rows = 4; //Number of services to return.
var includeServiceDetails = false; //If 'true' this will show the subsequent calling points for each service.
var apikey = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

var Darwin = global.get('ukTrains');
var rail = new Darwin(apikey);
var options = {};

options.count = rows;
options.toStation = destination_station;
options.includeServiceDetails = includeServiceDetails;

rail.getDepartures(station, options, function(result) {
	var msg1 = {payload:result,topic:station};
  //Send 'splash screen text'
	var msg2 = {payload:"\n" + "\n" + "        My" + "\n" + "\n" +  "        Train" + "\n" + "\n" + "        Network"};
	node.send([msg1,msg2]);
});
