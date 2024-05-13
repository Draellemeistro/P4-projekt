<script>
	import { onMount } from 'svelte';

	import {  navigate, } from 'svelte-routing';

	import cryptoUtils from '../../utils/cryptoUtils.js';


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
	function goToGeneralStuffPage() {
		navigate('/cryptoTests/geneneralStuff');
	}

	onMount(async () => {
		await cryptoUtils.genBothKeys();
	});
</script>



<button on:click={goToECDHPage}>Go to ECDH</button>
<button on:click={goToRSAPage}>Go to RSA</button>
<button on:click={goToDigSigPage}>Go to Digital Signature</button>
<button on:click={goToDummyVotePage}>Go to Dummy Vote</button>
<button on:click={goToGeneralStuffPage}>Go to General Stuff</button>
