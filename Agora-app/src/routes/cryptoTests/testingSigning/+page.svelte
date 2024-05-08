<script>
	import { onMount } from 'svelte';
	import signCrypto from '../../../utils/cryptoDigSig.js';
	import { verifySignature } from '../../../utils/apiService.js';

const message = 'Hello, World!';
let signedMessage;
	onMount(async () => {
		signCrypto.keyObject = await signCrypto.genKeys();
		await signCrypto.exchangeKeys();
		signedMessage = await signCrypto.sign(message);
		let verified = await verifySignature(signedMessage, message);
		if (verified) {
			console.log('Signature verified');
		} else {
			console.log('Signature not verified');
			let selfVerify = await signCrypto.verify(signCrypto.pubKey, signedMessage, message);
			if (selfVerify) {
				console.log('Self-verified');
			} else {
				console.log('Self-verification failed');
			}
		}
	});

</script>