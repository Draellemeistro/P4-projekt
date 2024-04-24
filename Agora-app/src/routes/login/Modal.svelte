<style>
    @import './modalStyles.css';
</style>
<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let twoFactorCode;
    export let showModal;
    export let voteId;

    let dialog;
    $: if (dialog && showModal) dialog.showModal();
    function handleClose() {
        console.log('voteId', voteId);
        dialog.close();
        showModal = false;
        console.log('Dispatching close event');
        dispatch('close', { twoFactorCode});
    }
    function mfaHandler() {
        handleClose();
    }


</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <h2>Authenticate with email</h2>
        <hr />

        <!--<button autofocus on:click={() => dialog.close()}>Go back</button>-->
        <input type="text" bind:value={twoFactorCode} placeholder="Enter 2-factor code" />
        <button on:click={() => mfaHandler()}>Confirm</button>
    </div>
</dialog>