// routes/get-email.js
import express from 'express';
import { generateOTP } from '../utils/generateOTP.js';
import connection from '../utils/db.js';
import { otpStore } from '../utils/otpStore.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/', async (req, res) => {
	const { personId, voteId } = req.body;

	connection.query('SELECT email FROM Agora.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], async (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				const otp = generateOTP();
				const timestamp = Date.now();
				otpStore[personId] = { otp, timestamp };

				try {
					await sendEmail(email, otp);
					res.json({ publicKey });
				} catch (error) {
					res.status(500).send('Error sending email');
				}
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

export default router;