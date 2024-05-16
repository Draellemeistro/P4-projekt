import RSA from './cryptoProtocols/encryptionRSA.js';
import ECDH from './cryptoProtocols/encryptionECDH.js';
import digSig from './cryptoProtocols/digitalSignatures.js';

export const cryptoUtils = {


	RSA: RSA,
	ECDH: ECDH, // EXAMPLE cryptoUtils.ECDH.genKeys()
	digSig: digSig, //can quickly be implemented to provide a signature for the vote,
										// which serves as a proof of message integrity and authenticity

	hashString: async function(detail) {
		const salt = window.crypto.getRandomValues(new Uint8Array(16)); // Generate a new salt for voteId
		const encoder = new TextEncoder();
		const dataPersonId = encoder.encode(detail.personId);
		const dataVoteId = encoder.encode(detail.voteId + salt);
		const hashPersonId = await window.crypto.subtle.digest('SHA-256', dataPersonId);
		const hashVoteId = await window.crypto.subtle.digest('SHA-256', dataVoteId);
		return {
			personIdHash: this.arrayBufferToHex(hashPersonId),
			voteIdHash: this.arrayBufferToHex(hashVoteId),
			salt: this.arrayBufferToHex(salt)
		};
	},

	arrayBufferToHex: function(buffer) {
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString()).slice(-2)).join('');
	},

	// Encrypts a ballot using RSA and ECDH
  encryptBallot: async function(ballot) {
		if (typeof ballot !== 'string') {
			ballot = JSON.stringify(ballot);
		}
		const encryptedBallot = await this.RSA.encrypt(ballot);

		let voteId = sessionStorage.getItem('voteId')

		const innerMessage = await this.prepareSubLayer(encryptedBallot, voteId);

		const sharedSecret = await ECDH.deriveSecret();
		const doubleEncryptedBallot = await this.encrypt(innerMessage, sharedSecret);
		//Returns  object: {encryptedMessage:base64, ivValue:Uint8Array}

		return await this.prepareMessageWithSignature(JSON.stringify(doubleEncryptedBallot));
		// returns stringified object: {message: string, signature: base64}
	},

	prepareSubLayer: async function(RSAEncryptedBallot, voteId) { //add hashOfMidWayEncrypted??
		if( voteId ===  undefined){
			return JSON.stringify({innerLayer: RSAEncryptedBallot});
		} else {
			return JSON.stringify({
				innerLayer: RSAEncryptedBallot, //string (RSA)
				voteId: voteId, //object, strings whatever
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

}

export default cryptoUtils;