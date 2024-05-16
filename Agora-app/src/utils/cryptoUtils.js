import RSA from './cryptoProtocols/encryptionRSA.js';
import ECDH from './cryptoProtocols/encryptionECDH.js';
import digSig from './cryptoProtocols/digitalSignatures.js';
import crypto from 'crypto';
export const cryptoUtils = {


	RSA: RSA,
	ECDH: ECDH, // EXAMPLE cryptoUtils.ECDH.genKeys()
	digSig: digSig, //can quickly be implemented to provide a signature for the vote,
										// which serves as a proof of message integrity and authenticity

	hashString: function(detail) {
		const salt = crypto.randomBytes(16).toString('hex'); // Generate a new salt for voteId
		const hashPersonId = crypto.createHash('sha256');
		const hashVoteId = crypto.createHash('sha256');
		hashPersonId.update(detail.personId);
		hashVoteId.update(detail.voteId + salt);
		return {
			personIdHash: hashPersonId.digest('hex'),
			voteIdHash: hashVoteId.digest('hex'),
			salt: salt
		};
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