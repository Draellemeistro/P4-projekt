<style>
    @import './loginFormStyles.css';
</style>

<script>
    let personId = "";
    let voteId = "";
    let isLoading = false;
    let isSuccess = false;
    let errors = {};
    export let submit;

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
            fetch('http://130.225.39.205:3000/get-email', {
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
                  console.log('Retrieved email:', email);
                  isLoading = false
                  submit(email)

              })
              .catch(err => {
                  errors.server = err;
                  console.log('error 1')
                  isLoading = false;
              });
        }
    };

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