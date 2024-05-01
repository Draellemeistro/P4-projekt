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
	onMount(async () => {
		console.log('1');
		const{a , b} = await ECDHCrypto.initECDH();
		clientKeyStringPub = a;
		clientKeyStringPriv = b;
		if (await ECDHCrypto.tempSendEDCHKey(clientKeyStringPub))
			console.log('client key sent');
		else console.log('client key not sent');
		console.log('2');
		serverKeystringPub = await ECDHCrypto.requestServerECDH();
		console.log('3');
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyStringPriv, serverKeystringPub);
		console.log('4');
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
	<p>{serverKeystringPub}</p>
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