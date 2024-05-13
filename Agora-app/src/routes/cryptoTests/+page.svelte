<script>
	import { onMount } from 'svelte';
	import { packageAndExchangeKeys } from './cryptoTests.js';
	import cryptoUtils from '../../utils/cryptoUtils.js';


	onMount(async () => {
		//await cryptoUtils.genBothKeys();
	});


</script>
<button on:click={packageAndExchangeKeys}>exchange keys</button>
<button on:click={cryptoUtils.genBothKeys()}>generate new keys</button>


<input type="button" onclick="location.href='/cryptoTests/testingECDH';" value="go to ecdh" /><input type="button" onclick="location.href='/cryptoTests/testingRSA';" value="Go to rsa" />
<input type="button" onclick="location.href='/cryptoTests/testingDigSig';" value="Go to voting page" /><input type="button" onclick="location.href='/cryptoTests/dummyVote';" value="Go to testing main page" />