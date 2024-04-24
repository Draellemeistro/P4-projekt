<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import Modal from './Modal.svelte';
    import { navigate } from 'svelte-routing';
    import { fetchEmail, verify2FA} from '../../utils/apiService.js';

    let personId;
    let voteId;
    let errors = {};
    let showModal = false;


    const handleFormSubmitted = ({ detail }) => {
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
              showModal = true;
          })
          .catch(error => {
              // Handle any errors that occurred while fetching the data
              console.error('Error:', error);
          });
    };

    const handleModalClose = ({ detail }) => {
        const { twoFactorCode} = detail;
        verify2FA(twoFactorCode, personId, voteId)
          .then(response => {
              if (!response.ok) {
                  throw new Error(response.statusText);
              }
              return response.json();
          })
          .then(data => {
              if (data.message === 'User verified') {
                  navigate('/vote');
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