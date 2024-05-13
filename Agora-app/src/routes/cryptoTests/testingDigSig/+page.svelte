<script>
	import { cryptoUtils } from '../../../utils/cryptoUtils.js';
	import { navigate } from 'svelte-routing';
	import { onMount } from 'svelte';
	let keyStatus = 'No public key';
	function goToGeneralStuffPage() {
		navigate('/cryptoTests/geneneralStuff');
	}
	function checkKeyStatus() {
		if (cryptoUtils.digSig.pubKey) {
			if(cryptoUtils.digSig.pubKey instanceof CryptoKey){
				console.log('Public key:', cryptoUtils.digSig.pubKey);
				keyStatus = 'Public key exists';
			}
		} else {
			console.log('No public key');
			keyStatus = 'No public key';
		}
	}
	onMount(async () => {
		checkKeyStatus();
	});


</script>


<div>
	<button on:click={checkKeyStatus}>Check key status</button>
	<p>keyStatus message: {keyStatus}</p>
</div>

<div>
	<button on:click={goToGeneralStuffPage}>Go to General Stuff</button>
</div>