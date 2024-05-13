<script>
	import { onMount } from 'svelte';
	import { packageAndExchangeKeys } from '../cryptoTests.js';

	import cryptoUtils from '../../../utils/cryptoUtils.js';

	let keyStatus = 'have not checked yet';

	async function checkKeyStatus() {
		if (cryptoUtils.ECDH.pubKey) {
			if (cryptoUtils.ECDH.pubKey instanceof CryptoKey) {
				console.log('Public key:', cryptoUtils.ECDH.pubKey);
				keyStatus = 'Public key exists';
			}
		} else {
			console.log('No public key');
			keyStatus = 'No public key';
		}
	}


	onMount(async () => {
		//await cryptoUtils.genBothKeys();
	});
	</script>

<button on:click={packageAndExchangeKeys}>exchange keys</button>
<button on:click={cryptoUtils.genBothKeys()}>generate new keys</button>
<button on:click={checkKeyStatus}>Check key status</button>
<p>keyStatus message: {keyStatus}</p>
