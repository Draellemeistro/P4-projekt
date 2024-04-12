const crypto = require('crypto');
const fs = require('fs');


//TODO make key geneartion client side and send public key to server

// Function to generate the keypair
function genKeyPair() {
	// Generates an object where the keys are stored in properties `privateKey` and `publicKey`
	const keyPair = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096, // bits - standard for RSA keys
		publicKeyEncoding: {
			type: 'pkcs1', // "Public Key Cryptography Standards 1"
			format: 'pem' // Most common formatting choice
		},
		privateKeyEncoding: {
			type: 'pkcs1', // "Public Key Cryptography Standards 1"
			format: 'pem' // Most common formatting choice
		}
	});

	// Create the public key file
	fs.writeFileSync(__dirname + '/id_rsa_pub.pem', keyPair.publicKey);

	// Create the private key file
	fs.writeFileSync(__dirname + '/id_rsa_priv.pem', keyPair.privateKey);

	// Return the keyPair object
	return keyPair;
}

// Generate the keypair
genKeyPair();