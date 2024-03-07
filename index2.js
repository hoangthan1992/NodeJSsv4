import express, { json, text } from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from 'socket.io';
const io = new Server(3002);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// global variables for the server
var playerSpawnPoints = [];
var clients = [];

app.get('/', function(req, res) {
	res.send('hey you got back get "/"');
});

io.on("connection", (socket)=> {
	console.log("connection"); 
	var currentPlayer = {};
	currentPlayer.name = 'phi hanh';	

	socket.on("player connect", function() {
		console.log(currentPlayer.name+" recv: player connect: "+clients.length);
		for(var i =0; i<clients.length;i++) {
			console.log(clients[i].name);
			var playerConnected = {
				name:clients[i].name,
				position:clients[i].position,
				rotation:clients[i].position,
			};
			// in your current game, we need to tell you about the other players.
			socket.emit("other player connected", playerConnected);
			console.log(currentPlayer.name+' emit: other player connected: '+JSON.stringify(playerConnected));
		}
	});
    socket.on("t",data=>
    {
        console.log(data);
        socket.emit("t",data);
		data= JSON.parse(data);
        console.log(data.user_id);
    });
	socket.on("play", data=> {
		console.log(currentPlayer.name+' recv: play: '+data+", clientslength: "+clients.length );
		// if this is the first person to join the game init the enemies
		if(clients.length === 0) {
			data= JSON.parse(data);
			console.log(data.playerSpawnPoints);
			if (Array.isArray(data.playerSpawnPoints)) {
				data.playerSpawnPoints.forEach(function(_playerSpawnPoint) {
					var playerSpawnPoint = {
						position: _playerSpawnPoint.position,
						rotation: _playerSpawnPoint.rotation
					};
					playerSpawnPoints.push(playerSpawnPoint);
				});
			} else {
				console.log('playerSpawnPoints không phải là một mảng');
			}			
		}

		var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
		currentPlayer = {
			name:data.name,
			position: randomSpawnPoint.position,
			rotation: randomSpawnPoint.rotation,
		};
		clients.push(currentPlayer);
		// in your current game, tell you that you have joined
		console.log(currentPlayer.name+' emit: play: '+JSON.stringify(currentPlayer));
		socket.emit("play", currentPlayer);
		// in your current game, we need to tell the other players about you.
		socket.broadcast.emit("other player connected", currentPlayer);
	});

	socket.on("player move", (data)=> {
		console.log('recv: move: '+data);
		data= JSON.parse(data);
		currentPlayer.position = data.position;		
		console.log( currentPlayer.name+", pos: "+currentPlayer.position);
		socket.broadcast.emit("player move", currentPlayer);
	});

	socket.on("player turn", (data)=> {
		console.log('recv: turn: '+JSON.stringify(data));
		data= JSON.parse(data);
		currentPlayer.rotation = data.rotation;
		socket.broadcast.emit("player turn", currentPlayer);
	});

	socket.on('disconnect', function() {
		console.log(currentPlayer.name+' recv: disconnect '+currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		console.log(currentPlayer.name+' bcst: other player disconnected '+JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});

});

console.log('--- server is running ...');

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}