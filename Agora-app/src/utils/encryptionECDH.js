

const ECDHCrypto ={
	initECDH: async function initECDH(){
		let keyStringObject;
		const clientKeyPairECDH = await window.crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
		const exportedPubKeyECDH = await window.crypto.subtle.exportKey('jwk', clientKeyPairECDH.publicKey);
		console.log('client public key as JWK: ', exportedPubKeyECDH);
		const fixedPubKey = this.fixAndValidateJWK(exportedPubKeyECDH);
		const exportedPrivKeyECDH = await window.crypto.subtle.exportKey('jwk', clientKeyPairECDH.privateKey);
		console.log('client secret key as JWK: ', exportedPrivKeyECDH);
		console.log('the different fields:')
		console.log('crv: ', exportedPrivKeyECDH.crv);
		console.log('ext: ', exportedPrivKeyECDH.ext);
		console.log('key_ops: ', exportedPrivKeyECDH.key_ops);
		console.log('kty: ', exportedPrivKeyECDH.kty);
		console.log('x: ', exportedPrivKeyECDH.x);
		console.log('y: ', exportedPrivKeyECDH.y);

		// Convert the keys to strings
		const keyStringPriv = JSON.stringify(exportedPrivKeyECDH);
		const keyStringPub = JSON.stringify(fixedPubKey);
		sessionStorage.setItem('clientPublicKeyECDH', keyStringPub);
		//probably not secure to store private key in session storage
		sessionStorage.setItem('clientPrivateKeyECDH', keyStringPriv);
		keyStringObject = {keyStringPub, keyStringPriv};
		console.log('keyStringObject: ', keyStringObject);
		return keyStringObject;
	},


	encodeXYPropertiesJWK: function base64urlEncode(str) {
		let base64 = btoa(str);
		base64 = base64.replace('+', '-');
		base64 = base64.replace('/', '_');
		base64 = base64.replace(/=+$/, '');
		return base64;
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
		if (!response.ok) {
			console.error('Failed to fetch server public key');
		}
		const data = await response.json();
		const serverPublicKeyECDHString = data.serverPubECDKey;
		const serverPublicKeyECDHStringFixed = data.fixedVersion;
		if(serverPublicKeyECDHStringFixed === serverPublicKeyECDHString) {
			console.log('server public key is the same as the fixed version');
		} else {
			console.log('server public key is different from the fixed version');
			console.log('serverPublicKeyECDHString: ', serverPublicKeyECDHString);
			console.log('serverPublicKeyECDHStringFixed: ', serverPublicKeyECDHStringFixed);
		}
		const serverPublicKeyParsed = JSON.parse(serverPublicKeyECDHString);
		const serverPublicKeyFixedParsed = JSON.parse(serverPublicKeyECDHStringFixed);
		const JWKToPassOn = {
			crv: serverPublicKeyParsed.crv,
			ext: serverPublicKeyParsed.ext,
			key_ops: serverPublicKeyParsed.key_ops,
			kty: serverPublicKeyParsed.kty,
			x: serverPublicKeyParsed.x,
			y: serverPublicKeyParsed.y,
		};
		console.log(serverPublicKeyParsed.crv); // Outputs: P-521
		console.log(serverPublicKeyParsed.ext); // Outputs: true
		console.log(serverPublicKeyParsed.key_ops); // Outputs: ["deriveKey", "deriveBits"]
		console.log(serverPublicKeyParsed.kty); // Outputs: EC
		console.log(serverPublicKeyParsed.x); // Outputs: AdYvvEQwZXZdXR4iDr2c3SibRnME4aZd2zvXWsYsomd3k7FYBzvvXlj9dYOKISNY-3Fy9OxSzXatd9Y3jtCslgny
		console.log(serverPublicKeyParsed.y); // Outputs: AeEO7TDgQIOhoTobohPLWL4vGePOMMSvPJ3V0DzVLxGNQAlhXbTZ4Wz_Y4EX604iDjC_1EhxlSyk121_UhsuLPP8

		let serverPublicKeyJwk;
		try{
			serverPublicKeyJwk = await window.crypto.subtle.importKey(
				'jwk',
				JWKToPassOn,
				{
					name: 'ECDH',
					namedCurve: 'P-521',
				},
				true,
				["deriveKey"],

			);
		} catch (error) {
			try {
				serverPublicKeyJwk = await window.crypto.subtle.importKey(
					'jwk',
					serverPublicKeyFixedParsed,
					{
						name: 'ECDH',
						namedCurve: 'P-521',
					},
					true,
					["deriveKey"],
				);} catch (error) {
				console.error('Failed to import FIXED server public key: ', error);
			}
			console.error('Failed to import server public key: ', error);
		}


		console.log('server public key as JWK: ', serverPublicKeyJwk);
		const keyString = JSON.stringify(serverPublicKeyJwk); //probably redundant, but just to be sure
		console.log('server public key from stringified keystring: ', keyString);
		sessionStorage.setItem('serverPublicKeyECDH', keyString);
		return keyString;
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
			body: ({
				sharedSecret: keyStringSharedSecret,
				clientPublicKey: keyStringPub
			})
		}); if (response.status !== 200) {
			console.error('Failed to send encrypted ballot');
		} if (response.ok) {
			console.log('server received shared secret and public key');
			if (response.data.responseValue === 'true') {
				console.log('shared secret key is identical on both client and server');
			} else if (response.data.responseValue === 'false') {
				console.log('shared secret key is not identical on both client and server');
				return 0;
			} else {
				console.log('response.data is not a boolean or some other error occurred');
				return -1;
			}
			const serverSharedSecret = response.data.serverSharedSecret;
			if (serverSharedSecret === keyStringSharedSecret) {
				console.log('server shared secret is identical to client shared secret');
				return 1;
			}
		}
	},
	decideClientECDHString: function decideECDHString(clientKeyStringPub) {
		let keyStringPubToUse;
		if (clientKeyStringPub === undefined) {
			console.error('keyStringPub is undefined');
			const clientPubKeySessionStorage = sessionStorage.getItem('clientPublicKeyECDH');
			if (clientPubKeySessionStorage === undefined || clientPubKeySessionStorage === null) {
				console.error('clientPubKeySessionStorage is undefined');
				return 0;
			} else {
				keyStringPubToUse = clientPubKeySessionStorage;
				console.log('server public key from session storage: ', keyStringPubToUse);
			}
		} else	{
			keyStringPubToUse = clientKeyStringPub;
			console.log('server public key from function parameter: ', keyStringPubToUse);
		}
		return keyStringPubToUse;
	},
	tempSendEDCHKey: async function sendECDHKeyToServer(keyStringPubToUse) {
		const response = await fetch('https://130.225.39.205:3030/temp-ecdh-key-from-client', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: ({clientPublicKey: keyStringPubToUse})
		});
		console.log('client key sent');
		if (response.ok) {
			console.log('server fetched public key from client');
			const data = await response.json();
			if (data.responseValue === 'true') {
				console.log('received public key string has actual value');
				if (data.returnKey === keyStringPubToUse) {
					console.log('The server received the correct public key');
					return 1;
				} else {
					console.error('server received incorrect public key');
					return 0;
				}
			} else {
				console.error('server received public key string with no value');
				return 0;
			}
		} else {
			console.error('Failed to send public key');
			return 0;
		}
	},
	fixAndValidateJWK: function insertKeyOpsAndValidate(jwkToValidate) {
		let jwk;
		if (typeof jwkToValidate === 'string') {
		jwk = JSON.parse(jwkToValidate);
			if (!jwk.key_ops) {
				jwk.key_ops = [];
			}
			if (!jwk.key_ops.includes('deriveKey')) {
				jwk.key_ops.push('deriveKey');
			}
			if (!jwk.key_ops.includes('deriveBits')) {
				jwk.key_ops.push('deriveBits');
			}
			if (!jwk.ext) {
				jwk.ext = true;
			}
			const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];
			const isValid = validProperties.every(prop => prop in jwk);
			if (!isValid) {
				throw new Error('Invalid JWK format');
			}
			return jwk;
		}

		jwk = jwkToValidate;
	// Insert key_ops into the JWK
		if (!jwk.key_ops) {
			jwk.key_ops = [];
		}

		// Add "deriveKey" and "deriveBits" to key_ops if they're not already present
		if (!jwk.key_ops.includes("deriveKey")) {
			jwk.key_ops.push("deriveKey");
		}
		if (!jwk.key_ops.includes("deriveBits")) {
			jwk.key_ops.push("deriveBits");
		}
		if (!jwk.ext) {
			jwk.ext = true;
		}
			// Define the properties that a valid JWK should have
		const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];

		// Check if the JWK has all the valid properties
		const isValid = validProperties.every(prop => prop in jwk);

		if (!isValid) {
			throw new Error('Invalid JWK format');
		}

		return jwk;
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
