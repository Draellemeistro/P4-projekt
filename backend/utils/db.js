import mysql from 'mysql2';

const connection = mysql.createConnection({
	host: '130.225.39.205',
	user: 'user',
	password: 'password',
	database: 'Agora',
	port: '3366'
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to MySQL');
});

export default connection;