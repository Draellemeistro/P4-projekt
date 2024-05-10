
const RSA = {
	serverKey: null,
	//TODO MAKE SURE SERVERKEYSTRING IS NOT NULL
	serverKeyString: null,
	// Request the RSA public key from the server, make key object of it and
	// returns a CryptoKey object and stores a string copy of it in sessionStorage
	saveServerKey: async function saveServerKey(keyString) {
		if(typeof keyString === 'string') {
			keyString = JSON.parse(keyString);
		}
		this.serverKeyString = keyString;
		this.serverKey = await this.keyImportTemplateRSA(keyString);
	},
	// Avoids errors from fat-fingering by using a template for the key import
	keyImportTemplateRSA: async function keyImportTemplateRSA(keyString) {
		return  window.crypto.subtle.importKey(
			'jwk',
			keyString,
			{
				name: 'RSA-OAEP',
				hash: 'SHA-256'
			},
			true,
			['encrypt']
		);
	},
	encrypt: async function encryptWithPublicKey(message) {
		const encoder = new TextEncoder(); // Used to encode the message to an ArrayBuffer for encryption
		const encryptionData = encoder.encode(message);
		const encryptedMessage = await window.crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP'
			},
			this.serverKey,
			encryptionData
		);
		// Convert encryptedMessage to base64 and return it as a string
		const encryptedMessageArray = new Uint8Array(encryptedMessage);
		const encryptedMessageString = Array.from(encryptedMessageArray).map(b => String.fromCharCode(b)).join('');
		return btoa(encryptedMessageString);
	},



};
export default RSA;