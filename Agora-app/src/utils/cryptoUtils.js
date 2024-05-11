import RSA from './cryptoProtocols/encryptionRSA.js';
import ECDH from './cryptoProtocols/encryptionECDH.js';

export const cryptoUtils = {


	RSA: RSA,
	ECDH: ECDH, // EXAMPLE cryptoUtils.ECDH.initECDH()


	// Encrypts a ballot using RSA and ECDH
  encryptBallot: async function(ballot) {
		let encryptedBallot;
		let outGoingMessage;
		let ivValue;
		if (typeof ballot !== 'string') {
			ballot = JSON.stringify(ballot);
		}
		encryptedBallot = await this.RSA.encryptAndConvert(ballot);
		let innerMessage = await this.prepareSubLayer(encryptedBallot, {testString: 'testString', testNumber: 12345});

		let itemsForECDHDecrypt = await this.ECDH.ECDHPart(innerMessage);
		// include timestamp or unique voter ID in the vote??? Against replay attacks.
		outGoingMessage = itemsForECDHDecrypt.encryptedMessage;
		ivValue = itemsForECDHDecrypt.ivValue;
		let clientKeyPubString = await this.ECDH.exportKeyToString();

		return this.prepareBallotForServer(outGoingMessage, clientKeyPubString, ivValue);
	},

	prepareSubLayer: async function(midWayEncrypted, otherInformation) { //add hashOfMidWayEncrypted??
		if( otherInformation ===  undefined){
			return JSON.stringify({encryptedSubLayer: midWayEncrypted});
		} else {
			return JSON.stringify({
				encryptedSubLayer: midWayEncrypted, //string (RSA) / object (ECDH)
				otherInformation: otherInformation, //object, strings whatever
			});}
	},

	prepareBallotForServer: function(OutgoingEncrypted, clientKeyPub, ivValue) {
		return JSON.stringify({
			encryptedUpperLayer: OutgoingEncrypted, //string (RSA) / object (ECDH)
			clientKeyPub: clientKeyPub, //string
			ivValue: ivValue, //object
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