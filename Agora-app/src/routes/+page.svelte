<script>
    import Box from './Box.svelte';
</script>

<div class="centered-content">
    <h1 class="homepage-title">Welcome to Agora</h1>
    <p class="homepage-description">Digital stemmeseddel</p>

    <Box>
        <input type="button" onclick="location.href='/login';" value="go to login" />
        <input type="button" onclick="location.href='/color';" value="Go to color" />
        <input type="button" onclick="location.href='/vote';" value="Go to voting page" />
    </Box>
</div>

<style>
    .centered-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f0f0f0;
    }

    .homepage-title {
        color: #333;
        font-size: 2em;
    }

    .homepage-description {
        color: #666;
        font-size: 1.2em;
    }
</style>