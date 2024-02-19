<script>
    let candidate;
    import Modal from './Modal.svelte';

    let showModal = false;
    function showCastVoteButton(candidate){
        return candidate > 0;
    }
</script>

<h2>Size</h2>
<div>
    <div>
        <div>
            <label>
                <input type="radio" bind:group={candidate} value={1} />
                Lars Løkke Rasmussen
            </label>
        </div>
        <div>
            <label>
                <input type="radio" bind:group={candidate} value={2} />
                Anders Fog Rasmussen
            </label>
        </div>
        <div>
            <label>
                <input type="radio" bind:group={candidate} value={3} />
                Poul Hartling
            </label>
        </div>

    </div>
    <div>
        <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
    </div>
    {#if (candidate)}
        <button on:click={() => (showModal = true)}> show modal </button>
    {/if}
    {#if !candidate}
        <p>Select a candidate!</p>
    {/if}

    <Modal bind:showModal>
        <h2 slot="header">
            modal
            <small><em>adjective</em> mod·al \ˈmō-dəl\</small>
        </h2>

        <ol class="definition-list">
            <li>of or relating to modality in logic</li>
            <li>
                containing provisions as to the mode of procedure or the manner of taking effect —used of a
                contract or legacy
            </li>
            <li>of or relating to a musical mode</li>
            <li>of or relating to structure as opposed to substance</li>
            <li>
                of, relating to, or constituting a grammatical form or category characteristically indicating
                predication
            </li>
            <li>of or relating to a statistical mode</li>
        </ol>

        <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
    </Modal>
</div>
