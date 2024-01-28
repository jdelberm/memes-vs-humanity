const { log } = require("console");
const { response } = require("express");
const fs = require("fs");
const _ = require("underscore");

class Memes {
	memeList = {};
	alreadyShown = new Map();

	loadMemelist() {
		const jsonStr = fs.readFileSync('./meme_list.json', 'utf8');
		this.memeList = JSON.parse(jsonStr);
	}

	getRandomMemeFor(room, player) {
		if (!this.alreadyShown[room]) {
			this.alreadyShown[room] = new Map();
		}
		if (!this.alreadyShown[room][player]) {
			this.alreadyShown[room][player] = new Set();
		}
		const seenMemes = this.alreadyShown[room][player];
		let meme = _.difference(this.memeList, Array.from(seenMemes))[0];
		if (meme) {
			seenMemes.add(meme);
		}
		else {
			//undefined
			meme = ""
		}
		console.log("result meme => ", meme);
		return meme;
	}

	getMemeSet(roomID, playerID) {
		console.log("Creating memeset for player: ", playerID);
		let memeset = [];

		for (let i = 0; i < 4; i++) {
			let memeRef = this.getRandomMemeFor(roomID, playerID);
			console.log("memeRef => ", memeRef);
			let path = "./memes/" + memeRef.path;
			console.log("Recovered path => ", path);
			let data = fs.readFileSync(path);
			let srcContent = "data:image/png;base64," + data.toString("base64");
			memeset.push(memeRef.id, srcContent);

		}
		console.log("Fullfilled memeset => ", memeset);
		return memeset;
	}

}

global.Memes = Memes;