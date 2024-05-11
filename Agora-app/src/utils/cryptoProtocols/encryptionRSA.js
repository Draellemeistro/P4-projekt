const RSA = {
	serverKey: null,
	serverKeyString: null,
	// Request the RSA public key from the server, make key object of it and
	// returns a CryptoKey object and stores a string copy of it in sessionStorage

	saveServerKey: async function saveServerKey(keyString) {
		this.serverKeyString = keyString;
		this.serverKey = await this.keyImportTemplateRSA(keyString);
	},

	// Avoids errors from fat-fingering by using a template for the key import
	keyImportTemplateRSA: async function keyImportTemplateRSA(keyString) {
		if (typeof keyString === 'string') keyString = JSON.parse(keyString);

		return  window.crypto.subtle.importKey(
			'jwk',
			keyString,
			{
				name: 'RSA-OAEP',
				hash: {name: 'SHA-256'}
			},
			true,
			['encrypt']
		);
	},
	encrypt: async function encryptWithPublicKey(message) {
		const encoder = new TextEncoder(); // Used to encode the message to an ArrayBuffer for encryption
		const encryptionData = encoder.encode(message);
		// Convert encryptedMessage to base64 and return it as a string
		return await window.crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP'
			},
			this.serverKey,
			encryptionData
		);
	},
	encryptAndConvert: async function encryptAndPrepare(message) {
		const encryptedMessage = await this.encrypt(message);
		return this.convertToBase64(encryptedMessage);
	},
 convertToBase64: function convertToBase64(encryptedMessage) {
	 const encryptedMessageArray = new Uint8Array(encryptedMessage);
	 const encryptedMessageString = Array.from(encryptedMessageArray).map(b => String.fromCharCode(b)).join('');
	 return btoa(encryptedMessageString);
 }

};
export default RSA;