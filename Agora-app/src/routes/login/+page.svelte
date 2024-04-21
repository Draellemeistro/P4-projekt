<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import Modal from './Modal.svelte';
    import { navigate } from 'svelte-routing';
    import { userContext } from './userContext.js';

    let personId = 1;
    let twoFactorCode = 1234;
    let email = ""
    let errors = {};
    let showModal = false;

    const serverIP = '130.225.39.205';
    const serverPort = '80';

    const handleFormSubmitted = ({ detail }) => {
        console.log('handleFormSubmitted called');
        const { personId, voteId } = detail;
        fetch(`http://${serverIP}:${serverPort}/get-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ personId, voteId }),
        })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Error fetching email 1');
              }
              return response.text();
          })
          .then(email => {
              showModal = true;
          })
          .catch(err => {
              errors.server = err;
          });
    };

    const handleModalClose = ({ detail }) => {
        const { twoFactorCode, personId, voteId } = detail;
        console.log('handleModalClose called');
        fetch(`http://${serverIP}:${serverPort}/verify-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ twoFactorCode, personId, voteId }),
        })
          .then(response => {
              if (!response.ok) {
                  console.log('Error verifying 2FA code')
                  throw new Error('Error verifying 2FA code');
              }
              return response.text();
          })
          .then(response => {
              if (response === 'User verified') {
                  console.log('User verified')
                  userContext.set({ personId, voteId });
                  navigate('/receipt');
              } else {
                  errors.server = 'Invalid 2FA code';
                  console.log('Invalid 2FA code')
              }
          })
          .catch(err => {
              errors.server = err;
          });
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
        <!--<img class="logo" src="/path/to/your/logo.png" alt="Logo" />
-->
        <LoginForm on:formSubmitted={handleFormSubmitted} on:modalClosed={handleModalClose} />
    </div>
</section>
<Modal bind:showModal {twoFactorCode} on:close={handleModalClose}>
    <h2 slot="header">
        authenticate for {personId}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>