import { DecryptTestRSA, exchangeKeys, requestMsgToVerify, sendSignedMessage } from '../../utils/apiServiceDev.js';
import cryptoUtils from '../../utils/cryptoUtils.js';

export const packageAndExchangeKeys = async () => {
	console.log('Accessed packageAndExchangeKeys');
	const keyRing = await cryptoUtils.packagePublicKeys();
	const response = await exchangeKeys(keyRing);
	let serversKeyRing
	console.log('Response: ', response);
	if (response.ok) {
		const data = await response.json();
		console.log('Data: ', data);
		if (typeof data.keyRing === 'string') {
			 serversKeyRing = JSON.parse(data.keyRing);
		} else {
			serversKeyRing = data.keyRing;
		}
		cryptoUtils.ECDH.saveServerKey(JSON.parse(serversKeyRing.ECDH)).then(r => {
			console.log('Server ECDH key saved: ', r);
		});
		await cryptoUtils.digSig.saveServerKey(JSON.parse(serversKeyRing.DigSig));
		await cryptoUtils.RSA.saveServerKey(JSON.parse(serversKeyRing.RSA));
		console.log('Keyring: ', serversKeyRing);
		console.log('Server keys saved');
		console.log(serversKeyRing.ECDH);
		return serversKeyRing;
	}
	else {
		console.error('Error in ExchangeKeys: ', response.status);
		return response.status;
	}
}

export const encryptRSA = async (plainTextMessage) => {
	const encryptedMessage = await cryptoUtils.RSA.encryptAndConvert(plainTextMessage);
	const response = await DecryptTestRSA(plainTextMessage, encryptedMessage);
	if (response.ok) {
		const data = await response.json();
		console.log('Data: ', data);
		return data.decryptedMessage;
	}
	else {
		console.error('Error in encryptRSA: ', response.status);
		return response.status;
	}
}
export const signAndSendMessage = async (messageToSign) => {
	const signature = await cryptoUtils.digSig.prepareSignatureToSend(messageToSign);
	const response = await sendSignedMessage(messageToSign, signature);
	if (response.ok) {
		const data = await response.json();
		if(data.result === true){
		return 'server successfully verified the signature'
		} else {
			return 'server failed to verify the signature'
		}
	}
}
export const recieveAndVerifySig = async () => {
	let data;
	const response = await requestMsgToVerify();
	if (response.ok) {
		data = await response.json();
		if(typeof data === 'string') {
		data = JSON.parse(data);
		}
	} const result = await cryptoUtils.digSig.verifyReceivedMessage(data.signature, data.message);
	if(result === true){
		return 'successfully verified the servers signature'
	} else {
		return 'failed to verify the servers signature'
	}
}