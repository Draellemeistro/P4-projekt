import { checkSharedSecretTest, messageDecryptTestECDH } from '../../../utils/apiServiceDev.js';
import ECDHCrypto from '../../../utils/encryptionECDH.js';
export async function verifyTestSharedSecret(sharedSecret, clientPubKey) {
	//TODO: remove/move this function
	let sharedSecretString = await ECDHCrypto.exportKeyString(sharedSecret);
	let clientPubKeyString = await ECDHCrypto.exportKeyString(clientPubKey);

	const response = await checkSharedSecretTest(sharedSecretString, clientPubKeyString);
	if (response.status !== 200) {
		console.error('Failed to send shared secret');
	} if (response.ok) {
		const data = await response.json();
		if (data.success === true || data.success === 'true') {
			return 'success!';
		} else if (data.success === false || data.success === 'false') {
			return 'failed';
		} else {
			return 'error';
		}
	}
}



export async function SendEncryptedMsgTest(plainTextMessage, encryptedMessage, clientPubKey, ivValue) {
	//TODO: remove/move this function
	let pubKeyString = await ECDHCrypto.exportKeyString(clientPubKey);
	console.log('clientPubKey type..:', typeof clientPubKey);
	console.log('clientPubKey..:',typeof clientPubKey);
	console.log('clientPubKeyString..:', typeof ivValue);
	console.log('ivval..:', typeof pubKeyString);
	let msgForServer = JSON.stringify({
		plainTextMessage: plainTextMessage,
		encryptedMessage: encryptedMessage,
		clientPublicKey: pubKeyString,
		IvValue: ivValue
	});
	const response = await messageDecryptTestECDH(msgForServer);
	if (response.ok) {
		const data = await response.json();
		if (JSON.stringify(plainTextMessage) === JSON.stringify(data.decryptedMessage)) {
			return ('Decryption successful! Received decryption: ' +  JSON.stringify(data.decryptedMessage));
		} else if (data.decryptedMessage === plainTextMessage) {
			return ('2 Decryption successful! Received decryption: ' + data.decryptedMessage);
		} else {
			return ('Decryption failed. Received: ' + data.decryptedMessage);
		}
	} else {
		console.error('Failed to fetch', response);
		return 'error: failed to fetch';
	}
}