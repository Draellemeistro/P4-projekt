<script>
	import { cryptoUtils } from '../../../utils/cryptoUtils.js';
	import { navigate } from 'svelte-routing';
	import { onMount } from 'svelte';
	import { recieveAndVerifySig, signAndSendMessage } from '../cryptoTests.js';
	let keyStatus = 'No public key';
	let keyStatusServer = 'No server public key';
	const messsage = 'Hello, this is a test message';
	let digSigAccepted;
	let verifiedServersDigSig;
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
	async function askForSignature() {
		verifiedServersDigSig = await recieveAndVerifySig();
	}
	async function sendSignatureForVerification() {
		digSigAccepted = signAndSendMessage(messsage);
	}
	onMount(async () => {
		await checkKeyStatus();
	});


</script>


<div>
	<button on:click={checkKeyStatus}>Check key status</button>
	<p>keyStatus message: {keyStatus}</p>
	<p>keyStatusServer message: {keyStatusServer}</p>
	<button on:click={sendSignatureForVerification}>Check digSig</button>
	<p>servers response to our digital signature: {digSigAccepted}</p>
<button on:click={askForSignature}>Check digSig</button>
<p>verificiation of servers signature: {verifiedServersDigSig}</p>
</div>

<div>
	<button on:click={goToGeneralStuffPage}>Go to General Stuff</button>
</div>