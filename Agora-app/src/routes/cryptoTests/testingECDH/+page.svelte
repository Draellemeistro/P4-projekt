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
		serverKeystringPub = await ECDHCrypto.requestServerECDH();
		console.log('serverKeyString as JWK: ' + JSON.parse(serverKeystringPub));
		console.log('2');
		const BothKeys = await ECDHCrypto.initECDH();
		clientKeyStringPub = ECDHCrypto.fixAndValidateJWK(BothKeys.keyStringPub);
		clientKeyStringPriv = ECDHCrypto.fixAndValidateJWK(BothKeys.keyStringPriv);
		console.log('3');
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyStringPub, serverKeystringPub);
		console.log('4');

		//if (clientKeyStringPub === BothKeys.keyStringPub) {
		//	console.log('client public key returned from initECDH is the same as the one stored in the object');
		//} else {
		//	console.log('client public key returned from initECDH is not the same as the one stored in the object');
		//} if (clientKeyStringPub === sessionStorage.getItem('clientPublicKeyECDH') || BothKeys.keyStringPub === sessionStorage.getItem('clientPublicKeyECDH')) {
		//	console.log('client public key in storage is the same as the one stored in the object or the one returned from initECDH');
		//} else {
		//	console.log('error: client public key in storage is NOT the same as the one stored in the object or the one returned from initECDH');
		//}

		console.log('5');
		await ECDHCrypto.tempSendEDCHKey(ECDHCrypto.decideClientECDHString(BothKeys.keyStringPub));
		console.log('6');
		const{c , d} = await ECDHCrypto.encryptECDH(plainText, sharedSecret);
		encryptedMessage = c;
		ivValue = d;
		console.log('7');
		sharedSecretCheck = ECDHCrypto.verifySharedSecretTest(sharedSecret);
		console.log('8: OnMount finished');
	} );

</script>


<div>
	<h2>server ECDH Public Key</h2>
	<p>server ECDH key: {serverKeystringPub}</p>
</div>

<div>
	<h2>client ECDH Public Key</h2>
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