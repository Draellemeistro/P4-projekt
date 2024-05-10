<style>
    @import './loginFormStyles.css';
</style>

<script>
    import { createEventDispatcher } from 'svelte';
    //import Modal from './Modal.svelte';
    import { validateForm } from '../../utils/formValidation.js';

    let personId;
    let voteId;
    let isLoading = false;
    let isSuccess = false;
    let errors = {};

    const dispatch = createEventDispatcher();

    const handleSubmit = () => {
        errors = {};
        const formValues = { personId, voteId };
        errors = validateForm(formValues);
        if (Object.keys(errors).length === 0) {
            isLoading = true;
            dispatch('formSubmitted', { personId, voteId });
        }
    };
</script>

<form on:submit|preventDefault={handleSubmit}>
    {#if isSuccess}
        <div class="success">
            🔓
            <br />
            You've been successfully logged in.
        </div>
    {:else}
        <div class="error">
            Login failed.
        </div>
    {/if}
    <h1>👤</h1>

    <label>CPR
        <input name="personIdLabel" placeholder="1234561234" bind:value={personId} />
    </label>
    <label>Vote ID
        <input name="voteIdLabel" placeholder="123456789" bind:value={voteId} />
    </label>
    <button type="submit">
        {#if isLoading}Logging in...{:else}Log in 🔒{/if}
    </button>

    {#if Object.keys(errors).length > 0}
        <ul class="errors">
            {#each Object.keys(errors) as field}
                <li>{field}: {errors[field]}</li>
            {/each}
        </ul>
    {/if}
</form>