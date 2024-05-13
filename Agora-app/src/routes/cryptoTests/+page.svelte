<script>
	import { onMount } from 'svelte';
	import TestingECDH from './testingECDH/+page.svelte';
	import TestingRSA from './testingRSA/+page.svelte';
	import TestingDigSig from './testingDigSig/+page.svelte';
	import dummyVote from './testingDigSig/+page.svelte';
	import { Router, Route } from 'svelte-routing';

	import cryptoUtils from '../../utils/cryptoUtils.js';



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

