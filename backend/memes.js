const log = new require("simple-node-logger").createSimpleLogger();
const { getRandomValues } = require("crypto");
const { response } = require("express");
const fs = require("fs");
const _ = require("underscore");

class Memes {
	memeList = {};
	alreadyShown = new Map();

	//Loads an index file with id & path reference to the image
	loadMemelist() {
		const jsonStr = fs.readFileSync('./meme_list.json', 'utf8');
		this.memeList = JSON.parse(jsonStr);
	}

	//Returns the meme file
	getMeme(memeRef) {
		let path = "./memes/" + memeRef.path;
		log.info("meme path => ", path);
		let data = fs.readFileSync(path);
		let srcContent = "data:image/png;base64," + data.toString("base64");
		let meme = {
			id: memeRef.id,
			src: srcContent
		}
		return meme;
	}

	//Returns a random unseen meme reference (id & file path)
	getRandomMemeRefFor(room, player) {
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
			//no available memes remaining
			meme = ""
		}
		log.info("result meme => ", meme);
		return meme;
	}

	//Returns a set of memes
	getMemeSet(roomID, playerID) {
		log.info("Creating memeset for player: ", playerID);
		let memeset = [];

		for (let i = 0; i < 4; i++) {
			let memeRef = this.getRandomMemeRefFor(roomID, playerID);
			memeset.push(this.getMeme(memeRef));
		}
		log.info("Fullfilled memeset for: ( " + roomID + " : " + playerID + " )");
		return memeset;
	}

	//Returns memes identified by their ID
	getMemesByIDs(memesIDs) {
		let memeset = [];

		memesIDs.forEach((memeID) => {
			let memeRef = this.memeList[memeID];
			memeset.push(this.getMeme(memeRef));
		})
	}
}

global.Memes = Memes;