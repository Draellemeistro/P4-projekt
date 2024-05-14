<script>
	import { onMount } from 'svelte';
	import { encryptRSA, packageAndExchangeKeys } from '../cryptoTests.js';
	import { navigate } from 'svelte-routing';

	import cryptoUtils from '../../../utils/cryptoUtils.js';
	let shitString;
	let keyStatus = 'have not checked yet';
	let keyStatusServer = 'have not checked yet';
	const hello = 'hello World';
	let rsaCheck = 'nope';
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
	function goToVotePage() {
		navigate('/vote');
	}

	async function doExchange() {
		shitString = await packageAndExchangeKeys();
		await checkKeyStatus();
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
		if (cryptoUtils.ECDH.serverKey instanceof CryptoKey
			&& cryptoUtils.digSig.serverKey instanceof CryptoKey
			&& cryptoUtils.RSA.serverKey instanceof CryptoKey){
			keyStatusServer = 'Server public keys properly loaded';
		} else {
			console.log('Server public keys not loaded properly');
			keyStatusServer = 'Server public keys not loaded.';
		}
	}

 async function quickRsaCheck(){
	 rsaCheck = await encryptRSA(hello);
 }

	onMount(async () => {
		await checkKeyStatus();
	});
	</script>
<div>
	<h1>Testing Crypto</h1>
	<p>Client keys should be generated from a previous page.</p>
	<p>Clients key status: {keyStatus}</p>

</div>
<button on:click={cryptoUtils.genBothKeys()}>generate new keys</button>
<button on:click={doExchange}>exchange keys</button>
<p>shitString: {shitString}</p>
<button on:click={checkKeyStatus}>Check key status</button>
<p>keyStatus message: {keyStatus}</p>
<p>Server keyStatus message: {keyStatusServer}</p>
<button on:click={quickRsaCheck}>Check RSA</button>
<p>rsaCheck: {rsaCheck}</p>
<div>
	<button on:click={goToECDHPage}>Go to ECDH</button>
	<button on:click={goToRSAPage}>Go to RSA</button>
	<button on:click={goToDigSigPage}>Go to Digital Signature</button>
	<button on:click={goToDummyVotePage}>Go to Dummy Vote</button>
</div>
<div>
	<button on:click={goToVotePage}>Go to Vote</button>
</div>