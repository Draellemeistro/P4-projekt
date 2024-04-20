<!-- TwoFAForm.svelte -->
<script>
	let code = "";
	let errors = {};
	export let email;

	const handleSubmit = () => {
		// Validate and handle the 2FA code
		console.log({ email, code });  // Log the email and code
		fetch('http://130.225.39.205:3000/verify-email-code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, code }),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Error verifying email code');
				}
				return response.json();
			})
			.then(data => {
				console.log(data.message);  // Log the server's response
			})
			.catch(err => {
				console.log('Error:', err.message);
			});
	};
</script>

<form on:submit|preventDefault={handleSubmit}>
	<label>
		2FA Code
		<input type="text" bind:value={code} />
	</label>
	<button type="submit">Submit</button>

	{#if errors.code}
		<div class="error">{errors.code}</div>
	{/if}
</form>