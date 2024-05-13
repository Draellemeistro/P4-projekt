import { exchangeKeys } from '../../utils/apiServiceDev.js';
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
