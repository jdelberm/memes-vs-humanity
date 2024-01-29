require("./quotes");
require("./memes");
require("./game");

process.title = "memeserver";

const _GAME_PLAYERS = 4;
const _PORT = 3005;
const _PREMATCH_COUNTDOWN = 5;

const express = require("express");
const https = require("https");
const http = require("http");
const { readFileSync } = require("fs");
const socket = require("socket.io");
const uuid = require("uuid");

log = new require("simple-node-logger").createSimpleLogger({
	timestampFormat: 'YYYY-MM-DD HH:mm:ss'
});

const qm = new Quotes();
qm.loadQuotes();

const mm = new Memes();
mm.loadMemelist();

let games = [];

const app = express();
/*
const httpsServer = https.createServer (
	{
	key: readFileSync("./cert/mvh.jdevops.eu.key"),
	cert: readFileSync("./cert/mvh.jdevops.eu.crt")
	},
	app
);*/

const httpServer = http.createServer(app);

const io = new socket.Server(httpServer, {
	cors: {
		origin: "*"
	}
});

httpServer.listen(_PORT, () => log.info("Server listening on port ", _PORT));

app.get("/hello", (req, res) => res.send("<h1>holacarapito</h1>"));

io.on("connection", (socket) => {

	log.info(`User connected. SID: ${socket.id}`);

	//User joins a room and gets his uuid & room uuid
	socket.on("user-join", (callback) => {
		let room = Array.from(io.sockets.adapter.rooms).find(room => room[1].size < _GAME_PLAYERS);
		if (!room) {
			log.info("There isn't any available room");
			room = uuid.v4();
		}
		socket.join(room);

		if (!games.find(x => x.roomID == room[0])) {
			games.push(new Game(room[0]));
		}

		let player = {
			uuid: uuid.v4(),
			room: room[0]
		}
		callback(player);
	});

	//4 memes are sent to the user
	socket.on("ask-for-memes", (player, callback) => {
		let memeset = mm.getMemeSet(player.roomId, player.userId);
		log.info(`Sending memeset to player ${player}`);
		callback(memeset);
	});

	//All users confirm they've received the memes
	socket.on("meme-ready", (roomID) => {
		let game = games.find(x => x.roomID == roomID);
		if (game) {
			game.usersReady++;

			log.info(`Users with memeset fully loaded => ${game.usersReady} / ${_GAME_PLAYERS}`);

			if (game.usersReady >= _GAME_PLAYERS) {
				//Once everyone answered, send quote
				log.warn(`Sending quote to room: ${roomID}`);
				io.in(roomID).emit("get-quote", qm.getRandomQuoteFor(roomID));
			}
		}
	});

	//Proccess user selection
	socket.on("select-meme", (roomID, playerID, memeID) => {
		let game = games.find(x => x.roomID == roomID);
		game.playerSelection = {
			player: playerID,
			selection: memeID
		}
		//Once all players made a selection, return the selection & score
		if (game.playerSelection.length == _GAME_PLAYERS) {
			let memesIDs = game.playerSelection.map((x) => x.id);
			let choosenMemes = mm.getMemesByIDs(memesIDs);
			io.in(game.roomID).emit("display-selection", game.playerSelection, choosenMemes);
		}
	});

	//Once everyone received the selection, send the score
	socket.on("selection-ready", (roomID) => {
		let game = games.find(x => x.roomID == roomID);
		let results = game.playerSelection.map(sel => {
			return {
				memeID: sel.id,
				score: 0
			}
		});
		game.playerSelection.foreach((sel) => {
			results.get(sel).score++;
		})
		game.reset();
		game.rounds++;
		io.in(game.roomID).emit("display-score", results);
	})

	//Predefined event: disconnect
	socket.on("disconnect", () => {
		log.warn("User left: ", socket.id);
	});
});

//Predefined event: join-room
io.of("/").adapter.on("join-room", (room) => {

	//Avoid proccess if the room is the socket private room
	if (room.size) {
		let roomID = room.size ? Array.from(room)[0] : room;
		log.info(`Room joined (${room?.size} / ${_GAME_PLAYERS} players}). ID: ${roomID}`);

		log.info("Room players => ", room.size);

		if (room.size == _GAME_PLAYERS) {
			log.warn("Room ", Array.from(room)[0], "is ready... starting game");

			io.in(room).emit("room-ready", _PREMATCH_COUNTDOWN);
		}
	}
})