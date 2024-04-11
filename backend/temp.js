const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql');

const app = express();
app.use(express.json());

// Maybe replace with mysql.createPool
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your-username',
    password: 'your-password',
    database: 'your-database'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Function to get secret key for a user from the database
function getSecretKeyForUser(email, callback) {
    connection.query('SELECT secret_key FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            callback(err);
        } else {
            callback(null, results[0].secret_key);
        }
    });
}

// Function to generate a 6-digit OTP from a secret key
function generateOTP(secretKey) {
    const hmac = crypto.createHmac('sha256', secretKey);
    const otp = hmac.digest('hex').substring(0, 6);
    return otp;
}

app.post('/start-2fa', (req, res) => {
    const email = req.body.email;
    getSecretKeyForUser(email, (err, secretKey) => {
        if (err) {
            res.status(500).send('Error fetching secret key');
        } else {
            const otp = generateOTP(secretKey);
            // Send the OTP to the user's email
            // Your email sending code goes here
            res.send('OTP sent');
        }
    });
});

app.listen(3000, () => console.log('Server started on port 3000'));
