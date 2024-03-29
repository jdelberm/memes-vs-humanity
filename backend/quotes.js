const _ = require("underscore");

class Quotes {
	quotesData = {};
	alreadyShown = [];

	loadQuotes() {
		let fs = require('fs');
		const jsonStr = fs.readFileSync('./quotes_data.json', 'utf8');
		this.quotesData = JSON.parse(jsonStr);
	}

	getRandomQuoteFor(roomID) {
		let room = this.alreadyShown.find(x => x.roomID == roomID);
		if (!room) {
			room = {
				roomID: roomID,
				shown: new Set()
			}
			this.alreadyShown.push(room);
		}

		const seenQuotes = room.shown;
		let quotes = _.difference(this.quotesData, Array.from(seenQuotes));
		const quotesLength = quotes.length;

		const index = Math.trunc(Math.random() * quotesLength);
		let quote = quotes[index];
		if (quote) {
			seenQuotes.add(quote);
		}
		else {
			quote = "";
		}
		console.log("quote: ", quote);
		return quote;
	}
}

global.Quotes = Quotes;