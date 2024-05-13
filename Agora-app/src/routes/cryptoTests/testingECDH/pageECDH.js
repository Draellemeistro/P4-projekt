import { DecryptTestECDH } from '../../../utils/apiServiceDev.js';
import cryptoUtils from '../../../utils/cryptoUtils.js';
import { agreeSharedSecret } from '../../../utils/apiService.js';

export const sendECDHMessage = async (msgString) => {
	const neededInfo = await cryptoUtils.ECDH.ECDHPart(msgString);

	let response = await DecryptTestECDH(JSON.stringify(neededInfo));
	if (response.ok) {
		return response.json();
	}
	else {
		console.error('Error in sendECDHMessage: ', response.status);
		return response.status;
	}
}
export const agreeOnSharedSecret = async () => {
	const testMsg = 'This is a test message';
	const neededInfo = await cryptoUtils.ECDH.ECDHPart(testMsg);

	const response = await agreeSharedSecret(JSON.stringify(neededInfo), cryptoUtils.ECDH.exportKeyToString());
	if (response.ok) {
		return response.json();
	}
	else {
		console.error('Error in agreeOnSharedSecret: ', response.status);
		return response.status;
	}
}