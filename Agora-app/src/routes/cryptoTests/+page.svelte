<script>
	import { onMount } from 'svelte';
//	import RSACrypto from '../../utils/encryptionRSA.js';
//	import ECDHCrypto from '../../utils/encryptionECDH.js';
//	import { combinedEncryptionTest } from '../../utils/apiServiceDev.js';
//	import { SendEncryptedMsgTest } from './testingECDH/pageECDH.js';
	import { RSAtoECDH, ECDHtoRSA } from './combinedEncryption.js';

//	let serverKeyPub;
//	let sharedSecret;
//	let clientKeyPub;
//	let clientKeyPriv; //TODO: remove this from the frontend
//	let ivValue;
//	let ivValueOut;
//
//
//	let counter = 0;

	// eslint-disable-next-line no-unused-vars
	let encMsgRSA = '';
	let encMsgECDH = '';
	let outMsgRSA = '';
	let outMsgECDH = '';
	let responseRSAECDH = '';
	let responseECDHRSA = '';
	const plainText = 'Hello World';
	let innerDecryptCheckRSA = '';
	let innerDecryptCheckECDH = '';

	onMount(async () => {
		await RSAtoECDH(plainText);
		await ECDHtoRSA(plainText);
	});
</script>


<h1>Combined Encryption Test</h1>
<h2>Plain Text: {plainText}</h2>
<h2>Encrypted Message RSA: {encMsgRSA}</h2>
<h2>Encrypted Message ECDH: {encMsgECDH}</h2>
<h2>Decrypted Message RSA: {outMsgRSA}</h2>
<h2>Decrypted Message ECDH: {outMsgECDH}</h2>
<h2>Response RSA to ECDH: {responseRSAECDH}</h2>
<h2>Response ECDH to RSA: {responseECDHRSA}</h2>
<h2>Inner Decrypt Check RSA: {innerDecryptCheckRSA}</h2>
<h2>Inner Decrypt Check ECDH: {innerDecryptCheckECDH}</h2>

