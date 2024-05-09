<script>
	import { onMount } from 'svelte';
	import signCrypto from '../../../utils/cryptoDigSig.js';

let verifyResponse = '';
	let isValid;
	let isValidTwo;
	let signed;

	onMount(async () => {

		const message = "Hello, world!";
		// eslint-disable-next-line no-unused-vars
		const { privKey, pubKey } = await signCrypto.genKeys()
		//await signCrypto.putGenKeys(pubKey, privKey); //This shouldn't be needed, but somehow it is.
		const signature = await signCrypto.sign(message);
		console.log('sim test # 1');
		console.log('signature', signature);
		console.log('signature type', typeof signature);
		let importedServerKey = await signCrypto.keyExchangeSim(pubKey);
		isValid = await signCrypto.verify(signature, message, importedServerKey);
		console.log('isValid', isValid)
		console.log(isValid ? "Valid signature" : "Invalid signature");
		console.log(' now for the sim test # 2');
	  const sigString = signCrypto.arrayBufferToBase64(signature);
		const sigStringToArrBuf = signCrypto.base64ToArrayBuffer(sigString);

		isValidTwo = await signCrypto.verify(sigStringToArrBuf, message, importedServerKey);
		console.log('isValidTwo', isValidTwo)
		console.log(isValidTwo ? "Valid signature" : "Invalid signature");
		console.log(' now for the real test');
		await signCrypto.exchangeKeys();
		let verified = await signCrypto.askForVerify(signature, message);
		 if (verified) {
		 	console.log('Signature verified');
		 	verifyResponse = 'Signature verified';
		 } else {
		 	console.log('Signature not verified');
		 	let selfVerify = await signCrypto.verify(signCrypto.pubKey, signature, message);
		 	if (selfVerify) {
		 		console.log('Self-verified');
		 		verifyResponse = 'Self-verified';
		 	} else {
		 		console.log('Self-verification failed');
		 		verifyResponse = 'Self-verification failed';
		 	}
		 }
		 signed = await signCrypto.askForSignature();
		 console.log('signed could be verified: ', signed);
	});

</script>
<div>
	<h2>offline self-sign verify</h2>
	<p>{isValid}</p>
</div>
<div>
	<h2>offline simulation of back-forth</h2>
	<p>{isValid}</p>
</div>
<div>
	<h2>verify response</h2>
	<p>{verifyResponse}</p>
</div>
<div>
	<h2>signed response</h2>
	<p>{signed}</p>
</div>