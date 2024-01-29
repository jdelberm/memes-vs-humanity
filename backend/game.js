class Game {

	constructor(roomID) {
		this.roomID = roomID;
		this.usersReady = 0;
		this.selectionsReady = 0;
		this.rounds = 0;
	}
}
global.Game = Game;