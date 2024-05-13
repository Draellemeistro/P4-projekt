<script>
	import { onMount } from 'svelte';
	import { packageAndExchangeKeys } from './cryptoTests.js';
	import TestingECDH from './testingECDH/+page.svelte';
	import TestingRSA from './testingRSA/+page.svelte';
	import TestingDigSig from './testingDigSig/+page.svelte';
	import dummyVote from './testingDigSig/+page.svelte';
	import { Router, Route, navigate } from 'svelte-routing';

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

	function goToECDHPage() {
		navigate('/cryptoTests/testingECDH');
	}
	function goToRSAPage() {
		navigate('/cryptoTests/testingRSA');
	}
	function goToDigSigPage() {
		navigate('/cryptoTests/testingDigSig');
	}
	function goToDummyVotePage() {
		navigate('/cryptoTests/dummyVote');
	}

	onMount(async () => {
		await cryptoUtils.genBothKeys();
	});
</script>
<Router>

	<Route path="/cryptoTests/testingECDH" component={TestingECDH} />
	<Route path="/cryptoTests/testingRSA" component={TestingRSA} />
	<Route path="/cryptoTests/testingDigSig" component={TestingDigSig} />
	<Route path="/cryptoTests/dummyVote" component={dummyVote} />
</Router>

<button on:click={packageAndExchangeKeys}>exchange keys</button>
<button on:click={cryptoUtils.genBothKeys()}>generate new keys</button>
<button on:click={checkKeyStatus}>Check key status</button>
<p>keyStatus message: {keyStatus}</p>

<button on:click={goToECDHPage}>Go to ECDH</button>
<button on:click={goToRSAPage}>Go to RSA</button>
<button on:click={goToDigSigPage}>Go to Digital Signature</button>
<button on:click={goToDummyVotePage}>Go to Dummy Vote</button>
