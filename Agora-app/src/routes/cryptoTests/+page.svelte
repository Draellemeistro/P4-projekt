<script>
	import { onMount } from 'svelte';
	import RSACrypto from '../../utils/encryptionRSA.js';
	import ECDHCrypto from '../../utils/encryptionECDH.js';
	import { combinedEncryptionTest } from '../../utils/apiServiceDev.js';
	import { SendEncryptedMsgTest } from './testingECDH/pageECDH.js';

	let serverKeyPub;
	let sharedSecret;
	let clientKeyPub;
	let clientKeyPriv; //TODO: remove this from the frontend
	let ivValue;
	let ivValueOut;


	let counter = 0;

	// eslint-disable-next-line no-unused-vars
	let encMsgRSA = '';
	let encMsgECDH = '';
	let outMsgRSA = '';
	let outMsgECDH = '';
	let responseRSAECDH = '';
	let responseECDHRSA = '';
	const plainText = 'Hello World';
	let innerDecryptCheckRSA = '';
	let innerDecryptCheckECDH = '';

	onMount(async () => {
		const rsaPublicKey = await RSACrypto.request();
		serverKeyPub = await ECDHCrypto.requestServerECDH();
		const BothKeys = await ECDHCrypto.initECDH();
		clientKeyPub = BothKeys.pubKey;
		clientKeyPriv = BothKeys.privKey;
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyPriv, serverKeyPub);


		counter++;
		console.log('step ', counter, ' finished'); //1
		encMsgRSA = await RSACrypto.encrypt(plainText, rsaPublicKey);
		innerDecryptCheckRSA = await RSACrypto.askForDecryption(encMsgRSA);

		const encryptionInfo = await ECDHCrypto.encryptECDH(plainText, sharedSecret);
		encMsgECDH = encryptionInfo.encryptedMessage;
		ivValue = encryptionInfo.ivValue;
		innerDecryptCheckECDH = await SendEncryptedMsgTest(plainText, encMsgECDH, clientKeyPub, ivValue);


		counter++;
		console.log('step ', counter, ' finished'); //2


		outMsgRSA = await RSACrypto.encrypt(JSON.stringify({encryptedMessage: encMsgECDH, clientPubKey: clientKeyPub, ivValue: ivValue}));

		const encryptionInfoOut = await ECDHCrypto.encryptECDH(encMsgRSA, sharedSecret);
		outMsgECDH = encryptionInfoOut.encryptedMessage;
		ivValueOut = encryptionInfoOut.ivValue;

		responseRSAECDH = await combinedEncryptionTest(plainText, outMsgECDH, clientKeyPub, ivValueOut);
		responseECDHRSA = await combinedEncryptionTest(plainText, outMsgRSA, null, null);
	});
</script>


<div>
<h2>1: Plaintext to send</h2>
<p>{plainText}</p>
</div>

<div>
	<h2>2: encrypted RSA</h2>
	<p>RSA encrypted message to re-encrypt: {encMsgRSA}</p>
	<h2>2: encrypted ECDH</h2>
	<p>ECDH encrypted message to re-encrypt: {encMsgECDH}</p>
	<h3> decryption checks:</h3>
	<p>Inner layer decryption check RSA: {innerDecryptCheckRSA}</p>
	<p>Inner layer decryption check ECDH: {innerDecryptCheckECDH}</p>
</div>

<div>
	<h2>3: RSAtoECDH message for server</h2>
	<p>{outMsgECDH}</p>
</div>
<div>
	<h2>3: ECDHtoRSA message for server</h2>
	<p>{outMsgRSA}</p>
</div>
<div>
	<h2>4: RSAtoECDH response from server</h2>
	<p>{responseRSAECDH.response}</p>
	<h3>Decrypted outer layer message: </h3>
	<p>{responseRSAECDH.outer}</p>
	<h2>ECDHtoRSA response from server</h2>
	<p>{responseECDHRSA.response}</p>
	<h3>4: Decrypted outer layer message: </h3>
	<p>{responseECDHRSA.outer}</p>

</div>
