const blindSignature = require('blind-signatures');
import { sendBlindedForSigning } from './apiService.js';

// se evt den her:
// 	  https://www.youtube.com/watch?v=FHUggQZ8mSs
// //////////////////////////
const RSABlindSig = {
	createServerObject: function createServerObject(pubRSAKey) {
		return {
			key: pubRSAKey,
			blinded: null,
			unblinded: null,
			message: null,
		};
	},
	createClientObject: function createClientObject(messageFromClient) {
		return {
			message: messageFromClient,
			N: null,
			E: null,
			r: null,
			signed: null,
			unblinded: null,
		};
	},

	getNFromServer: function getNEFromServer(serverObject) {
		return serverObject.key.N.toString();
	},

	getEFromServer: function getEFromServer(serverObject) {
		return serverObject.key.E.toString();
	},

	verifySignature: function verifySignature(clientObject, serverObject) {
		const result = blindSignature.verify({
			unblinded: clientObject.unblinded,
			key: serverObject.key,
			message: serverObject.message,
		});
		if (result) {
			console.log('Alice: Signatures verify!');
			return result;
		} else {
			console.log('Alice: Invalid signature');
			return result;
		}
	},

	// Should be more or less quick and easy to implement.

	blindMsgAndGetSig: async function blindMsgAndGetSig(messageFromClient, pubRSAKey) {
		let unblindedVar;
		let messageVar = messageFromClient;
		const serverObject = this.createServerObject(pubRSAKey);
		const clientObject = this.createClientObject(messageFromClient);
		clientObject.N = this.getNFromServer(serverObject);
		clientObject.E = this.getEFromServer(serverObject);
		const blinded = blindSignature.blind({
			message: clientObject.message,
			N: clientObject.N,
			E: clientObject.E,
		});
		const signedBlindedMessage = await sendBlindedForSigning(blinded);
		unblindedVar = blindSignature.unblind({
			blinded: blinded,
			signed: signedBlindedMessage,
			N: clientObject.N,
		});
		clientObject.unblinded = unblindedVar;
		this.verifySignature(clientObject, serverObject);
		return { unblindedVar, messageVar };
		// can be used later to send to server, for them to verify and such
	},

};

export default RSABlindSig;
