<script>
	import { onMount } from 'svelte';
	import RSACrypto from '../../utils/encryptionRSA.js';
	import {
		initECDH,
	} from '../../utils/encryptionECDH.js';
	// eslint-disable-next-line no-unused-vars


	let rsaPublicKey;
	let ecdhKeys;
	// eslint-disable-next-line no-unused-vars
	let sharedSecret;
	// eslint-disable-next-line no-unused-vars
	let encryptedMessage;
	let WebCryptoResult;
	let stringified;
	let msg = 'Hello World';
	function consoleLog(rsaPublicKey) {
		console.log(rsaPublicKey);
		stringified = JSON.stringify(rsaPublicKey);
		console.log(stringified);
		return stringified;
	}
	function encryptHandler(msg, rsaPublicKey) {
		let encrypted = RSACrypto.encrypt(msg, rsaPublicKey)
		console.log(encrypted);
		return encrypted;
	}

	onMount(async () => {
		rsaPublicKey = await RSACrypto.request();
		ecdhKeys = await initECDH();
		WebCryptoResult = await RSACrypto.webCryptoTest();
		encryptedMessage = RSACrypto.encrypt('Hello World', rsaPublicKey);
		stringified = JSON.stringify(WebCryptoResult);
	});
</script>

<div>
	<h2>Request RSA Public Key</h2>
	<button on:click={RSACrypto.request}>Request RSA Public Key</button>
	<p>RSA Public Key: {rsaPublicKey}</p>
</div>
<div>
	<h2>Write RSA Public key to console </h2>
	<button on:click={consoleLog}>Request RSA Public Key</button>
	<p>stringy: {stringified}</p>
</div>
<div>
	<h2>Write RSA Public key to console </h2>
	<button on:click={encryptHandler(msg, rsaPublicKey)}>Request RSA Public Key</button>
	<p>stringy: {encryptedMessage}</p>
</div>
<div>
	<h2>test webCrypto</h2>
	<button on:click={RSACrypto.webCryptoTest}>test web crypto</button>
	<p>Encrypted Message: {encryptedMessage}</p>
</div>
<div>
	<h2>Initiate ECDH</h2>
	<button on:click={initECDH}>Initiate ECDH</button>
	<p>ECDH Keys: {ecdhKeys}</p>
</div>
