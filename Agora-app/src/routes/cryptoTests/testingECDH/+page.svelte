<script>
	import { cryptoUtils } from '../../../utils/cryptoUtils.js';
	import { agreeOnSharedSecret, sendECDHMessage } from './pageECDH.js';
	import { navigate } from 'svelte-routing';
	const testMessage = 'Hello, this is a test message';
	let keyStatus = 'have not checked yet';
	let encryptResponse;
	let sharedSecretResponse;
	async function handleClickSend() {
		encryptResponse = await sendECDHMessage(testMessage);
	}
	async function handleClickAgree() {
		sharedSecretResponse = await agreeOnSharedSecret();
	}
	function goToGeneralStuffPage() {
		navigate('/cryptoTests/geneneralStuff');
	}

	async function checkKeyStatus() {
		if (cryptoUtils.ECDH.pubKey) {
			if(cryptoUtils.ECDH.pubKey instanceof CryptoKey){
				console.log('Public key:', cryptoUtils.ECDH.pubKey);
				keyStatus = 'Public key exists';
			}
		} else {
			console.log('No public key');
			keyStatus = 'No public key';
		}
	}

</script>

<button on:click={checkKeyStatus}>Check key status</button>
<p>keyStatus message: {keyStatus}</p>

<button on:click={handleClickSend}>Check decrypt</button>
{#if encryptResponse}
	<p>Encrypted message: {encryptResponse}</p>
{/if}
<button on:click={handleClickAgree}>Check shared secret</button>
{#if sharedSecretResponse}
	<p>Shared secret: {sharedSecretResponse}</p>
{/if}

<div>
	<button on:click={goToGeneralStuffPage}>Go to General Stuff</button>
</div>