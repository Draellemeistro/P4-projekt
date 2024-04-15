<style>
    @import './modalStyles.css';
</style>
<script>
    export let twoFactorCode;
    export let showModal;


    function handleClose() {
        showModal = false;
    }


</script>

<dialog {showModal}>

    <input
      bind:value={twoFactorCode}
    />

    <button on:click={handleClose}>
        Close
    </button>

</dialog>


