<script>
	import { onMount } from 'svelte';
	import { generateAndExchangeKeys } from './cryptoTests.js';
	import { Link } from "svelte-routing";


	onMount(async () => {
		await generateAndExchangeKeys();
	});

</script>

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