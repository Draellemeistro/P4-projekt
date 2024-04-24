<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import Modal from './Modal.svelte';
    import { navigate } from 'svelte-routing';
    import { userContext } from './userContext.js';

    let personId;
    let twoFactorCode;
    let voteId;
    let errors = {};
    let showModal = false;

    const serverIP = '130.225.39.205';
    const serverPort = '80';

    userContext.subscribe(value => {
        personId = value.personId;
        voteId = value.voteId;
    });

    const handleFormSubmitted = ({ detail }) => {
        console.log('handleFormSubmitted called');
        const { personId, voteId } = detail;

        userContext.set({ personId, voteId });

        fetch(`http://${serverIP}:${serverPort}/get-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ personId, voteId }),
        })
          .then(response => {
              if (!response.ok) {
                  throw new Error(response.statusText);
              }
              return response.json();
          })
          .then(data => {
              showModal = true;
          })
          .catch(err => {
              errors.server = err.message;
          });
    };

    const handleModalClose = ({ detail }) => {
        const { twoFactorCode} = detail;

        console.log(`Sending OTP for verification. twoFactorCode: ${twoFactorCode}`)
        console.log('voteID', voteId)

        fetch(`http://${serverIP}:${serverPort}/verify-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ twoFactorCode, personId, voteId }),
        })
          .then(response => {
              if (!response.ok) {
                  throw new Error(response.statusText);
              }
              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                  throw new TypeError("Oops, we haven't got JSON!");
              }
              return response.json();
          })
          .then(data => {
              if (data.message === 'User verified') {
                  userContext.set({ personId, voteId });
                  navigate('/receipt');
              } else {
                  errors.server = 'Invalid 2FA code';
              }
          })
          .catch(err => {
              errors.server = err.message;
              console.log(errors.server);
          });
    };

    onMount(() => {
        // Additional initialization logic to be ran after component is mounted can be added here
    });
</script>

<style>
    @import './loginFormStyles.css';
</style>

<section>
    <div class="login-form">
        <!--<img class="logo" src="/path/to/your/logo.png" alt="Logo" />
-->
        <LoginForm on:formSubmitted={handleFormSubmitted} on:modalClosed={handleModalClose} />
    </div>
</section>

<Modal bind:showModal {voteId} {twoFactorCode} on:close={handleModalClose}>    <h2 slot="header">
        authenticate for {personId}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>