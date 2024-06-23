<script>
    import { cryptoUtils } from '../../utils/cryptoUtils.js';
    import { handleBallot } from './votePage.js';
    import { goto } from '$app/navigation';
    export let showModal; // boolean
    export let selectedOptionModal;
    let dialog; // HTMLDialogElement
    let keyStatus;
    let keyStatusServer;

    $: if (dialog && showModal) dialog.showModal();
    async function voteHandler() {
        dialog.close()
        handleBallot(selectedOptionModal).then(() => {
            goto('/receipt')
        }).catch((error) => {
            console.error(error);
        });

    }

    async function checkKeyStatus() {
        if (cryptoUtils.ECDH.pubKey && cryptoUtils.digSig.pubKey) {
            if (cryptoUtils.ECDH.pubKey instanceof CryptoKey
              && cryptoUtils.digSig.pubKey instanceof CryptoKey) {
                console.log('Public key:', cryptoUtils.ECDH.pubKey);
                keyStatus = 'Public keys exist';
            }
        } else {
            console.log('No public key');
            keyStatus = 'No public key';
        }
        if (cryptoUtils.ECDH.serverKey instanceof CryptoKey
          && cryptoUtils.digSig.serverKey instanceof CryptoKey
          && cryptoUtils.RSA.serverKey instanceof CryptoKey){
            keyStatusServer = 'Server public keys properly loaded';
        } else {
            console.log('Server public keys not loaded properly');
            keyStatusServer = 'Server public keys not loaded.';
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <slot name="header" />
        <hr />
        <slot />
        <hr />
        <button on:click={() => checkKeyStatus()}>Check key status</button>
        <p>{keyStatus}</p>
        <p>{keyStatusServer}</p>
        <!-- svelte-ignore a11y-autofocus -->
        <button autofocus on:click={() => dialog.close()}>Go back</button>
        <button on:click={() => voteHandler()}>CAST VOTE</button>
    </div>
</dialog>

<style>
    dialog {
        max-width: 40em;
        border-radius: 0.2em;
        border: none;
        padding: 0;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }

    dialog > div {
        padding: 1em;
    }

    dialog[open] {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes zoom {
        from {
            transform: scale(0.95);
        }
        to {
            transform: scale(1);
        }
    }

    dialog[open]::backdrop {
        animation: fade 0.2s ease-out;
    }

    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    button {
        padding-bottom: 3px;
        display: block;
    }
</style>