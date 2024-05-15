<style>
    @import './votespageStyles.css';
</style>


<script>
    import { onMount } from 'svelte';
    import Modal from './Modal.svelte';
   // import { goto } from '$app/navigation';
    //import { checkAuthentication } from '../../utils/auth.js';
    import { requestCandidates, formatCandidates } from './votePage.js';

    let showModal = false;
    let selectedOptionModal = "";
    let selectedOption;

    // Candidates
    let candidates = [];
    let parties = {};

    let isLoading = true;


    onMount(async () => {
        //if (!checkAuthentication()) {
        //    goto('/login');
        //    return;
        //}
        // eslint-disable-next-line no-unused-vars
        const token = sessionStorage.getItem('token');
        console.log('token', token); // 'voteID
        isLoading = true;
        try {
            candidates = await requestCandidates(token);
        } catch (error) {
            console.error(error);
        }
        parties = formatCandidates(candidates);
        isLoading = false;
    });

    // Group candidates by party

    function proceedHandler(selectedOption) {
        selectedOptionModal = selectedOption;
        showModal = true;
    }
</script>
{#if isLoading}
    <p>Loading...</p>
{:else}
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
        {/if}
        <p>Select a candidate or a party!</p>
    </div>

    <Modal bind:showModal {selectedOptionModal}>
        <h2 slot="header">
            Cast vote for {selectedOption}
        </h2>

        <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
    </Modal>
{/if}
