const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mvhdb');

const sqlSpawn =
	"CREATE TABLE player( \
	uuid int \
	);";
const insertPlayer =
	"INSERT INTO player VALUES (?, ?)";

const selectPlayer =
	"SELECT * FROM player WHERE uuid EQ ?";

function initDatabase() {

	db.serialize(() => {
		db.run(sqlSpawn);

		db.each("SELECT uuid FROM player", (err, row) => {
			console.log(row.id + ": " + row.name);
		});
	});

	db.close();
}

function populateDB(){

	const stmt = db.prepare(insertPlayer);
	stmt.run(1);
	stmt.run(2);
	stmt.run(3);
	stmt.finalize();

}

function savePlayer(player) {
	const stmt = db.prepare(insertPlayer);
	stmt.run(player.uuid);
	stmt.finalize();
}

function getPlayerByID(uuid) {
	return new Promise((res, rej) => {
		db.get(selectPlayer, [uuid],
			(row) => {
				console.log(row)
				let player = {
					uuid: row.uuid
				}; +
					res(player);
			},
			(err) => rej("unregistered player"))
	});
}

module.exports = {
	initDatabase,
	savePlayer,
	getPlayerByID
};