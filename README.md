# node-get-uk-train-times
Node-red function code that uses matt-parrish/uk-trains node module

This repository has the code for 2 Node Red functions nodes - these have been written very much for my particular requirements, but can be adapted to suit.

The first function (get times) requires that Matt Parrish's 'uk-trains' node is installed from NPM in your node red directory. You will also need a Darwin API key from [National Rail](http://www.nationalrail.co.uk/100296.aspx), and this API key needs to be inserted as the 'apikey' in the code.
The purpose of this first function is to query the Darwin system and return the train services and NRCC messages for the requested station.

The second function (reformat) takes the output from the first function and reformats it into 3 separate outputs:
1. An output to 2 UI dashboard templates (one to display the times and the other to display the NRCC messages)
1. An output sending a further formatted version of the train times to MQTT.
1. An output sending a further formatted version of any NRCC messages to MQTT.
