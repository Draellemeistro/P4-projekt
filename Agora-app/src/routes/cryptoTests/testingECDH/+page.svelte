<script>
	import { onMount } from 'svelte';
	import { cryptoUtils } from '../../../utils/cryptoUtils.js';
	import { agreeOnSharedSecret, sendECDHMessage } from './pageECDH.js';
const testMessage = 'Hello, this is a test message';
let encryptResponse;
let sharedSecretResponse;
	async function handleClickSend() {
		encryptResponse = await sendECDHMessage(testMessage);
	}
	async function handleClickAgree() {
		sharedSecretResponse = await agreeOnSharedSecret();
	}
	onMount(async () => {
		if (cryptoUtils.ECDH.pubKey === null) {
			console.log('Key empty as of entering page');
			await cryptoUtils.ECDH.genKeys();

		}
	} );

</script>


<button on:click={handleClickSend}>Check decrypt</button>
{#if encryptResponse}
	<p>Encrypted message: {encryptResponse}</p>
{/if}
<button on:click={handleClickAgree}>Check shared secret</button>
{#if sharedSecretResponse}
	<p>Shared secret: {sharedSecretResponse}</p>
{/if}