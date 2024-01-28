require("./quotes");
require("./memes");

const _ROOM_PLAYERS = 4;

const express = require("express");
const app = express();
const uuid = require("uuid");

const qm = new Quotes();
qm.loadQuotes();

const mm = new Memes();
mm.loadMemelist();

let roomsData = [];

const fs = require("fs");
const http2 = require("http2");
const httpsServer = http2.createSecureServer({
	app: app,
	key: fs.readFileSync("certs/privkey.pem"),
	cert: fs.readFileSync("./certs/cert.pem")
  });

  
const socket = require("socket.io");
const io = new socket.Server(httpsServer, {
	cors: {
		origin: "*"
	}
});

class Room {

	constructor(roomID) {
		this.roomID = roomID;
		this.usersReady = 0;
		this.selectionsReady = 0;
		this.rounds = 0;
	}
}

httpsServer.listen(3005);

app.get("/hello", (req, res) => res.send("<h1>holacarapito</h1>"));

//Predefined event: connect
io.on("connection", (socket) => {
	console.log("User connected");

	roomsData.push(new Room("thisisarandomid"));

	socket.on("user-join", (callback) => {
		let room = Array.from(io.sockets.adapter.rooms).find(room => room.length < _ROOM_PLAYERS);
		if (!room) {
			room = uuid.v4();
		}
		socket.join(room);

		let player = {
			uuid: uuid.v4(),
			room: room[0]
		}
		if (!roomsData.find(x => x.roomID == room[0])) {
			roomsData.push(new Room(room[0]));
		}
		console.log("Player joined room ", room[0]);
		callback(player);
	});

	//Send 4 memes to the user
	socket.on("ask-for-memes", (room, uuid, callback) => {
		let memeset = mm.getMemeSet(room, uuid);
		callback(memeset);
	});

	socket.on("meme-ready", (roomID) => {
		let room = roomsData.find(x => x.roomID == roomID);
		if (room) {
			room.usersReady++;
			console.log("Meme ready users => ", room.usersReady);
			if (room.usersReady >= _ROOM_PLAYERS) {
				//Once everyone answered, send quote
				console.log("Send quote to room: ", roomID);
				io.in(roomID).emit("get-quote", qm.getRandomQuoteFor(roomID));
			}
		}
	});

	//Proccess user selection
	socket.on("select-meme", (roomID, playerID, memeID) => {
		let room = roomSet.find(x => x.roomID == roomID);
		room.selectionReady++;
		if (room.selectionReady == _ROOM_PLAYERS) {

		}
	});

	//Calculate the winner
	socket.on("vote-meme", () => { });

	//Predefined event: disconnect
	socket.on("disconnect", () => {
		console.log("User marico left");
	});
});

//Predefined event: join-room
io.of("/").adapter.on("join-room", (room) => {
	if (room.size) {
		console.log("Room players => ", room.size);
	}
		if (room && room.size == _ROOM_PLAYERS) {
			console.log("Room ", room, "is ready... starting game");
			io.in(room).emit("room-ready", { countdown: 5 });
		}
})