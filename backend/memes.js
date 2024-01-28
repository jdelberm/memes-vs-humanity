const log = new require("simple-node-logger").createSimpleLogger();
const { getRandomValues } = require("crypto");
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
		let availableMemes = _.difference(this.memeList, Array.from(seenMemes));
		const amLength = availableMemes.length;

		//Randomize the choosen meme
		let index = Math.trunc(Math.random() * amLength);
		let meme = availableMemes[index];
		if (meme) {
			seenMemes.add(meme);
		}
		else {
			//undefined
			meme = ""
		}
		log.info("result meme => ", meme);
		return meme;
	}

	getMemeSet(roomID, playerID) {
		log.info("Creating memeset for player: ", playerID);
		let memeset = [];

		for (let i = 0; i < 4; i++) {
			let memeRef = this.getRandomMemeFor(roomID, playerID);
			if (memeRef) {
				let path = "./memes/" + memeRef.path;
				log.info("meme path => ", path);
				let data = fs.readFileSync(path);
				let srcContent = "data:image/png;base64," + data.toString("base64");
				memeset.push({
					id: memeRef.id,
					src: srcContent
				});
			}

		}
		log.info("Fullfilled memeset for: ( " + roomID + " : " + playerID + " )");
		return memeset;
	}

}

global.Memes = Memes;