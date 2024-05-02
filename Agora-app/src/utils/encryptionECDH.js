

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
		console.log('ddddddddd: ', exportedPrivKeyECDH.d);


		// Convert the keys to strings
		const keyStringPriv = JSON.stringify(exportedPrivKeyECDH);
		const keyStringPub = JSON.stringify(fixedPubKey);
		console.log('keyStringPriv: ', keyStringPriv);
		sessionStorage.setItem('clientPublicKeyECDH', keyStringPub);
		//probably not secure to store private key in session storage
		sessionStorage.setItem('clientPrivateKeyECDH', keyStringPriv);
		keyStringObject = {keyStringPub, keyStringPriv};

		return keyStringObject;
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
		const JWKToPassOn = {
			crv: serverPublicKeyParsed.crv,
			ext: serverPublicKeyParsed.ext,
			key_ops: serverPublicKeyParsed.key_ops,
			kty: serverPublicKeyParsed.kty,
			x: serverPublicKeyParsed.x,
			y: serverPublicKeyParsed.y,
		};

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
				["deriveKey", "deriveBits"],

			);
		} catch (error) {
			console.log('its the fucking [deriveKey, deriveBits] part that fucks this up!!!!')
			try {
				serverPublicKeyJwk = await window.crypto.subtle.importKey(
					'jwk',
					JWKToPassOn,
					{
						name: 'ECDH',
						namedCurve: 'P-521',
					},
					true,
					[],
				)} catch (error) {
				console.error('Failed to import FIXED server public key: ', error);
				}
			console.error('Failed to import server public key: ', error);
		}
		let keyTestExport = await window.crypto.subtle.exportKey('jwk',serverPublicKeyJwk)
		keyTestExport = this.fixAndValidateJWK(keyTestExport)
		const keyString = JSON.stringify(keyTestExport); //probably redundant, but just to be sure
		console.log('server public key from stringified EXPORTkeystring: ', keyString);
		sessionStorage.setItem('serverPublicKeyECDH', keyString);
		return keyString;
	},
	compareKeyWithStorage: function(key) {
		const keyStringImported = key;
		const serverPubKeySessionStorage = sessionStorage.getItem('serverPublicKeyECDH');
		const clientKeyStringSessionStorage = sessionStorage.getItem('clientPublicKeyECDH')
		if (!keyStringImported) {
			console.error('invalid Key passed to function');
			if (keyStringImported === clientKeyStringSessionStorage) {
				console.log('Key variable is the same as the one stored in session storage: CLIENT');
			} else {
				if (keyStringImported === clientKeyStringSessionStorage) {
					console.log('Key variable is the same as the one stored in session storage: SERVER');
				} else {
					console.log('Maybe use the corresponding key in SessionStorage instead.');
				}
			}
		} else {
			console.log('Key variable is a valid keystring');
			if (keyStringImported === clientKeyStringSessionStorage) {
				console.log('the key corresponds to the client public key from storage');
			} else if (keyStringImported === serverPubKeySessionStorage) {
				console.log('the key corresponds to the server public key from storage');
			} else {
				console.log('the key does not correspond to either client public key or server public key in storage.\nCAREFUL!!!');
			}
			return 1;
		}
	},
