class Game {

	constructor(roomID) {
		this.roomID = roomID;
		this.usersReady = 0;
		this.playerSelection = [];
		this.rounds = 0;
	}

	reset() {
		this.usersReady = 0;
		this.playerSelection = [];
	}
}
global.Game = Game;