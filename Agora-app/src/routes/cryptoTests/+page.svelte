<script>
	import { onMount } from 'svelte';
	import TestingECDH from './testingECDH/+page.svelte';
	import TestingRSA from './testingRSA/+page.svelte';
	import TestingDigSig from './testingDigSig/+page.svelte';
	import dummyVote from './testingDigSig/+page.svelte';
	import generalStuff from './generalStuff/+page.svelte';
	import { Router, Route, navigate } from 'svelte-routing';

	import cryptoUtils from '../../utils/cryptoUtils.js';


	function goToGeneralStuffPage() {
		navigate('/cryptoTests/geneneralStuff');
	}

	onMount(async () => {
		await cryptoUtils.genBothKeys();
		goToGeneralStuffPage();
	});
</script>
<div>
</div>
<Router>
	<Route path="/cryptoTests/testingECDH" component={TestingECDH} />
	<Route path="/cryptoTests/testingRSA" component={TestingRSA} />
	<Route path="/cryptoTests/testingDigSig" component={TestingDigSig} />
	<Route path="/cryptoTests/dummyVote" component={dummyVote} />
	<Route path="/cryptoTests/geneneralStuff" component={generalStuff} />
</Router>



