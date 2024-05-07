import RSACrypto from '../../utils/encryptionRSA.js';
import ECDHCrypto from '../../utils/encryptionECDH.js';
// eslint-disable-next-line no-unused-vars
import { combinedEncryptionTest, ECDHtoRSATest, RSAtoECDHTest } from '../../utils/apiServiceDev.js';
import { SendEncryptedMsgTest } from './testingECDH/pageECDH.js';


	async function RSAtoECDH(message) {
		let clientKeyPub;
		let clientKeyPriv;
		let serverKeyPub
		// eslint-disable-next-line no-unused-vars
		let serverPubKeyRSA = await RSACrypto.request();
		let sharedSecret;
		// eslint-disable-next-line no-unused-vars
		let encryptedMessage;
		let outGoingMessage;
		let ivValue;
		// eslint-disable-next-line no-unused-vars
		let midwayCheck;
		// eslint-disable-next-line no-unused-vars
		let decryptedMessage;

		// eslint-disable-next-line no-unused-vars


		// eslint-disable-next-line no-unused-vars


		encryptedMessage = await RSACrypto.encrypt(message, serverPubKeyRSA);
		midwayCheck = await RSACrypto.askForDecryption(message, encryptedMessage);
		console.log('RSAtoECDH encryptedMessage..:', encryptedMessage);
		console.log('encryptedMessage type..:', typeof encryptedMessage);
		console.log('RSAtoECDH midwayCheck..:', midwayCheck);
		const BothKeys = await ECDHCrypto.initECDH();
		clientKeyPub = BothKeys.pubKey;
		clientKeyPriv = BothKeys.privKey;
		serverKeyPub = await ECDHCrypto.requestServerECDH();
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyPriv, serverKeyPub);
		if (typeof encryptedMessage !== 'string') {
			encryptedMessage = JSON.stringify(encryptedMessage);
		}
		const encryptionInfo = await ECDHCrypto.encryptECDH(encryptedMessage, sharedSecret);
		outGoingMessage = encryptionInfo.encryptedMessage;
		ivValue = encryptionInfo.ivValue;
		// eslint-disable-next-line no-unused-vars
		let okidoki = await RSAtoECDHTest(message, encryptedMessage, outGoingMessage, clientKeyPub, ivValue);
		console.log('RSAtoECDH okidoki..:', okidoki);
	}


	async function ECDHtoRSA(message) {
		let clientKeyPub;
		let clientKeyPriv;
		let serverKeyPub
		// eslint-disable-next-line no-unused-vars
		let serverPubKeyRSA = await RSACrypto.request();
		let sharedSecret;
		let encryptedMessage;
		let ivValue;
		let midwayCheck;
		let outGoingMessage;
		// eslint-disable-next-line no-unused-vars
		let decryptedMessage;
		const BothKeys = await ECDHCrypto.initECDH();
		clientKeyPub = BothKeys.pubKey;
		clientKeyPriv = BothKeys.privKey;
		serverKeyPub = await ECDHCrypto.requestServerECDH();
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyPriv, serverKeyPub);
		const encryptionInfo = await ECDHCrypto.encryptECDH(message, sharedSecret);
		encryptedMessage = encryptionInfo.encryptedMessage;
		console.log('ECDHtoRSA encryptedMessage..:', encryptedMessage);
		console.log('encryptedMessage type..:', typeof encryptedMessage);
		ivValue = encryptionInfo.ivValue;
		midwayCheck = await SendEncryptedMsgTest(message, encryptedMessage, clientKeyPub, ivValue);
		console.log('ECDHtoRSA midwayCheck..:', midwayCheck);
		if(typeof encryptedMessage !== 'string'){
			encryptedMessage = JSON.stringify(encryptedMessage);
		}
		outGoingMessage = await RSACrypto.encrypt(encryptedMessage, serverPubKeyRSA);
		let okidoki = await ECDHtoRSATest(message, encryptedMessage, outGoingMessage, null, null);
		console.log('ECDHtoRSA okidoki..:', okidoki);
	}

module.exports = {ECDHtoRSA, RSAtoECDH};