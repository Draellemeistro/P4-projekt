<style>
    @import './modalStyles.css';
</style>

<script>
    import { onMount, onDestroy } from 'svelte';
    export let twoFactorCode;
    export let showModal = false;

    let dialog;

    onMount(() => {
        dialog = document.querySelector('dialog');
        if (showModal) {
            dialog.showModal();
        }
    });

    onDestroy(() => {
        dialog.close();
    });

    $: if (showModal) {
        dialog.showModal();
    } else {
        dialog.close();
    }

    function handleClose() {
        showModal = false;
    }
</script>

<dialog>
    <input bind:value={twoFactorCode} />
    <button on:click={handleClose}>
        Close
    </button>
</dialog>