<script>
	import { onMount } from 'svelte';
	import * as ECDHCrypto from '../../../utils/encryptionECDH.js';
	import * as apiCalls from '../../../utils/apiService.js';

	let ECDHPublicKey;
	let encryptedMessage;
	let decryptedMessage;
	let clientECDHPKeyPair;
	let sharedSecret;
	onMount(async () => {
		console.log('1');
		const response = await apiCalls.askForServerECDHPublicKey();
		console.log('2');
		clientECDHPKeyPair = await ECDHCrypto.initECDH();
		console.log('3');
		sharedSecret = await ECDHCrypto.computeSharedSecret(response.data.publicKey, clientECDHPKeyPair);
		console.log('4');
		ECDHPublicKey = response.data.publicKey;
		console.log('5');
		encryptedMessage = ECDHCrypto.encryptMessageECDH('Hello World', sharedSecret);
		console.log('6');
		const responseCheck = ECDHCrypto.verifyTestSharedSecret(sharedSecret, ECDHCrypto.getPublicKey(clientECDHPKeyPair));
		if (responseCheck) {
			console.log('Shared Secret is correct');
		}
	} );

</script>


<div>
	<h2>ECDH Public Key</h2>
	<p>{ECDHPublicKey}</p>
</div>

<div>
	<h2>Encrypted Message</h2>
	<p>{encryptedMessage}</p>
</div>

<div>
	<h2>Decrypted Message</h2>
	<p>{decryptedMessage}</p>
</div>