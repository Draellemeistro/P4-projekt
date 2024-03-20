<style>
    @import './votespageStyles.css';
</style>


<script>
    import Modal from './Modal.svelte';

    let showModal = false;

    let selectedOption;
    let candidates = [
        ["Lars Løkke Rasmussen", "DF"],
        ["Anders Fog Rasmussen", "DF"],
        ["Poul Hartling","DF"],
        ["Meg Griffin", "V"],
        ["Donald Duck", "SF"],
        ["Donald Shmuck", "N/A"]
    ];

    // Group candidates by party
    let parties = {};
    candidates.forEach(([name, party]) => {
        if (party === "N/A")
            party = "Outside of the parties"

        if (!parties[party])
            parties[party] = [];

        parties[party].push(name);
    });
</script>

{#each Object.entries(parties) as [party, candidates]}
    <div class="party-header">
        <h2>
            {#if party !== "Outside of the parties"}
                <input type="radio" bind:group={selectedOption} value={`Party: ${party}`} />
            {/if}
            {party}
        </h2>
    </div>

    {#each candidates as candidate}
        <div class="grid-item">
            <label>
                <input type="radio" bind:group={selectedOption} value={`Candidate: ${candidate} (${party})`} />
                {candidate}
            </label>
        </div>
    {/each}
{/each}

{#if selectedOption !== undefined}
    <button on:click={() => (showModal = true)}>Proceed</button>
{:else}
    <p>Select a candidate or a party!</p>
{/if}

<Modal bind:showModal>
    <h2 slot="header">
        Cast vote for {selectedOption}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>
