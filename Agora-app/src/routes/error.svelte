<script context="module">
	export function load({ error }) {
		return {
			status: error.status,
			error: error.message,
		};
	}
</script>

<script>
	export let status;
	export let error;
</script>

<h1>{status}</h1>
<p>{error}</p>
<p>Sorry, the page you are looking for could not be found.</p>