<script>
	import { onMount } from 'svelte';
	import { packageAndExchangeKeys } from './cryptoTests.js';
	import { Link } from "svelte-routing";
	//import cryptoUtils from '../../utils/cryptoUtils.js';


	onMount(async () => {
		//await cryptoUtils.genBothKeys();
	});

</script>
<button on:click={packageAndExchangeKeys}>Check decrypt</button>


<Link to="/testingRSA">
	<button>Go to RSA test</button>
</Link>

<Link to="/testingECDH">
	<button>Go to ECDH test</button>
</Link>

<Link to="/testingDigSig">
	<button>Go to DigSig test</button>
</Link>

<Link to="/dummyVote">
	<button>Go to dummyVote</button>
</Link>