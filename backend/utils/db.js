const mysql = require ('mysql2');

//Maybe replace with mysql.createPool
//Maybe replace with mysql.createPool
const connection = mysql.createConnection({
	host: '130.225.39.205',
	user: 'user',
	password: 'password',
	database: 'Agora',
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to MySQL');
});

module.exports = connection;