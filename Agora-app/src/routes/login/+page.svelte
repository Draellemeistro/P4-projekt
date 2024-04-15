<h1>Welcome to login page</h1>

<script>
    import { onMount } from 'svelte';
    import LoginForm from "./LoginForm.svelte";
    import Modal from '../vote/Modal.svelte';

    let email = ""
    let errors = {};



    let showModal = true;

     const submit = ({ personId, voteId }) => {
        console.log('1 this gets to run');

        fetch('http://20.79.40.89:80/get-email', {
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
-->        <LoginForm {submit} bind:showModal />
    </div>
</section>


