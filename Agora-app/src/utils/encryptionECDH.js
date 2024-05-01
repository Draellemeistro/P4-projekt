

const ECDHCrypto ={
	initECDH: async function initECDH(){
		const clientKeyPairECDH = await window.crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
		const exportedPubKeyECDH = await window.crypto.subtle.exportKey('jwk', clientKeyPairECDH.publicKey);
		const exportedPrivKeyECDH = await window.crypto.subtle.exportKey('jwk', clientKeyPairECDH.privateKey);
		const keyStringPriv = JSON.stringify(exportedPrivKeyECDH);
		const keyStringPub = JSON.stringify(exportedPubKeyECDH);
		sessionStorage.setItem('clientPublicKeyECDH', keyStringPub);
		//probably not secure to store private key in session storage
		sessionStorage.setItem('clientPrivateKeyECDH', keyStringPriv);

		return { keyStringPub, keyStringPriv };
	},




// Function to send client's public key and receive server's public key
	requestServerECDH: async function requestServerPublicKeyECDH(){
		const serverIP = '192.168.0.113';
		const serverPort = '3030';
		//
		const response = await fetch(`https://${serverIP}:${serverPort}/request-public-ecdh-key`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (response.ok) {
			const data = await response.json();
			const importedKey = await window.crypto.subtle.importKey(
				'jwk',
				data,
				{
					name: 'ECDH',
					namedCurve: 'P-521'
				},
				true,
				['deriveKey', 'deriveBits']
			);
			const exportedServerPubKeyECDH = await window.crypto.subtle.exportKey('jwk', importedKey);
			const keyString = JSON.stringify(exportedServerPubKeyECDH);
			sessionStorage.setItem('serverPublicKeyECDH', keyString);
			return keyString;
		} else {
			console.error('Failed to get public key');
		}
	},
// Function to compute shared secret
	deriveSecret: async function deriveSecretKey(clientPrivateKey, serverPubKeyJwkFormat) {
		let serverKeyForSecret;
		let clientKeyForSecret;
		const keyStringImported = JSON.parse(serverPubKeyJwkFormat);
		const serverPubKeySessionStorage = sessionStorage.getItem('serverPublicKeyECDH');
		const keyStringSessionStorage = JSON.parse(serverPubKeySessionStorage);
		if (!keyStringImported) {
			console.error('invalid server public key passed to function');
			if (keyStringImported === keyStringSessionStorage) {
				console.log('server public key variable is the same as the one stored in session storage');
			} else {
				console.log('server public key variable is different from the one stored in session storage');
				console.log('keyStringImported: ', keyStringImported);
				console.log('1\n2\n3\n4\n5\n6');
				console.log('keyStringSessionStorage: ', keyStringSessionStorage);
			}
		} else if (keyStringImported === keyStringSessionStorage) {
			serverKeyForSecret = keyStringSessionStorage;
			console.log('server public key variable is the same as the one stored in session storage');
		} else if (!keyStringSessionStorage) {
			serverKeyForSecret = keyStringImported;
			console.log('server public key variable is different from the one stored in session storage');
			console.log('keyStringImported: ', keyStringImported);
			console.log('1\n2\n3\n4\n5\n6');
			console.log('keyStringSessionStorage: ', keyStringSessionStorage);
		} else {
			console.log('how the hell did we get here?? serverKeyForSecret');
			serverKeyForSecret = keyStringSessionStorage;
		}


		const clientKeyStringImported = JSON.parse(clientPrivateKey);
		const clientKeySessionStorage = sessionStorage.getItem('clientPrivateKeyECDH');
		const clientKeyStringSessionStorage = JSON.parse(clientKeySessionStorage);
		if (!clientKeyStringImported) {
			console.error('invalid client private key passed to function');
			if (clientKeyStringImported === clientKeyStringSessionStorage) {
				console.log('client private key variable is the same as the one stored in session storage');
			} else {
				console.log('client private key variable is different from the one stored in session storage');
				console.log('clientKeyStringImported: ', clientKeyStringImported);
				console.log('1\n2\n3\n4\n5\n6');
				console.log('clientKeyStringSessionStorage: ', clientKeyStringSessionStorage);
			}
		} else if (clientKeyStringImported === clientKeyStringSessionStorage) {
			clientKeyForSecret = clientKeyStringSessionStorage;
			console.log('client private key variable is the same as the one stored in session storage');
		} else if (!clientKeyStringSessionStorage) {
			clientKeyForSecret = clientKeyStringImported;
			console.log('client private key variable is different from the one stored in session storage');
			console.log('clientKeyStringImported: ', clientKeyStringImported);
			console.log('1\n2\n3\n4\n5\n6');
			console.log('clientKeyStringSessionStorage: ', clientKeyStringSessionStorage);
		} else {
			console.log('how the hell did we get here?? clientKeyForSecret');
			clientKeyForSecret = clientKeyStringSessionStorage;
		}
		const sharedSecretKey = await window.crypto.subtle.deriveKey(
			{
				name: "ECDH",
				public: serverKeyForSecret,
			},
			clientKeyForSecret,
			{
				name: "AES-GCM",
				length: "256"
			},
			true,
			["encrypt", "decrypt"],
		);
		const exportedSharedSecretKey = await window.crypto.subtle.exportKey('jwk', sharedSecretKey);
		const sharedSecretString = JSON.stringify(exportedSharedSecretKey);
		sessionStorage.setItem('sharedSecretECDH', sharedSecretString);
		return sharedSecretString;
	},
	encryptECDH: async function encryptMessageECDH(message, sharedSecret) {
		const encoder = new TextEncoder();
		let SharedSecretForEncryption	// Check if the message and publicKey are valid
		if (typeof message !== 'string' || message.length === 0) {
			console.error('Invalid message. Please provide a non-empty string.');
			return false;
		}

		if (typeof sharedSecret !== 'string' || sharedSecret.length === 0) {
			console.error('Invalid sharedSecret. checking sessionStorage for public key');
			const keyString = sessionStorage.getItem('sharedSecretECDH');
			if (!keyString) {
				console.error('!--No public key found in sessionStorage.--!\n' +
					'!--Please make sure the key is stored correctly.--!');
				console.log('publicKey: ', sharedSecret);
				console.log('keyString', keyString);
				return false;
			} else {
				const jwkKey = JSON.parse(keyString);
				SharedSecretForEncryption = await window.crypto.subtle.importKey(
					'jwk',
					jwkKey,
					{
						name: 'AES-GCM',
						length: 256
					},
					true,
					['encrypt', 'decrypt']
				);
			}
		} else {
			const JwKSharedSecret = JSON.parse(sharedSecret);
			SharedSecretForEncryption = await window.crypto.subtle.importKey(
				'jwk',
				JwKSharedSecret,
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['encrypt', 'decrypt']
			);
		}
		const ivValue = window.crypto.getRandomValues(new Uint8Array(12)); //needed for decryption
		const encryptedMessage = await window.crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv: ivValue,
			},
			SharedSecretForEncryption,
			encoder.encode(message)
		);
		return {encryptedMessage, ivValue};
	},
	verifySharedSecretTest: async function verifyTestSharedSecret(keyStringSharedSecret, keyStringPub) {
		const response = await fetch('https://130.225.39.205:3030/check-shared-secret', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sharedSecret: keyStringSharedSecret,
				clientPublicKey: keyStringPub
			})
		}); if (response.status !== 200) {
			console.error('Failed to send encrypted ballot');
		} if (response.ok) {
			console.log('server received shared secret and public key');
			if (response.data === 'true') {
				console.log('shared secret key is identical on both client and server');
				return 1;
			} else if (response.data === 'false') {
				console.log('shared secret key is not identical on both client and server');
				return 0;
			} else {
				console.log('response.data is not a boolean or some other error occurred');
				return -1;
			}
		}
	},
