<script>
	import { onMount } from 'svelte';
	import RSACrypto from '../../utils/encryptionRSA.js';
	import {
		initECDH,
		// eslint-disable-next-line no-unused-vars
		getPublicKey,
		computeSharedSecret,
		requestServerPublicKeyECDH,
		encryptMessageECDH,
		// eslint-disable-next-line no-unused-vars
		performECDHAndEncryptBallot,
		// eslint-disable-next-line no-unused-vars
		performTestECDHAndEncryptBallot
	} from '../../utils/encryptionECDH.js';
	// eslint-disable-next-line no-unused-vars
	import RSABlindSig from '../../utils/blindSignatureRSA.js';

	let rsaPublicKey;
	let ecdhKeys;
	let sharedSecret;
	let encryptedMessage;

	onMount(async () => {
		rsaPublicKey = await RSACrypto.request();
		ecdhKeys = initECDH();
	});

	async function testECDH() {
		const serverPublicKeyBase64 = await requestServerPublicKeyECDH();
		sharedSecret = computeSharedSecret(ecdhKeys.client, serverPublicKeyBase64);
	}

	function testEncryption() {
		encryptedMessage = encryptMessageECDH('Test message', sharedSecret);
	}
</script>

<div>
	<h2>Request RSA Public Key</h2>
	<button on:click={RSACrypto.request}>Request RSA Public Key</button>
	<p>RSA Public Key: {rsaPublicKey}</p>
</div>

<div>
	<h2>Initiate ECDH</h2>
	<button on:click={initECDH}>Initiate ECDH</button>
	<p>ECDH Keys: {ecdhKeys}</p>
</div>

<div>
	<h2>Test ECDH</h2>
	<button on:click={testECDH}>Test ECDH</button>
	<p>Shared Secret: {sharedSecret}</p>
</div>

<div>
	<h2>Test Encryption</h2>
	<button on:click={testEncryption}>Test Encryption</button>
	<p>Encrypted Message: {encryptedMessage}</p>
</div>