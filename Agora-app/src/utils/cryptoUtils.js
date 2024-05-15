import RSA from './cryptoProtocols/encryptionRSA.js';
import ECDH from './cryptoProtocols/encryptionECDH.js';
import digSig from './cryptoProtocols/digitalSignatures.js';

export const cryptoUtils = {


	RSA: RSA,
	ECDH: ECDH, // EXAMPLE cryptoUtils.ECDH.genKeys()
	digSig: digSig, //can quickly be implemented to provide a signature for the vote,
										// which serves as a proof of message integrity and authenticity


	// Encrypts a ballot using RSA and ECDH
  encryptBallot: async function(ballot) {
		if (typeof ballot !== 'string') {
			ballot = JSON.stringify(ballot);
		}
		const encryptedBallot = await this.RSA.encryptAndConvert(ballot);
		const innerMessage = await this.prepareSubLayer(encryptedBallot, {voterString: 'testString', voteID: 12345});

		const doubleEncryptedBallot = await this.ECDH.ECDHPart(innerMessage);
		// include timestamp or unique voter ID in the vote??? Against replay attacks.
		return await this.prepareMessageWithSignature(doubleEncryptedBallot);
	},
	genBothKeys: async function() {
		await this.ECDH.genKeys();
		await this.digSig.genKeys();
	},

	prepareSubLayer: async function(RSAEncryptedBallot, otherInformation) { //add hashOfMidWayEncrypted??
		if( otherInformation ===  undefined){
			return JSON.stringify({InnerLayer: RSAEncryptedBallot});
		} else {
			return JSON.stringify({
				InnerLayer: RSAEncryptedBallot, //string (RSA) / object (ECDH)
				otherInformation: otherInformation, //object, strings whatever
			});}
	},

	packagePublicKeys: async function() {
		return JSON.stringify({
			ECDH: await this.ECDH.exportKeyToString(),
			DigSig: await this.digSig.exportKeyToString()
		});
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