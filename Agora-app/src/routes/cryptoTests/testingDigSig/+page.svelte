<script>
	import { cryptoUtils } from '../../../utils/cryptoUtils.js';
	import { navigate } from 'svelte-routing';
	import { onMount } from 'svelte';
	let keyStatus = 'No public key';
	let keyStatusServer = 'No server public key';
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
	onMount(async () => {
		await checkKeyStatus();
	});


</script>


<div>
	<button on:click={checkKeyStatus}>Check key status</button>
	<p>keyStatus message: {keyStatus}</p>
	<p>keyStatusServer message: {keyStatusServer}</p>
</div>

<div>
	<button on:click={goToGeneralStuffPage}>Go to General Stuff</button>
</div>