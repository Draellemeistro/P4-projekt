<script>
    import RedThing from './RedThing.svelte';
    import GreenThing from './GreenThing.svelte';
    import BlueThing from './BlueThing.svelte';
    import Inner from './Inner.svelte';

    function handleMessage(event) {
        alert(event.detail.text);
    }

    const options = [
        { color: 'red', component: RedThing },
        { color: 'green', component: GreenThing },
        { color: 'blue', component: BlueThing }
    ];

    let selected = options[0];

</script>


<select bind:value={selected}>
    {#each options as option}
        <option value={option}>{option.color}</option>
    {/each}
</select>

<Inner on:message={handleMessage} />

<svelte:component this={selected.component} />
