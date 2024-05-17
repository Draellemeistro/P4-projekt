const mysql = require('mysql2');

const connection = mysql.createConnection({
	host: '130.225.39.205',
	user: 'user',
	password: 'password',
	database: 'Agora',
	port: 3366,
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to MySQL');
});

const db = {
	getVoteById: function(ID) {
		return new Promise((resolve, reject) => {
			const query = 'SELECT VoteID FROM Agora.votes WHERE id = ?';
			connection.query(query, [ID], (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results[0].VoteID);
				}
			});
		});
	},
	updateVoteStatus: function(ID) {
		return new Promise((resolve, reject) => {
			const query = 'UPDATE Agora.votes SET hasVoted = true WHERE id = ?';
			connection.query(query, [ID], (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});
	},
	insertEncryptedBallot: function(innerLayer) {
		return new Promise((resolve, reject) => {
			const query = 'INSERT INTO Agora.ballotbox (encr_ballot) VALUES (?)';
			connection.query(query, [innerLayer], (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});
	}
}

module.exports = db;