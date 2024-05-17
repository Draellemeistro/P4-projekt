const mysql = require('mysql');
const crypto = require('crypto');
const uuid = require('uuid');
const connection = require('../db.js'); // replace with the actual path to your db.js file

function generateMockDanishCPR() {
	const date = new Date(Date.now() - Math.floor(Math.random() * 1000000000000));
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear()).slice(-2);
	const id = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
	return `${day}${month}${year}${id}`;
}

async function hashString(detail) {
	const encoder = new TextEncoder();
	const dataVoteId = encoder.encode(detail);
	return crypto.createHash('sha256').update(dataVoteId).digest('hex')
}

async function populateUsersTable() {
	console.log('Connected to the database.');

	for (let i = 0; i < 100; i++) {
		const ssin = generateMockDanishCPR();
		const hashedSSIN = await hashString(ssin);
		const email = `${crypto.randomBytes(10).toString('hex')}@example.com`;
		const vote_id = uuid.v4();
		console.log(ssin, hashedSSIN, email, vote_id);
		const sql = 'INSERT INTO users (person_id, email, vote_id) VALUES (?, ?, ?)';
		connection.query(sql, [hashedSSIN, email, vote_id], (err, result) => {
			if (err) throw err;
			console.log('Inserted data into the users table.');
		});
	}
}
async function populateVoteTable() {
	console.log('Connected to the database.');

	// Fetch all vote_id from the votes table
	const sqlFetch = 'SELECT VoteID FROM votes';
	connection.query(sqlFetch, async (err, results) => {
		if (err) throw err;

		// For each vote_id, calculate the hash and update the voteID_hash column
		for (let i = 0; i < results.length; i++) {
			const vote_id = results[i].VoteID;
			const hashedVoteId = await hashString(vote_id); // Hash the vote_id

			// Update the voteID_hash column with the hashed vote_id
			const sqlUpdate = 'UPDATE votes SET VoteID_hash = ? WHERE VoteID = ?';
			connection.query(sqlUpdate, [hashedVoteId, vote_id], (err, result) => {
				if (err) throw err;
				console.log('Updated voteID_hash in the votes table for vote_id:', vote_id);
			});
		}
	});
}

populateVoteTable();