<style>
    @import './votespageStyles.css';
</style>


<script>
    import Modal from './Modal.svelte';

    let showModal = false;
    let selectedOptionModal = "";
    let publicKeyModal = "";
    let selectedOption;
    let rsaKey = "1234567890";
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
    function proceedHandler(selectedOption, rsaKey) {
        selectedOptionModal = selectedOption;
        publicKeyModal = rsaKey;
        showModal = true;

    }
</script>
<div class="main-container">
    {#each Object.entries(parties) as [party, candidates]}
        <div class="party-header">
            <label >
                {#if party !== "Outside of the parties"}
                    <input type="radio" bind:group={selectedOption} value={`Party: ${party}`} />
                {/if}
                {party}
            </label>
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
        <button on:click={() => proceedHandler(selectedOption, rsaKey)}>Proceed</button>
    {:else}
        <p>Select a candidate or a party!</p>
    {/if}
</div>

<Modal bind:showModal {selectedOptionModal} {publicKeyModal}>
    <h2 slot="header">
        Cast vote for {selectedOption}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>
