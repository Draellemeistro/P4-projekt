<script>
	import { onMount } from 'svelte';
	import ECDHCrypto from '../../../utils/encryptionECDH.js';

	/*
	CryptoKey object provides some level of protection,
	it should be used as part of a larger security strategy that includes:
	 secure coding practices,
	 input validation,
	 output encoding,
	 and regular security audits.


	 !!!!!!!!!!DEN HER LIGE UNDER!!!!!!!!!
	 actual key data is not directly accessible when you're working with a CryptoKey object.
	 This means that even if an attacker is able to access the CryptoKey object,
	 they cannot extract the key data from it unless the extractable attribute is set to true. 

	 */

	let counter = 0;
	//1
	let clientKeyPub;
	let clientKeyPriv; //TODO: remove this from the frontend
	//2
	let serverKeyPub;
	//3
	let sendKeyCheck;
	//4
	let sharedSecret;
	//5
	let sharedSecretCheck;
	//6
	const plainText = 'Hello World';
	let encryptedMessage;
	let decryptedCheck = 'Server Decryption not Implemented';

	let ivValue;
	onMount(async () => {
		console.log(counter);
		const BothKeys = await ECDHCrypto.initECDH();
		clientKeyPub = BothKeys.pubKey;
		clientKeyPriv = BothKeys.privKey;
		const cryptoKeypairVersion = await ECDHCrypto.initECDH();
		console.log('type of cryptoKeypairVersion: ', typeof cryptoKeypairVersion);
		console.log('cryptoKeypairVersion: ', cryptoKeypairVersion);
		console.log('cryptoKeypairVersion.keyStringPub: ', clientKeyPub);
		console.log('cryptoKeypairVersion.keyStringPub: ', JSON.stringify(BothKeys.pubKey));
		counter++;
		console.log('step ', counter, ' finished'); //1
		serverKeyPub = await ECDHCrypto.requestServerECDH();
		counter++;
		console.log('step ', counter, ' finished'); //2
		sendKeyCheck = await ECDHCrypto.tempSendEDCHKey(clientKeyPub);
		counter++;
		console.log('step ', counter, ' finished'); //3
		sharedSecret = await ECDHCrypto.deriveSecret(clientKeyPriv, serverKeyPub);
		counter++;
		console.log('step ', counter, ' finished'); //4
		sharedSecretCheck = await ECDHCrypto.verifySharedSecretTest(sharedSecret, clientKeyPub);
		counter++;
		console.log('step ', counter, ' finished'); //5
		const encryptionInfo = await ECDHCrypto.encryptECDH(plainText, sharedSecret);
		encryptedMessage = encryptionInfo.encryptedMessage;
		ivValue = encryptionInfo.ivValue;

		counter++;
		console.log('step ', counter, ' finished'); //6
		decryptedCheck = await ECDHCrypto.SendEncryptedMsgTest(plainText, encryptedMessage, clientKeyPub, ivValue);
		counter++;
		console.log('step ', counter, ' finished'); //7
		if(counter >= 7){
			console.log('OnMount should have finished successfully');
		}
	} );

</script>


<div>
	<h2>1: client ECDH Public Key</h2>
	<p>{clientKeyPub}</p>
	<h2>1: client ECDH Private Key</h2>
	<p>{clientKeyPriv}</p>
</div>

<div>
	<h2>2: server ECDH Public Key</h2>
	<p>server ECDH key: {serverKeyPub}</p>
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
	<p>{decryptedCheck}</p>
</div>