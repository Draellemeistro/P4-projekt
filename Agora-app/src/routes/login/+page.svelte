<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import Modal from '../vote/Modal.svelte';
    let personId = 1;
    let twoFactorCode = 1234;
    let email = ""
    let errors = {};

    export let submit;


    let showModal = false;

    submit = ({ personId, voteId }) => {
        console.log('1 this gets to run');

        fetch('http://130.225.39.205:3000/get-email', { // change server address here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ personId, voteId }),
        })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Error fetching email 2');
              }
              return response.json();
          })
          .then(data => {
              email = data;
              showModal = true;
              console.log('showModal runs')

          })
          .catch(err => {
              errors.server = err;
              console.log('errror +page')
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
        <LoginForm {submit} />
    </div>
</section>
<Modal bind:showModal {twoFactorCode}>
    <h2 slot="header">
        authenticate for {personId}
    </h2>

    <a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>
