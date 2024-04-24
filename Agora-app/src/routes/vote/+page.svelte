<style>
    @import './votespageStyles.css';
</style>


<script>
    import { onMount } from 'svelte';
    import Modal from './Modal.svelte';
    import { getCandidatesFromServer } from '../../utils/apiService.js';

    let showModal = false;
    let selectedOptionModal = "";
    let selectedOption;

    // Candidates
    let candidates = [];

    onMount(async () => {
        const response = await getCandidatesFromServer();
        if (response.ok) {
            const data = await response.json();
            candidates = data.map(item => [item.candidate, item.party]);
        } else {
            console.error('Failed to fetch candidates');
        }
    });

    // Group candidates by party
    let parties = {};
    $: {
        parties = {};
        candidates.forEach(([name, party]) => {
            if (party === "N/A")
                party = "Outside of the parties"

            if (!parties[party])
                parties[party] = [];

            parties[party].push(name);
        });
    }

    function proceedHandler(selectedOption) {
        selectedOptionModal = selectedOption;
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
        <button on:click={() => proceedHandler(selectedOption)}>Proceed</button>
    {:else}
    {/if}
    <p>Select a candidate or a party!</p>
</div>

<Modal bind:showModal {selectedOptionModal}>
    <h2 slot="header">
        Cast vote for {selectedOption}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>