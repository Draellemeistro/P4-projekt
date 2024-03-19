<h1>Welcome to login page</h1>
<script>
    import { onMount, setContext } from "svelte";

    import {
        key as userContextKey,
        initialValue as userContextInitialValue
    } from "./userContext";

    import LoginForm from "./LoginForm.svelte";
    import { goto } from '$app/navigation';

    onMount(() => {
        setContext(userContextKey, userContextInitialValue);
    });

    const submit = ({ email, password }) =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                setContext(userContextKey, {
                    name: "Foo",
                    lastName: "Bar",
                    email: "foo@bar.com"
                });
                resolve();
            }, 1000);
            goto('/vote');
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

    .login-form input {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .login-form button {
        width: 100%;
        padding: 10px;
        border: none;
        background: #007BFF;
        color: #fff;
        cursor: pointer;
    }

    .login-form button:hover {
        background: #0056b3;
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

<section>
    <LoginForm {submit} />
</section>