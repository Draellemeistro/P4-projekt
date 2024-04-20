<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import TwoFAForm from "./TwoFAForm.svelte";
    import Modal from '../vote/Modal.svelte';

    let email = ""
    let errors = {};



    let showModal = true;
    let isSubmitted = false;


    const submit = (user_email) => {
        email = user_email;
        console.log('1 this gets to run');
        showModal = true
        isSubmitted = true;  // Set isSubmitted to true when the form is submitted
    };

    onMount(() => {
        // Additional initialization logic can be added here
    });

</script>

<style>
    @import './loginFormStyles.css';
</style>

<section>
    <div class="login-form">
        {#if !isSubmitted}
            <LoginForm {submit} bind:showModal />
        {:else}
            <TwoFAForm {email} />
        {/if}
    </div>
</section>


