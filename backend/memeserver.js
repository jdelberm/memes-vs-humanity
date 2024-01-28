require("./quotes");
require("./memes");
require("./room");

const log = new require("simple-node-logger").createSimpleLogger();

const _ROOM_PLAYERS = 4;
const _PORT = 3005;
const _PREMATCH_COUNTDOWN = 5;

const uuid = require("uuid");

const qm = new Quotes();
qm.loadQuotes();

const mm = new Memes();
mm.loadMemelist();

let roomsData = [];

const app = require("express")();
const httpServer = require("http").createServer(app);
const socket = require("socket.io");
const io = new socket.Server(httpServer, {
	cors: {
		origin: "*"
	}
});

httpServer.listen(_PORT, () => log.info("Server listening on port ", _PORT));

app.get("/hello", (req, res) => res.send("<h1>holacarapito</h1>"));

io.on("connection", (socket) => {
	log.info("User connected. SID: ", socket.id);

	roomsData.push(new Room("thisisarandomid"));

	//User joins a room and gets his uuid & room uuid
	socket.on("user-join", (callback) => {
		let room = Array.from(io.sockets.adapter.rooms).find(room => room.length < _ROOM_PLAYERS);
		if (!room) {
			room = uuid.v4();
		}
		socket.join(room);

		if (!roomsData.find(x => x.roomID == room[0])) {
			roomsData.push(new Room(room[0]));
		}

		let player = {
			uuid: uuid.v4(),
			room: room[0]
		}
		log.info("Player joined room ", room[0]);
		callback(player);
	});

	//4 memes are sent to the user
	socket.on("ask-for-memes", (room, uuid, callback) => {
		let memeset = mm.getMemeSet(room, uuid);
		callback(memeset);
	});

	//All users confirm they've received the memes
	socket.on("meme-ready", (roomID) => {
		let room = roomsData.find(x => x.roomID == roomID);
		if (room) {
			room.usersReady++;
			log.info("Meme ready users => ", room.usersReady);
			if (room.usersReady >= _ROOM_PLAYERS) {
				//Once everyone answered, send quote
				log.warn("Send quote to room: ", roomID);
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
		log.warn("User left: ", socket.id);
	});
});

//Predefined event: join-room
io.of("/").adapter.on("join-room", (room) => {
	if (room && room.size == _ROOM_PLAYERS) {
		log.info("Room players => ", room.size);
		log.warn("Room ", room, "is ready... starting game");
		io.in(room).emit("room-ready", { countdown: _PREMATCH_COUNTDOWN });
	}
})