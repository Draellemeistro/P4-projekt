<script>
	import { onMount } from 'svelte';
	import { encryptRSA, packageAndExchangeKeys, recieveAndVerifySig, signAndSendMessage } from '../cryptoTests.js';
	import { navigate } from 'svelte-routing';

	import cryptoUtils from '../../../utils/cryptoUtils.js';
	import { sendECDHMessage } from '../testingECDH/pageECDH.js';
	let packageResponse;
	let exchangeStatus = 'Have not exchanged keys yet';
	let keyStatus = 'have not checked yet';
	let keyStatusServer = 'have not checked yet';
	const hello = 'Success. This is a demonstration of RSA encryption.';
	let rsaCheck = 'nope';
	let encryptResponseECDH;
	const testMessageECDH = 'This is a test message for ECDH encryption.';
	let digSigAccepted = 'message not signed yet';
	let verifiedServersDigSig = 'Digital Signature not request yet.';
	const testMessageDigSig = 'This is a test message for Digital Signature verification.';
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
	async function checkEncryptionEcdh() {
		encryptResponseECDH = await sendECDHMessage(testMessageECDH);
	}
	async function askForSignature() {
		verifiedServersDigSig = await recieveAndVerifySig();
	}
	async function sendSignatureForVerification() {
		digSigAccepted = await signAndSendMessage(testMessageDigSig);
	}

	async function doExchange() {
		packageResponse = await packageAndExchangeKeys();
		if (packageResponse) {
			console.log('Package response:', packageResponse);
			exchangeStatus = 'Key-exchange performed';
		}
		await checkKeyStatus();
	}
	async function checkKeyStatus() {
		if (cryptoUtils.ECDH.pubKey && cryptoUtils.digSig.pubKey) {
			if (cryptoUtils.ECDH.pubKey instanceof CryptoKey
				&& cryptoUtils.digSig.pubKey instanceof CryptoKey) {
				console.log('Public key:', cryptoUtils.ECDH.pubKey);
				keyStatus = 'Public keys exist';
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
</div>
<div>
	<p>Client keys should be generated from a previous page.</p>
	<p>Clients {keyStatus}</p>
	<p>{exchangeStatus}</p>
	<button on:click={doExchange}>exchange keys</button>
	<button on:click={checkKeyStatus}>Check key status</button>
	<button on:click={cryptoUtils.genBothKeys()}>generate new keys</button>
</div>
<div>
	<p>keyStatus message: {keyStatus}</p>
	<p>{keyStatusServer}</p>
</div>

<div>
	<h3>RSA tests</h3>
	<p>String that gets decrypted: {hello}</p>
	<p>Decrypted message received from server: {rsaCheck}</p>
	<button on:click={quickRsaCheck}>Check RSA</button>
</div>

<div>
	<h3>ECDH tests</h3>
	<p>String that gets decrypted: {testMessageECDH}</p>
	<p>Decrypted message received from server: {encryptResponseECDH}</p>
	<button on:click={checkEncryptionEcdh}>Check ECDH</button>
</div>

<div>
	<h3>Digital Signature tests</h3>
	<button on:click={sendSignatureForVerification}>Sign message for server to verify</button>
	<p>{digSigAccepted}</p>
	<p>{verifiedServersDigSig}</p>
	<button on:click={askForSignature}>Ask server for signature, then verify it</button>

</div>

<div>
	<h3>Navigation</h3>
	<button on:click={goToECDHPage}>Go to ECDH</button>
	<button on:click={goToRSAPage}>Go to RSA</button>
	<button on:click={goToDigSigPage}>Go to Digital Signature</button>
	<button on:click={goToDummyVotePage}>Go to Dummy Vote(not implemented)</button>
</div>
<div>
	<button on:click={goToVotePage}>Go to Vote</button>
</div>