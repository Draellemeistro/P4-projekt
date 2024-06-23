const mysql = require ('mysql2');

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

function checkVoteStatus(ID) {
	return new Promise((resolve, reject) => {
		const checkQuery = 'SELECT * FROM Agora.votes WHERE id = ?';
		connection.query(checkQuery, [ID], (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				reject(err);
			} else {
				resolve(result.length > 0 && !result[0].HasVoted);
			}
		});
	});
}

function updateVoteStatus(ID) {
	return new Promise((resolve, reject) => {
		const updateQuery = 'UPDATE Agora.votes SET hasVoted = true WHERE id = ?';
		connection.query(updateQuery, [ID], (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				reject(err);
			} else {
				resolve(result.affectedRows > 0);
			}
		});
	});
}

function insertEncryptedBallot(innerLayer) {
	return new Promise((resolve, reject) => {
		const ballotQuery = 'INSERT INTO Agora.ballotbox (encr_ballot) VALUES (?)';
		connection.query(ballotQuery, [innerLayer], (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				reject(err);
			} else {
				resolve(result.affectedRows > 0);
			}
		});
	});
}
function getUserByPersonIdHash(personIdHash) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT ID, email, vote_id FROM Agora.users WHERE person_id = ?';
		connection.query(query, [personIdHash], (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
}

function getCandidates() {
	return new Promise((resolve, reject) => {
		const query = 'SELECT candidate, party FROM Agora.ballot';
		connection.query(query, (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
}

function getVoteId(ID) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT vote_id FROM Agora.users WHERE ID = ?';
		connection.query(query, [ID], (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(results[0].vote_id);
			}
		});
	});
}
function getAllBallots() {
	return new Promise((resolve, reject) => {
		connection.query(`SELECT encr_ballot FROM Agora.ballotbox`, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results.map(result => result[encr_ballot]));
			}
		});
	});
}

module.exports = {
	connection,
	checkVoteStatus,
	updateVoteStatus,
	insertEncryptedBallot,
	getUserByEmail: getUserByPersonIdHash,
	getCandidates,
	getVoteId,
	getAllBallots,
};

