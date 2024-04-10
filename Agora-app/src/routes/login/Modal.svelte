<style>
    @import './modalStyles.css';
</style>
<script>
    export let showModal; // boolean

    let dialog; // HTMLDialogElement
    let twoFactorCode = '';
    $: if (dialog && showModal) dialog.showModal();

    function confirmHandler() {
        //TODO: Bind with backend
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
        <button on:click={() => confirmHandler()}>Confirm</button>
    </div>
</dialog>

