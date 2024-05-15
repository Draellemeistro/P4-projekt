<script>
	import { cryptoUtils } from '../../../utils/cryptoUtils.js';
	import { agreeOnSharedSecret, sendECDHMessage } from './pageECDH.js';
	import { navigate } from 'svelte-routing';
	const testMessage = 'Hello, this is a test message';
	let keyStatus = 'have not checked yet';
	let encryptResponseECDH;
	let sharedSecretResponse;
	let keyStatusServer = 'have not checked yet';
	async function checkEncryptionEcdh() {
		encryptResponseECDH = await sendECDHMessage(testMessage);
	}
	async function handleClickAgree() {
		sharedSecretResponse = await agreeOnSharedSecret();
	}
	function goToGeneralStuffPage() {
		navigate('/cryptoTests/geneneralStuff');
	}

	async function checkKeyStatus() {
		if (cryptoUtils.ECDH.pubKey && cryptoUtils.digSig.pubKey) {
			if (cryptoUtils.ECDH.pubKey instanceof CryptoKey && cryptoUtils.digSig.pubKey instanceof CryptoKey) {
				console.log('Public key:', cryptoUtils.ECDH.pubKey);
				keyStatus = 'Public key exists';
			}
		} else {
			console.log('No public key');
			keyStatus = 'No public key';
		}
		if (cryptoUtils.ECDH.serverKey instanceof CryptoKey && cryptoUtils.digSig.serverKey instanceof CryptoKey){
			keyStatusServer = 'Server public key exists';
		} else {
			console.log('No server public key');
			keyStatusServer = 'No server public key';
		}
	}

</script>

<button on:click={checkKeyStatus}>Check key status</button>
<p>keyStatus message: {keyStatus}</p>
<p>keyStatusServer message: {keyStatusServer}</p>

<button on:click={checkEncryptionEcdh}>Check decrypt</button>
<p>Response: {encryptResponseECDH}</p>

<button on:click={handleClickAgree}>Check shared secret</button>
<p>Response: {sharedSecretResponse}</p>
<div>
	<button on:click={goToGeneralStuffPage}>Go to General Stuff</button>
</div>