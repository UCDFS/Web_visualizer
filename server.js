// Node Express Server
const express = require('express');
const port = 3000;
const app = express();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parse');
const datetime = require('node-datetime');
const net = require('net');

// Express sever endpoints
// Static assets
app.use(express.static(path.join(__dirname, 'public'))); 

// Html page
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Database endpoints

// Temporary storage of queued values for frontend (passed from DB)
var speeds_queued={times:[], speeds:[]};
var last_state = {time:0, speed:0};

var csvdata = [];
var parser = csv();

fs.createReadStream('data.csv')  
	.pipe(csv())
  	.on('data', (row) => {
    		csvdata.push(row);
  	})
  	.on('end', () => {
    		console.log('CSV file successfully processed');
    		console.log("csvdata length = " + csvdata.length);
 		var test = datetime.create(csvdata[1][1]);
		console.log(test); 
  	});

//Init
speeds_queued.times.push(1);
speeds_queued.speeds.push(60);
speed_delta = 0;
var dt = datetime.create();

// Returns any initial data for the graph as desired
app.get('/speed', (req, res) => {
    res.send({"labels":speeds_queued.times,"data": speeds_queued.speeds});
});

// Gets called incrementally by the frontend and returns the next value
app.get('/speed_latest', (req,res)=> {
    if(speeds_queued.times.length > 0) {
        last_state.time = speeds_queued.times.shift();
        last_state.speed = speeds_queued.speeds.shift();
        res.send({"labels":[last_state.time],"data":[last_state.speed]});

        // Fake generation of more data
	if (last_state.time <= csvdata.length){
		speeds_queued.times.push(last_state.time + 1);	
	} else{
		speeds_queued.times.push(1);
	}

	if (speeds_queued.times < 1){
		speeds_queued.speeds.push(0);
	} else{
		var currentrow = csvdata[speeds_queued.times[speeds_queued.times.length-1]];
		var pastrow = csvdata[speeds_queued.times[speeds_queued.times.length-2]];

	}

	if (last_state.speed < 30) {
		speed_delta = 2}
	 if (last_state.speed > 60) {
		speed_delta = -2
	} else {
		speed_delta = Math.round(Math.random()*4) - 2;
	}
        speeds_queued.speeds.push(last_state.speed + speed_delta);

    } else {
        res.send({"labels":[],"data":[]});
    }
    
})

// Set the port and launch the server
app.listen(port);
