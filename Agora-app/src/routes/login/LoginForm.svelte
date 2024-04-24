<style>
    @import './loginFormStyles.css';
</style>

<script>
    import Modal from './Modal.svelte';
    import {setServerCommand} from './loginUtils.js';
    let personId = "";
    let voteId = "";
    let isLoading = false;
    let isSuccess = false;
    let showModal = false;
    let errors = {};
    // eslint-disable-next-line no-unused-vars
    let twoFactorCode = "";
    let twoFactorCodeActual = '';

    const handleSubmit = () => {
        errors = {};

        if (personId.length === 0) {
            errors.personIdLabel = "Field should not be empty";
        }
        if (voteId.length === 0) {
            errors.voteId = "Field should not be empty";
        }

        if (Object.keys(errors).length === 0) {
            isLoading = true;
            console.log('2 this gets to run');
            fetch(setServerCommand('get-email'), {// change server address here
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
                  // Handle the retrieved email
                  showModal = true;
                  console.log('Retrieved email:', email);
                  console.log('4 this gets to run');
                  isLoading = false;

              })
              .catch(err => {
                  errors.server = err;
                  console.log('error 1')
                  isLoading = false;
              });
        }
    };
    const verify2FA = (twoFACode, personId, voteId) => {
        fetch(setServerCommand('verify-2fa'), { // change server address here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ twoFACode, personId, voteId }),
        })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Error verifying 2FA');
              }
              return response.text();
          })
          .then(message => {
              console.log('Server response:', message);
              if (message === 'User verified') {
                  isSuccess = true;

              }
          })
          .catch(err => {
              console.error('Error:', err);
          });
    };

    function handleModalClose(event) {
        console.log('Modal closed with mfa code:', event.detail.value);
        twoFactorCode = event.detail.value;
        verify2FA(twoFactorCode, personId, voteId);
        console.log('5 this gets to run');

        // Navigate to the next page with personId and voteId as query parameters
        sessionStorage.setItem('personId', personId);
        sessionStorage.setItem('voteId', voteId);
        //navigate(`../vote/+page?personId=${personId}&voteId=${voteId}`);
        return location.href = '/vote'
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    {#if isSuccess}
        <div class="success">
            🔓
            <br />
            You've been successfully logged in.
        </div>
    {:else}
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
    {/if}
</form>
<Modal bind:showModal {twoFactorCodeActual} on:close={handleModalClose}>
    <h2 slot="header">
        authenticate for {personId}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>