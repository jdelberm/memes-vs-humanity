/**
 * Why to use custom room names?
 * Because when client B connects, socket B creates his own room by default.
 * These rooms are eligible for a game to be hosted in, and socket B can belong 
 * to socket A room and his own. If then socket C connects but
 * socket B current room is fullfilled, socket C will join socket B room, in
 * which socket B is already (because it's his own room), 
 * creating a duplicate room participation.
 */

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
	socket.on("user-join", () => {
		let room = Array.from(io.sockets.adapter.rooms).find(room => room[1].size ? room[1].size < _GAME_PLAYERS : true);
		if (!room) {
			log.info("There isn't any available room");
			roomID = uuid.v4();
		}
		socket.join(room);
		console.log(room);

		if (!games.find(x => x.roomID == room[0])) {
			games.push(new Game(room[0]));
		}

		let player = {
			uuid: uuid.v4(),
			roomID: room[0]
		}
		socket.emit("user-joined", player);
	});

	//4 memes are sent to the user
	socket.on("ask-for-memes", (player) => {
		console.log("player ", player);
		let memeset = mm.getMemeSet(player.roomId, player.userId);
		log.info(`Sending memeset to player ${player}`);
		socket.emit("proccess-meme", memeset);
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
	socket.on("select-meme", (player, memeID) => {
		let game = games.find(x => x.roomID == player.roomID);
		game.playersSelection.push({
			player: player.uuid,
			memeID: memeID
		});
		log.info(`Selection received: ${game.playersSelection.length} of ${_GAME_PLAYERS} players have an answer`);
		//Once all players made a selection, return the selection & score
		if (game.playersSelection.length == _GAME_PLAYERS) {
			console.log("Players selection", game.playersSelection);
			let memesIDs = game.playersSelection.map((x) => x.memeID);
			let chosenMemes = mm.getMemesByIDs(memesIDs);
			log.info("Sending players selection so everybody can see it");
			io.in(game.roomID).emit("display-selection", game.playersSelection, chosenMemes);
		}
	});

	//Once everyone received the selection, send the score
	socket.on("vote-meme", (player, memeID) => {
		let game = games.find(x => x.roomID == player.roomID);
		game.playersVote.push({
			player: player.uuid,
			memeID: memeID
		});
		log.info(`Vote received: ${game.playersVote.length} of ${_GAME_PLAYERS} players have voted`);
		if (game.playersVote.length == _GAME_PLAYERS) {
			let results = game.playersVote.map(vote => {
				return {
					memeID: vote.memeID,
					score: 0
				}
			});
			console.log("Results ", results);
			game.playersVote.forEach((sel) => {
				results.find((res) => res.memeID == sel.memeID).score++;
			})
			log.info("Sending round score");
			io.in(game.roomID).emit("display-score", results);
			game.reset();
			game.rounds++;
		}
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