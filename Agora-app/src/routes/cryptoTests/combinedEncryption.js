import RSACrypto from '../../utils/encryptionRSA.js';
import ECDHCrypto from '../../utils/encryptionECDH.js';
// eslint-disable-next-line no-unused-vars
import { combinedEncryptionTest, ECDHtoRSATest, RSAtoECDHTest } from '../../utils/apiServiceDev.js';
import { SendEncryptedMsgTest } from './testingECDH/pageECDH.js';

const combo = {

	RSApart: async function RSApart(message) {
		let serverPubKeyRSA = await RSACrypto.request();
		let encryptedMessage = await RSACrypto.encrypt(message, serverPubKeyRSA);
		let midwayCheck = await RSACrypto.askForDecryption(message, encryptedMessage);
		console.log('RSApart encryptedMessage..:', encryptedMessage);
		console.log('encryptedMessage type..:', typeof encryptedMessage);
		console.log('RSApart midwayCheck..:', midwayCheck);
		if (typeof encryptedMessage !== 'string') {
			encryptedMessage = JSON.stringify(encryptedMessage);
		}
		return encryptedMessage;
	},

	ECDHpart: async function ECDHpart(message) {
		let clientKeyPub;
		let clientKeyPriv;
		let serverKeyPub
		let sharedSecret;
		let encryptedMessage;
		let ivValue;
		let midwayCheck;


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
		clientKeyPub = await ECDHCrypto.exportKeyString(BothKeys.pubKey);
		midwayCheck = await SendEncryptedMsgTest(message, encryptedMessage, clientKeyPub, ivValue);
		console.log('ECDHtoRSA midwayCheck..:', midwayCheck);
		if (typeof encryptedMessage !== 'string') {
			encryptedMessage = JSON.stringify(encryptedMessage);
		}
		return {encryptedMessage, ivValue, clientKeyPub};
	},

	RSAtoECDH: async function RSAtoECDH(message) {
		let clientKeyPub;
		let encryptedMessage;
		let outGoingMessage;
		let ivValue;






		encryptedMessage = await this.RSApart(message);
		let ECDHpart = await this.ECDHpart(encryptedMessage);
		ivValue = ECDHpart.ivValue;
		clientKeyPub = ECDHpart.clientKeyPub;
		outGoingMessage = ECDHpart.encryptedMessage;
		let okidoki = await RSAtoECDHTest(message, encryptedMessage, outGoingMessage, ivValue, clientKeyPub);
		console.log('RSAtoECDH okidoki..:', okidoki);
		return okidoki;
	},


	ECDHtoRSA: async function ECDHtoRSA(message) {
		let encryptedMessage = JSON.stringify(await this.ECDHpart(message));
		let serverPubKeyRSA = await RSACrypto.request();
		let outGoingMessage = await RSACrypto.encrypt(encryptedMessage, serverPubKeyRSA);
		let okidoki = await ECDHtoRSATest(message, encryptedMessage, outGoingMessage, null, null);
		console.log('ECDHtoRSA okidoki..:', okidoki);
		return okidoki;
	}
}
export default combo;