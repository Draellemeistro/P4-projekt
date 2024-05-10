<script>
	import { onMount } from 'svelte';
	import RSACrypto from '../../../utils/encryptionRSA.js';
	import signCrypto from '../../../utils/cryptoDigSig.js';
	import { DecryptSignedRSA } from '../../../utils/apiServiceDev.js';
	// eslint-disable-next-line no-unused-vars

	let rsaPublicKey;
	let encryptedMessage;
	let decryptedMessage;
	let testMessage;
	let verifiedIdentity;

	onMount(async () => {
		// Request the RSA public key
		rsaPublicKey = await RSACrypto.request();
			await signCrypto.genKeys();
		//fetchKeyRSA
		// Create a test message
		testMessage = "This is a test message";

		// Encrypt the test message with the public key
		encryptedMessage = await RSACrypto.encrypt(testMessage, rsaPublicKey);

		// Decrypt the encrypted message with the private key
		// Note: You need to have the private key to decrypt the message
		decryptedMessage = await RSACrypto.askForDecryption(testMessage, encryptedMessage);

		let signedMessage = await signCrypto.prepareSignatureToSend(encryptedMessage);
		let signKey = await signCrypto.exportKey();
		verifiedIdentity = await DecryptSignedRSA(testMessage, encryptedMessage,  signedMessage, signKey);
	});
</script>

<div>
	<h2>RSA Public Key</h2>
	<p>{rsaPublicKey}</p>
</div>
<div>
	<h2>test Message</h2>
	<p>{testMessage}</p>
</div>

<div>
	<h2>Encrypted Message</h2>
	<p>{encryptedMessage}</p>
</div>

<div>
	<h2>Decrypted Message</h2>
	<p>{decryptedMessage}</p>
</div>
<div>
	<h2>Verified identity?</h2>
	<p>{verifiedIdentity}</p>
</div>