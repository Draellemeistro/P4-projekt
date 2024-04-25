const blindSignature = require('blind-signatures');
import { sendBlindedForSigning } from './apiService.js';

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

	blindMsgAndGetSig: function blindMsgAndGetSig(messageFromClient, pubRSAKey) {
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
		const signedBlindedMessage = sendBlindedForSigning(blinded);
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
/*
prepare: function prepareMessage(message) {
		let inputMessage;
		let messagePrefix =  cryptoUtils.random(32);
		let byteMessage = cryptoUtils.stringToArrayBuffer(message);
		inputMessage = cryptoUtils.concatenate(messagePrefix, byteMessage);
		return inputMessage;
	},
	getVariablesFromServerPubKey: function getVariablesFromServerPubKey(publicKey) {
		// TODO finalize signature
		return publicKey
	},
	blind: function blindMessage(publicKey, message) {
		let modulusLen = publicKey.n.byteLength();
		let messageHash = cryptoUtils.hash(message);
		let maskGenFunc = cryptoUtils.getMaskGenFunc();
		let saltLength = 32;
		let encodedMessage = cryptoUtils.encode(messageHash, modulusLen - saltLength - 2);
		crypto.
	},

	blindWithBlindSignatureLib: function blindMessageWithLib(message, publicKey) {
		return blindSignature.blind({
			message: message,
			publicKey: publicKey,
		});
	},

	requestBlindSignature: async function requestBlindSignature(blindedMessage) {
		// const blindSig = await axios.post('http://
		// TODO make post request to server to get blind signature
		// return blindSign;
	},

	finalize: function finalizeSignature(publicKey, inputMessage, blindSignature, inverseOfBlind) {
	// TODO finalize signature
		return blindSignature.unblind({
			blindSignature: blindSignature,
			publicKey: publicKey,
			blindedMessage: inverseOfBlind,
		});
	},
	blindSignature: function blindSignature(message) {
		// https://cfrg.github.io/draft-irtf-cfrg-blind-signatures/draft-irtf-cfrg-rsa-blind-signatures.html
		const inputMessage = this.prepare(message);
		const publicKey = this.request();
		const blindedMessage = this.blind(message, publicKey);
		const blindSignature = this.requestBlindSignature(blindedMessage);
		return this.finalize(publicKey, inputMessage, blindSignature, inverseOfBlind);
	},
 */