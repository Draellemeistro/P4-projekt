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
		console.log('ivValue type of just after reading..:', ivValue);
		console.log('attempting to export key.')
		midwayCheck = await SendEncryptedMsgTest(message, encryptedMessage, clientKeyPub, ivValue);
		console.log('ECDHtoRSA midwayCheck..:', midwayCheck);
		return {encryptedMessage: encryptedMessage, clientPublicKey: clientKeyPub, ivValue: encryptionInfo.ivValue};
	},

	prepareECDHBallot: async function prepareECDHBallot(encryptedMessage, clientPubKey, ivValue) {
		return JSON.stringify({
			encryptedMessage: encryptedMessage, //object
			clientPublicKey: clientPubKey, //string
			IvValue: ivValue //object
		});
	},
	prepareFinalBallot: async function prepareExtraInfo(plaintext, midWayEncrypted, OutgoingEncrypted, clientKeyPub, ivValue) {
		console.log('prepareFinalBallot plaintext type..:', typeof plaintext);
		console.log('prepareFinalBallot midWayEncrypted type..:', typeof midWayEncrypted);
		console.log('prepareFinalBallot OutgoingEncrypted type..:', typeof OutgoingEncrypted);
		console.log('prepareFinalBallot clientKeyPub type..:', typeof clientKeyPub);
		console.log('prepareFinalBallot ivValue type..:', typeof ivValue);
		return JSON.stringify({
			plaintext: plaintext, //string
			midWayEncrypted: midWayEncrypted, //string (RSA) / object (ECDH)
			OutgoingEncrypted: OutgoingEncrypted, //string (RSA) / object (ECDH)
			clientKeyPub: clientKeyPub, //string
			ivValue: ivValue, //object
		});
	},

	RSAtoECDH: async function RSAtoECDH(message) {
		let clientKeyPub;
		let encryptedMessage;
		let outGoingMessage;
		let ivValue;

		encryptedMessage = await this.RSApart(message);
		let ECDHpart = await this.ECDHpart(encryptedMessage);
		console.log('ECDHtoRSA ECDHpart..:', ECDHpart);
		console.log('here we go\n\n\n')

		outGoingMessage = ECDHpart.encryptedMessage;
		clientKeyPub = ECDHpart.clientPublicKey;
		ivValue = ECDHpart.ivValue;
		console.log('exporting key..', clientKeyPub);
		let clientKeyPubString = await ECDHCrypto.exportKeyString(clientKeyPub);
		console.log('after exporting key..', clientKeyPubString);

		console.log('okidoki part lets goooooo');
		const msgForServer = await this.prepareFinalBallot(message, encryptedMessage, outGoingMessage, clientKeyPubString, ivValue);
		console.log('post prepareFinalBallot plaintext type..:', typeof msgForServer.plaintext);
		console.log('post prepareFinalBallot midWayEncrypted type..:', typeof msgForServer.midWayEncrypted);
		console.log('post prepareFinalBallot OutgoingEncrypted type..:', typeof msgForServer.OutgoingEncrypted);
		console.log('post prepareFinalBallot clientKeyPub type..:', typeof msgForServer.clientKeyPub);
		console.log('post prepareFinalBallot ivValue type..:', typeof msgForServer.ivValue);
		let okidoki = await RSAtoECDHTest(msgForServer);
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