<script>
    import { fetchBallots } from "../../utils/apiService.js";

    let ballots = [];

    async function printDecryptedBallots() {
        try {
            const response = await fetchBallots();
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
            }
            ballots = await response.json();
        } catch (error) {
            console.error('An error occurred while fetching the ballots:', error);
        }
    }
</script>

<button on:click={printDecryptedBallots}>Fetch Decrypted Ballots</button>

{#if ballots.length > 0}
    <ul>
        {#each ballots as ballot}
            <li>{ballot}</li>
        {/each}
    </ul>
{/if}