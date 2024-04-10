<h1>Welcome to login page</h1>
<script>
    import { onMount, setContext } from "svelte";

    import {
        key as userContextKey,
        initialValue as userContextInitialValue
    } from "./userContext";

    import LoginForm from "./LoginForm.svelte";
    import { goto } from '$app/navigation';
    import Modal from './Modal.svelte';

    let showModal = false;

    onMount(() => {
        setContext(userContextKey, userContextInitialValue);
    });

    const submit = ({ email, password }) =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                setContext(userContextKey, {
                    /*name: "Foo",
                    lastName: "Bar",
                    email: "foo@bar.com"*/
                });
                resolve();
            }, 1000);
            //goto('/vote');
            showModal = true

        });
</script>

<style>
    section {
        height: 100vh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #fff;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 300px;
        padding: 20px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    }



    .logo {
        margin-bottom: 20px;
    }
</style>

<section>
    <div class="login-form">
        <img class="logo" src="/path/to/your/logo.png" alt="Logo" />
        <LoginForm {submit} />
    </div>
</section>

<Modal bind:showModal>
    <!--<h2 slot="header" align="center">
        2 FACTOR AUTH
    </h2>-->


<!--
    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
-->
</Modal>
