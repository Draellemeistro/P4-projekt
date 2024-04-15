<script>
    // Import necessary modules/components
    import Modal from './Modal.svelte';

    // Declare reactive variables
    let personId = "";
    let voteId = "";
    let isLoading = false;
    let isSuccess = false;
    let showModal = false;
    let twoFactorCode = '';
    let errors = {};

    // Function to handle form submission
    const handleSubmit = () => {
        // Reset errors
        errors = {};

        // Show modal when form is submitted
        showModal = true;

        // Validate form fields
        if (personId.length === 0) {
            errors.personIdLabel = "Field should not be empty";
        }
        if (voteId.length === 0) {
            errors.voteId = "Field should not be empty";
        }

        // If no errors, proceed with fetching data
        if (Object.keys(errors).length === 0) {
            isLoading = true;
            fetch('http://localhost:3000/get-email', {
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
                  console.log('Retrieved email:', email);
                  isLoading = false;
                  isSuccess = true;
              })
              .catch(err => {
                  errors.server = err;
                  console.log('error 1')
                  isLoading = false;
              });
        }
    };
</script>

<!-- Form section -->
<form on:submit|preventDefault={handleSubmit}>
    {#if isSuccess}
        <div class="success">
            <!-- Success message -->
        </div>
    {:else}
        <h1>👤</h1>
        <!-- Input fields -->
        <label>CPR
            <input name="personIdLabel" placeholder="1234561234" bind:value={personId} />
        </label>
        <label>Vote ID
            <input name="voteIdLabel" placeholder="123456789" bind:value={voteId} />
        </label>
        <!-- Submit button -->
        <button type="submit">
            {#if isLoading}
                <!-- Loading message -->
                Logging in...
            {:else}
                <!-- Normal login button -->
                Log in 🔒
            {/if}
        </button>
        <!-- Error messages -->
        {#if Object.keys(errors).length > 0}
            <ul class="errors">
                {#each Object.keys(errors) as field}
                    <li>{field}: {errors[field]}</li>
                {/each}
            </ul>
        {/if}
    {/if}
</form>

<!-- Modal component -->
<Modal
  {twoFactorCode}
  {showModal}
  on:close={() => showModal = false}
/>
