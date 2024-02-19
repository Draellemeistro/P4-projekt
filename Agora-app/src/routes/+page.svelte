<script>
    import Box from './Box.svelte';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Box>
    <input type="button" onclick="location.href='/login';" value="go to login" />
    <input type="button" onclick="location.href='/color';" value="Go to color" />
    <input type="button" onclick="location.href='/vote';" value="Go to voting page" />
</Box>

<style>

</style>