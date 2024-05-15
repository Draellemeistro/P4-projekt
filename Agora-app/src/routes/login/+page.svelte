<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import Modal from './Modal.svelte';
    import { fetchEmail, verify2FA} from '../../utils/apiService.js';
    import { login } from '../../utils/auth.js';
    import { goto } from '$app/navigation';
    import cryptoUtils from '../../utils/cryptoUtils.js';
    let personId;
    let voteId;
    let errors = {};
    let showModal = false;


    const handleFormSubmitted = async ({ detail }) => {
        console.log('handleFormSubmitted called');
        personId = detail.personId;
        voteId = detail.voteId;

        fetchEmail(personId, voteId)
          .then(response => {
              if (!response.ok) {
                  throw new Error(response.statusText);
              }
              return response.json();
          })
          .then(data => {
              // Use the data here
              console.log(data);
              const ServerPubRSA = JSON.parse(data.keys.RSA);
              const ServerPubECDH = JSON.parse(data.keys.ECDH);
              const ServerPubDigSig = JSON.parse(data.keys.DigSig);
              cryptoUtils.RSA.saveServerKey(ServerPubRSA);
              cryptoUtils.ECDH.saveServerKey(ServerPubECDH);
              cryptoUtils.digSig.saveServerKey(ServerPubDigSig);
              login();
              showModal = true;
          })
          .catch(error => {
              // Handle any errors that occurred while fetching the data
              console.error('Error:', error);
          });
    };

    const handleModalClose = async ({ detail }) => {
        await cryptoUtils.ECDH.genKeys();
        await cryptoUtils.digSig.genKeys();
        const pubKeysForServer = await cryptoUtils.packagePublicKeys();
        const { twoFactorCode } = detail;
        verify2FA(twoFactorCode, personId, voteId, pubKeysForServer) // TODO: message can be encrypted, and/or signed(maybe) if needed
          .then(response => {
              if (!response.ok) {
                  throw new Error(response.statusText);
              }
              return response.json();
          })
          .then(data => {
              if (data.message === 'User verified') {
                  console.log(data)
                  goto('/vote');
              } else {
                  errors.server = 'Invalid 2FA code';
              }
          })
          .catch(error => {
              errors.server = error.message;
              console.error('Error:', error);
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

<Modal bind:showModal {voteId} on:close={handleModalClose}>    <h2 slot="header">
        authenticate for {personId}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>