// Function to perform ECDH key exchange, encrypt ballot, and send it to server
	// eslint-disable-next-line no-undef
	encryptBallotECDH_NOTIMPLEMENTED: async function performECDHAndEncryptBallot(ballot,client, clientKeys) {
		//TODO: implement this function

		// eslint-disable-next-line no-unused-vars
		let {a , b, c} = {ballot, client, clientKeys};
		return console.log('performECDHAndEncryptBallot... when this function is implemented');
	},
	agreeSharedSecret_NOTIMPLEMENTED: async function agreeSharedSecretKey() {
		//TODO: implement this function
		return console.log('shared secret key agreed... when this function is implemented');
	},
};
export default ECDHCrypto;
//export const performTestECDHAndEncryptBallot = (ballot) => {
//	// eslint-disable-next-line no-unused-vars
//	const {client, clientKeys}= initECDH();
//	//const clientPublicKeyBase64 = getPublicKey(clientKeys);
//	const serverPublicKeyECDH = fs.readFileSync('./serverPublicKeyECDH.pem', 'utf8');
//	const serverPublicKeyBase64 = serverPublicKeyECDH.toString();
//	const sharedSecret = computeSharedSecret(client, serverPublicKeyBase64);
//	return encryptMessageECDH(ballot, sharedSecret);
//}
//let ballot = 'Alice';
//let {encrypted_ballot, sharedSecret} = performTestECDHAndEncryptBallot(ballot);
//console.log(encrypted_ballot, sharedSecret);