// Function to compute shared secret
	/////////////
	//	SOMEHOW DOESN'T WORK WITH CHROME, BUT FIREFOX WORKS???????
	// 	FUCK THIS SHIT.
	//////////////
	deriveSecret: async function deriveSecretKey(clientPrivateKeyString, serverPubKeyString) {
		let serverKeyForSecret;
		let clientKeyForSecret;

		if (!this.compareKeyWithStorage(serverPubKeyString)) {
			console.log('invalid server public key STRING passed to function. Trying to use it anyway');
			serverKeyForSecret = serverPubKeyString;
		} else {
			serverKeyForSecret = JSON.parse(serverPubKeyString);
		}
		if(typeof clientPrivateKeyString === 'string') {
			clientKeyForSecret = JSON.parse(clientPrivateKeyString);
		} else {
			console.log('clientPrivateKey is not a string. Trying to use it anyway');
			clientKeyForSecret = clientPrivateKeyString;
		}
		const jwkClient = {
			ext: true,
			kty: clientKeyForSecret.kty,
			d: clientKeyForSecret.d,
			crv:clientKeyForSecret.crv,
			x: clientKeyForSecret.x,
			y: clientKeyForSecret.y
		};
		console.log('clientKeyForSecret D: ', clientKeyForSecret.d,);
		// eslint-disable-next-line no-unused-vars
		const jwkServer = {
			kty: serverKeyForSecret.kty,
			crv: serverKeyForSecret.crv,
			x: serverKeyForSecret.x,
			y: serverKeyForSecret.y,
			ext: true,
		};
		console.log('attempting to import client private key:.....');
		console.log('clientKeyForSecret: ', clientKeyForSecret);
		const clientKeyForSecretJWK = await window.crypto.subtle.importKey(
			'jwk',
			jwkClient,
			{
				name: 'ECDH',
				namedCurve: 'P-521',
			},
			true,
			["deriveKey", 'deriveKey']
		); console.log('attempting to import client private key: success');
		const serverKeyForSecretJWK = await window.crypto.subtle.importKey(
			'jwk',
			serverKeyForSecret,
			{
				name: 'ECDH',
				namedCurve: 'P-521',
			},
			true,
			["deriveKey", 'deriveKey']
		);
		//serverKeyForSecretJWK.usages = ['deriveKey'];
		//fix and validate the JWK if needed
		//clientKeyForSecret = this.fixAndValidateJWK(clientKeyForSecret);
		clientKeyForSecret = clientKeyForSecretJWK;
		serverKeyForSecret = serverKeyForSecretJWK;
		console.log('clientKeyForSecret: ', clientKeyForSecret);
		//console.log('serverKeyForSecret: ', serverKeyForSecret);
		let sharedSecretKey;
		console.log('attempting to derive shared secret key. param1 is serverkey, param2 is clientkey');
		try {
			sharedSecretKey = await window.crypto.subtle.deriveKey(
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
		} catch (error) {
			console.log('first attempt failed. Trying again with no key_ops');
			try {
				sharedSecretKey = await window.crypto.subtle.deriveKey(
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
					[],
				);
			} catch (error) {
				console.log('second attempt failed. Trying again with deriveBits instead of deriveKey');
				try {
					sharedSecretKey = await window.crypto.subtle.deriveBits(
						{
							name: "ECDH",
							public: serverKeyForSecret,
						},
						clientKeyForSecret,
						256
					);
				} catch (error)  {
					console.error('3: all three attempts at deriveKey failed: ', error);
				}
				console.error('2: Failed to derive shared secret key: ', error);
			}
			console.error('1: initial attempt failed: ', error);
		}
		console.log('shared secret key: ', sharedSecretKey);
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
		const response = await fetch('https://192.168.0.113:3030/check-shared-secret', {
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
			if (response.data.success === true || response.data.success === 'true') {
				console.log('shared secret key is identical on both client and server');
				return 'success';
			} else if (response.data.success === false || response.data.success === 'false') {
				console.log('shared secret key is not identical on both client and server');
				return 'failed';
			} else {
				console.log('response.data is not a boolean or some other error occurred');
				return 'error';
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
		console.log('keyStringPubToUse: ', keyStringPubToUse);
		console.log('keyStringPubToUse type: ', typeof keyStringPubToUse);
		console.log('sending public key to server');
		const response = await fetch('https://192.168.0.113:3030/temp-ecdh-key-from-client', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({clientPublicKey: keyStringPubToUse})
		});
		if (response.status !== 200) {
			console.log('info: ', response, 'status: ', response.status, 'ok: ', response.ok, 'statusText: ', response.statusText);
			console.error('Failed to send public key');
		}
		console.log('client key sent');
		if (response.ok) {
			console.log('server fetched public key from client');
			const data = await response.json();
			if (data.success === 1 || data.success === '1') {
				console.log('received public key string has actual value');
				if (data.returnKey === keyStringPubToUse) {
					console.log('The server received the correct public key');
					return 'Success!';
				} else {
					console.error('server received incorrect public key');
					return 'failed: incorrect key';
				}
			} else {
				console.error('server received public key string with no value');
				return 'failed: no value';
			}
		} else {
			console.error('Failed to send public key');
			return 'failed: fetch failed';
		}
	},
	fixAndValidateJWK: function insertKeyOpsAndValidate(jwkToValidate, isPrivateKey = false) {
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
			if (isPrivateKey === true) {
				const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];
				const isValid = validProperties.every(prop => prop in jwk);
				if (!isValid) {
					throw new Error('Invalid JWK format');
				}
			} else {
					const validProperties = ['crv',"d", 'ext', 'key_ops', 'kty', 'x', 'y'];
					const isValid = validProperties.every(prop => prop in jwk);
					if (!isValid) {
						throw new Error('Invalid JWK format');
					}
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
