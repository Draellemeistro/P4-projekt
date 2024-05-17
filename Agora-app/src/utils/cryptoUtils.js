import RSA from './cryptoProtocols/encryptionRSA.js';
import ECDH from './cryptoProtocols/encryptionECDH.js';
import digSig from './cryptoProtocols/digitalSignatures.js';

export const cryptoUtils = {


	RSA: RSA,
	ECDH: ECDH, // EXAMPLE cryptoUtils.ECDH.genKeys()
	digSig: digSig, //can quickly be implemented to provide a signature for the vote,
										// which serves as a proof of message integrity and authenticity

	//TODO RENAME
	hashString: async function(detail) {
		const salt = window.crypto.getRandomValues(new Uint8Array(16)); // Generate a new salt for voteId
		const saltHex = Array.prototype.map.call(salt, x => ('00' + x.toString(16)).slice(-2)).join('');

		const encoder = new TextEncoder();
		const dataPersonId = encoder.encode(detail.personId);
		console.log(detail.voteId + saltHex)
		const dataVoteId = encoder.encode(detail.voteId + saltHex);
		const hashPersonId = await window.crypto.subtle.digest('SHA-256', dataPersonId);
		const hashVoteId = await window.crypto.subtle.digest('SHA-256', dataVoteId);		return {
			personIdHash: this.arrayBufferToHex(hashPersonId),
			voteIdHash: this.arrayBufferToHex(hashVoteId),
			salt: this.arrayBufferToHex(salt)
		};
	},

	arrayBufferToHex: function(buffer) {
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	},

	// Encrypts a ballot using RSA and ECDH
  encryptBallot: async function(ballot) {
		if (typeof ballot !== 'string') {
			ballot = JSON.stringify(ballot);
		}
		const encryptedBallot = await this.RSA.encrypt(ballot);

		let voteId = sessionStorage.getItem('voteId')
		let salt = sessionStorage.getItem('salt')
		const ID = sessionStorage.getItem('ID')

		const innerMessage = await this.prepareSubLayer(encryptedBallot, voteId, salt, ID);

		const sharedSecret = await this.ECDH.deriveSecret();
		const doubleEncryptedBallot = await this.ECDH.encrypt(innerMessage, sharedSecret);
		//Returns  object: {encryptedMessage:base64, ivValue:Uint8Array}

		return await this.prepareMessageWithSignature(JSON.stringify(doubleEncryptedBallot));
		// returns stringified object: {message: string, signature: base64}
	},
	genBothKeys: async function() {
		await this.ECDH.genKeys();
		await this.digSig.genKeys();
	},

	prepareSubLayer: async function(RSAEncryptedBallot, voteId, salt, ID) { //add hashOfMidWayEncrypted??
		if( voteId ===  undefined){
			return JSON.stringify({innerLayer: RSAEncryptedBallot});
		} else {
			return JSON.stringify({
				innerLayer: RSAEncryptedBallot, //string (RSA)
				voteId: voteId, //object, strings whatever
				salt: salt, //object, strings whatever
				ID: ID, //object, strings whatever
			});}
	},

	packagePublicKeys: async function() {
		return{
			ECDH: await this.ECDH.exportKeyToString(),
			DigSig: await this.digSig.exportKeyToString()
		};
	},

	prepareMessageWithSignature: async function(message = '') {
		const signature = await this.digSig.sign(message);
		return JSON.stringify({
			message: message,
			signature: signature
		});
	},


//	sendKeysToServer: async function(RSAPublicKeyJWK, ECDHPublicKeyJWK, serverPublicKey) {
//		const bothPublicKeys = { RSAPublicKey: RSAPublicKeyJWK, ECDHPublicKey: ECDHPublicKeyJWK };
//		const encryptedPublicKeys = await this.RSA.encrypt(JSON.stringify(bothPublicKeys), serverPublicKey);
//		return await fetch(`https://server.com/client-public-keys`, {
//			method: 'POST',
//			headers: {
//				'Content-Type': 'application/json',
//			},
//			body: encryptedPublicKeys,
//		});
//	},
}

export default cryptoUtils;