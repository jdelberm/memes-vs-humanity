class Game {

	constructor(roomID) {
		this.roomID = roomID;
		this.usersReady = 0;
		this.playersSelection = [];
		this.playersVote = [];
		this.rounds = 0;
	}

	reset() {
		this.usersReady = 0;
		this.playerSelection = [];
		this.playersVote = [];
	}
}
global.Game = Game;