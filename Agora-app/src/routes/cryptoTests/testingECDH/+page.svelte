<script>
	import { onMount } from 'svelte';
	import ECDHCrypto from '../../../utils/encryptionECDH.js';

	let serverKeystringPub;
	const plainText = 'Hello World';
	let encryptedMessage;
	let decryptedMessage;
	// eslint-disable-next-line no-unused-vars
	let clientKeyStringPub;
	let clientKeyStringPriv;
	let sharedSecret;
	// eslint-disable-next-line no-unused-vars
	let sharedSecretCheck;
	// eslint-disable-next-line no-unused-vars
	let ivValue;
	// ECDHCrypto.fixAndValidateJWK();
	onMount(async () => {
		console.log('1');

		const BothKeys = await ECDHCrypto.initECDH();
		console.log('2');
		await ECDHCrypto.tempSendEDCHKey(ECDHCrypto.decideClientECDHString(BothKeys.keyStringPub));
		console.log('3');
		serverKeystringPub = await ECDHCrypto.requestServerECDH();
		clientKeyStringPub = BothKeys.keyStringPub;
		clientKeyStringPriv = BothKeys.keyStringPriv;
		//if (clientKeyStringPub === BothKeys.keyStringPub) {
		//	console.log('client public key returned from initECDH is the same as the one stored in the object');
		//} else {
		//	console.log('client public key returned from initECDH is not the same as the one stored in the object');
		//} if (clientKeyStringPub === sessionStorage.getItem('clientPublicKeyECDH') || BothKeys.keyStringPub === sessionStorage.getItem('clientPublicKeyECDH')) {
		//	console.log('client public key in storage is the same as the one stored in the object or the one returned from initECDH');
		//} else {
		//	console.log('error: client public key in storage is NOT the same as the one stored in the object or the one returned from initECDH');
		//}
		console.log('4');
		sharedSecret = await ECDHCrypto.deriveSecret(BothKeys.keyStringPriv, serverKeystringPub);
		console.log('5');
		const{c , d} = await ECDHCrypto.encryptECDH(plainText, sharedSecret);
		encryptedMessage = c;
		ivValue = d;
		console.log('6');
		sharedSecretCheck = ECDHCrypto.verifySharedSecretTest(sharedSecret);
	} );

</script>


<div>
	<h2>server ECDH Public Key</h2>
	<button on:click={ECDHCrypto.requestServerECDH()}>Request server ECDH Key</button>
	<p>server ECDH key: {serverKeystringPub}</p>
</div>

<div>
	<h2>client ECDH Public Key</h2>
	<button on:click={ECDHCrypto.initECDH()}>Generate client ECDH Key</button>
	<button on:click={ECDHCrypto.tempSendEDCHKey(clientKeyStringPub)}>Send client ECDH Key</button>
	<p>{clientKeyStringPub}</p>
</div>

<div>
	<h2>client ECDH Private Key</h2>
	<p>{clientKeyStringPriv}</p>
</div>

<div>
	<h2>is client's shared secret identical to server's shared secret?</h2>
	<p>{sharedSecretCheck}</p>
</div>

<div>
	<h2>Encrypted Message</h2>
	<p>{encryptedMessage}</p>
</div>

<div>
	<h2>Decrypted Message</h2>
	<p>{decryptedMessage}</p>
</div>