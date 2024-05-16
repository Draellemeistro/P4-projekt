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
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	},

	// Encrypts a ballot using RSA and ECDH
  encryptBallot: async function(ballot) {
		if (typeof ballot !== 'string') {
			ballot = JSON.stringify(ballot);
		}
		const encryptedBallot = await this.RSA.encryptAndConvert(ballot);

		let voteId = sessionStorage.getItem('voteId')

		const innerMessage = await this.prepareSubLayer(encryptedBallot, voteId);

		const doubleEncryptedBallot = await this.ECDH.ECDHPart(innerMessage);
		// include timestamp or unique voter ID in the vote??? Against replay attacks.
		return await this.prepareMessageWithSignature(doubleEncryptedBallot);
	},
	genBothKeys: async function() {
		await this.ECDH.genKeys();
		await this.digSig.genKeys();
	},

	prepareSubLayer: async function(RSAEncryptedBallot, voteId) { //add hashOfMidWayEncrypted??
		if( voteId ===  undefined){
			return JSON.stringify({innerLayer: RSAEncryptedBallot});
		} else {
			return JSON.stringify({
				innerLayer: RSAEncryptedBallot, //string (RSA) / object (ECDH)
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
		const signature = await this.digSig.prepareSignatureToSend(message);
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