<script>
	import { onMount } from 'svelte';
	import RSACrypto from '../../../utils/encryptionRSA.js';
	import { askForDecryptToCheck } from '../../../utils/apiService.js';
	import { initECDH } from '../../../utils/encryptionECDH.js';

	let rsaPublicKey;
	let encryptedMessage;
	let decryptedMessage;
	let testMessage;
	askForDecryptToCheck();

	onMount(async () => {
		// Request the RSA public key
		rsaPublicKey = await RSACrypto.request();

		// Create a test message
		testMessage = "This is a test message";

		// Encrypt the test message with the public key
		encryptedMessage = RSACrypto.encrypt(testMessage, rsaPublicKey);

		// Decrypt the encrypted message with the private key
		// Note: You need to have the private key to decrypt the message
		decryptedMessage = await askForDecryptToCheck(testMessage, encryptedMessage);
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
	<button on:click={askForDecryptToCheck(testMessage, encryptedMessage)}>ask server to decrypt</button>
	<p>decrypted msg from server: {decryptedMessage}</p>
	<p>{decryptedMessage}</p>
</div>