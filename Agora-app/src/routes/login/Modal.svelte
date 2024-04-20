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
        if (showModal && dialog) {
            dialog.showModal();
        }
    });

    onDestroy(() => {
        if (dialog) {
            dialog.close();
        }
    });

    $: if (showModal && dialog) {
        dialog.showModal();
    } else if (dialog) {
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