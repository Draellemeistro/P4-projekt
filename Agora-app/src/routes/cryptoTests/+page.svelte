<script>
	import { onMount } from 'svelte';
	import { packageAndExchangeKeys } from './cryptoTests.js';
	import TestingECDH from './testingECDH/+page.svelte';
	import { Router, Route, Link } from 'svelte-routing';

	import cryptoUtils from '../../utils/cryptoUtils.js';
	let keyStatus = 'have not checked yet';
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

	onMount(async () => {
		await cryptoUtils.genBothKeys();
	});
</script>
<Router>
	<nav>
		<Link to="/cryptoTests/testingECDH">Testing ECDH</Link>
	</nav>

	<Route path="/cryptoTests/testingECDH" component={TestingECDH} />
</Router>
<button on:click={packageAndExchangeKeys}>exchange keys</button>
<button on:click={cryptoUtils.genBothKeys()}>generate new keys</button>
<button on:click={checkKeyStatus}>Check key status</button>
<p>keyStatus message: {keyStatus}</p>

<input type="button" onclick="location.href='/cryptoTests/testingECDH';" value="go to ecdh" /><input type="button" onclick="location.href='/cryptoTests/testingRSA';" value="Go to rsa" />
<input type="button" onclick="location.href='/cryptoTests/testingDigSig';" value="Go to digSig" /><input type="button" onclick="location.href='/cryptoTests/dummyVote';" value="Go to dummyvote" />