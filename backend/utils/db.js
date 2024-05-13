const mysql = require ('mysql2');

//Maybe replace with mysql.createPool
//Maybe replace with mysql.createPool
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'Agora',
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to MySQL');
});

module.exports = connection;