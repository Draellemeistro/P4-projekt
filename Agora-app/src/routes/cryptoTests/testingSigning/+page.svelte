<script>
	import { onMount } from 'svelte';
	import signCrypto from '../../../utils/cryptoDigSig.js';
	import { verifySignature } from '../../../utils/apiService.js';

let signedMessage;
let verifyResponse = '';
	onMount(async () => {
		const message = "Hello, world!";
		// eslint-disable-next-line no-unused-vars
		const keyPair = await signCrypto.genKeys();
		const signature = signCrypto.sign(message);
		const isValid = signCrypto.verify(signCrypto.pubKey, signature, message);
		console.log(isValid ? "Valid signature" : "Invalid signature");

		console.log(' now for the real test');
		await signCrypto.exchangeKeys();
		signedMessage = await signCrypto.sign(message);
		let verified = await verifySignature(signedMessage, message);
		if (verified) {
			console.log('Signature verified');
			verifyResponse = 'Signature verified';
		} else {
			console.log('Signature not verified');
			let selfVerify = await signCrypto.verify(signCrypto.pubKey, signedMessage, message);
			if (selfVerify) {
				console.log('Self-verified');
				verifyResponse = 'Self-verified';
			} else {
				console.log('Self-verification failed');
				verifyResponse = 'Self-verification failed';
			}
		}
	});

</script>
<div>
	<h2>verify response</h2>
	<p>{verifyResponse}</p>
</div>