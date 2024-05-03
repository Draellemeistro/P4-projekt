<script>
	import { onMount } from 'svelte';
	import ECDHCrypto from '../../../utils/encryptionECDH.js';

	let counter = 0;
	//1
	let clientKeyStringPub;
	let clientKeyStringPriv;
	//2
	let serverKeystringPub;
	//3
	let sendKeyCheck;
	//4
	let sharedSecret;
	//5
	let sharedSecretCheck;
	//6
	const plainText = 'Hello World';
	let encryptedMessage;
	let decryptedcheck = 'Server Decryption not Implemented';

	let ivValue;
	onMount(async () => {
		console.log(counter);
		const BothKeys = await ECDHCrypto.initECDH();
		clientKeyStringPub = BothKeys.keyStringPub
		clientKeyStringPriv = BothKeys.keyStringPriv;
		counter++;
		console.log('step ', counter, ' finished'); //1
		serverKeystringPub = await ECDHCrypto.requestServerECDH();
		counter++;
		console.log('step ', counter, ' finished'); //2
		sendKeyCheck = await ECDHCrypto.tempSendEDCHKey(clientKeyStringPub);
		counter++;
		console.log('step ', counter, ' finished'); //3
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyStringPriv, serverKeystringPub);
		counter++;
		console.log('step ', counter, ' finished'); //4
		sharedSecretCheck = await ECDHCrypto.verifySharedSecretTest(sharedSecret, clientKeyStringPub);
		counter++;
		console.log('step ', counter, ' finished'); //5
		const encryptionInfo = await ECDHCrypto.encryptECDH(plainText, sharedSecret);
		encryptedMessage = encryptionInfo.encryptedMessage;
		ivValue = encryptionInfo.ivValue;

		counter++;
		console.log('step ', counter, ' finished'); //6
		decryptedcheck = await ECDHCrypto.SendEncryptedMsgTest(plainText, encryptedMessage, clientKeyStringPub, ivValue);
		console.log('decryptedcheck', decryptedcheck);
		counter++;
		console.log('step ', counter, ' finished'); //7
		if(counter >= 7){
			console.log('OnMount should have finished successfully');
		}
	} );

</script>


<div>
	<h2>1: client ECDH Public Key</h2>
	<p>{clientKeyStringPub}</p>
	<h2>1: client ECDH Private Key</h2>
	<p>{clientKeyStringPriv}</p>
</div>

<div>
	<h2>2: server ECDH Public Key</h2>
	<p>server ECDH key: {serverKeystringPub}</p>
</div>

<div>
	<h2>3: send Key Check</h2>
	<p>{sendKeyCheck}</p>
</div>
<div>
	<h2>4: shared secret</h2>
	<p>{sharedSecret}</p>
</div>
<div>
	<h2>5: shared Secret Check</h2>
	<p>{sharedSecretCheck}</p>
</div>

<div>
	<h2>6: Unencrypted Message</h2>
	<p>{plainText}</p>
	<h2>6: Encrypted Message</h2>
	<p>{encryptedMessage}</p>
	<h2>6: IV Value</h2>
	<p>{ivValue}</p>
</div>

<div>
	<h2>7: Server decryption</h2>
	<p>{decryptedcheck}</p>
</div>