// utils/sendEmail.js
const nodemailer = require('nodemailer')

async function sendEmail(email, otp) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'agoraAuth@gmail.com',
			pass: 'vnfpggwavqkwfrmu'
		}
	});

	const mailOptions = {
		from: 'agoraAuth@gmail.com',
		to: email,
		subject: 'Your AGORA 2FA Code',
		text: `Your AGORA 2FA code is ${otp}`
	};

	return await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };