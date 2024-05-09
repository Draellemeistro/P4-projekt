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


	RSAtoECDH: async function RSAtoECDH(message) { // WORKS.
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
		let clientKeyPubString = await ECDHCrypto.exportKeyString(clientKeyPub);
		const msgForServer = await this.prepareFinalBallotExample(message, encryptedMessage, outGoingMessage, clientKeyPubString, ivValue);
		let okidoki = await RSAtoECDHTest(msgForServer);
		console.log('RSAtoECDH okidoki..:', okidoki);
		return okidoki;
	},


	ECDHtoRSA: async function ECDHtoRSA(message) {
		let ECDHpart = await this.ECDHpart(message);
		let ECDHmessage = ECDHpart.encryptedMessage;
		let clientKeyPub = ECDHpart.clientPublicKey;
		let ivValue = ECDHpart.ivValue;
		let clientKeyPubString = await ECDHCrypto.exportKeyString(clientKeyPub);
		let encryptedMessage = await this.prepareECDHBallot(ECDHmessage, clientKeyPubString, ivValue);
		let serverPubKeyRSA = await RSACrypto.request();
		let outGoingMessage = await RSACrypto.encrypt(encryptedMessage, serverPubKeyRSA);
		const msgForServer = await this.prepareFinalBallotExample(message, ECDHmessage, outGoingMessage,null, null);

		let okidoki = await ECDHtoRSATest(msgForServer);
		console.log('ECDHtoRSA okidoki..:', okidoki);
		return okidoki;
	},

	prepareSubLayer: async function prepareSubLayer(midWayEncrypted, otherInformation ) { //add hashOfMidWayEncrypted??
		return JSON.stringify({
			midWayEncrypted: midWayEncrypted, //string (RSA) / object (ECDH)
			otherInformation: otherInformation, //object, strings whatever
		});

	},

	prepareBallotForServer: async function prepareBallotForServer(OutgoingEncrypted, clientKeyPub, ivValue) {
		return JSON.stringify({
			encryptedSubLayer: OutgoingEncrypted, //string (RSA) / object (ECDH)
			clientKeyPub: clientKeyPub, //string
			ivValue: ivValue, //object
		});
	},
	prepareECDHBallot: async function prepareECDHBallot(encryptedMessage, clientPubKey, ivValue) {
		return JSON.stringify({
			encryptedMessage: encryptedMessage, //object
			clientKeyPub: clientPubKey, //string
			IvValue: ivValue //object
		});
	},
	prepareFinalBallotExample: async function prepareExtraInfo(plaintext, midWayEncrypted, OutgoingEncrypted, clientKeyPub, ivValue) {
		console.log('prepareFinalBallotExample plaintext type..:', typeof plaintext);
		console.log('prepareFinalBallotExample midWayEncrypted type..:', typeof midWayEncrypted);
		console.log('prepareFinalBallotExample OutgoingEncrypted type..:', typeof OutgoingEncrypted);
		console.log('prepareFinalBallotExample clientKeyPub type..:', typeof clientKeyPub);
		console.log('prepareFinalBallotExample ivValue type..:', typeof ivValue);
		return JSON.stringify({
			plaintext: plaintext, //string
			midWayEncrypted: midWayEncrypted, //string (RSA) / object (ECDH)
			OutgoingEncrypted: OutgoingEncrypted, //string (RSA) / object (ECDH)
			clientKeyPub: clientKeyPub, //string
			ivValue: ivValue, //object
		});
	},
	prepareSignedBallot: async function prepareFinalBallotExample(plaintext, midWayEncrypted, OutgoingEncrypted, clientKeyPub, ivValue, signature, signatureKey) {
		return JSON.stringify({
				plaiTextMessage: plaintext, //string
				midwayMessage: midWayEncrypted, //string
				message: OutgoingEncrypted, //string (RSA) / object (ECDH)
				clientKeyPub: clientKeyPub, //string
				ivValue: ivValue, //object
				signature: signature,
				signatureKey: signatureKey,
		});

	},
}
export default combo;