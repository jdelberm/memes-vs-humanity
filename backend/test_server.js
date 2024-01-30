const { io } = require("socket.io-client");

const p1 = io("ws://localhost:3005");
const p2 = io("ws://localhost:3005");
const p3 = io("ws://localhost:3005");
const p4 = io("ws://localhost:3005");

let p4playerData = {}
let p4memeset = {}

p1.emit("user-join", (data) => console.log(data));
p2.emit("user-join", (data) => console.log(data));
p3.emit("user-join", (data) => console.log(data));

p4.emit("user-join", (player) => {
	p4playerData = player;
});

p4.on("room-ready", (counter) => {
	console.log(`Room ready, counter received => ${counter}`)
	p4.emit("ask-for-memes", p4playerData);
});

p4.on("display-selection", (playersSelection, chosenMemes) => {
	console.log("Playes selection: ", playersSelection);
	console.log("Chosen memes: ", chosenMemes);

	p1.emit("vote-meme", { uuid: 1, roomID: p4playerData.roomID }, p4memeset[0].id);
	p2.emit("vote-meme", { uuid: 2, roomID: p4playerData.roomID }, p4memeset[0].id);
	p3.emit("vote-meme", { uuid: 3, roomID: p4playerData.roomID }, p4memeset[0].id);
	p4.emit("vote-meme", p4playerData, p4memeset[0].id);
})

p4.on("display-score", (score) => { console.log(score) });

p4.on("proccess-meme", (memeset) => {
	p4memeset = memeset;
	memeset.forEach(meme => {
		console.log(`Received meme with ID ${meme.id} (data size: ${meme.src.length} bytes)`);
	});

	//Simulating everybody received his memeset at the same time
	p1.emit("meme-ready", p4playerData.roomID);
	p2.emit("meme-ready", p4playerData.roomID);
	p3.emit("meme-ready", p4playerData.roomID);
	p4.emit("meme-ready", p4playerData.roomID);
})


p4.on("get-quote", (quote) => {
	console.log(`Random quote received => ${quote}`);
	//Simulate selection
	console.log("Player data: ", p4playerData);
	setTimeout(() => {
		p1.emit("select-meme", { uuid: 1, roomID: p4playerData.roomID }, p4memeset[0].id);
		p2.emit("select-meme", { uuid: 2, roomID: p4playerData.roomID }, p4memeset[0].id);
		p3.emit("select-meme", { uuid: 3, roomID: p4playerData.roomID }, p4memeset[0].id);
		p4.emit("select-meme", p4playerData, p4memeset[0].id);
	}, 2000);
})