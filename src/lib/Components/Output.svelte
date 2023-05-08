<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import { registerOutput, type OutputMessage, OutputTypes, unregisterOutput } from "../../OutputSystem";
  import { onMount,onDestroy } from "svelte";

    let myself = get_current_component();


    let messages: Array<OutputMessage> = []
    let errorCount = 0;
    let infoCount = 0;
    let warningCount = 0;


    export function addMessage(message: OutputMessage) {
        // have to do this because svelte doesn't like mutating arrays
        messages = [...messages, message];

        // // scroll to bottom
        // let output = document.querySelector(".output");

        // output.scrollTop = output.scrollHeight;

        // update the counters
        switch (message.type) {
            case OutputTypes.Error:
                errorCount++;
                break;
            case OutputTypes.Info:
                infoCount++;
                break;
            case OutputTypes.Warning:
                warningCount++;
                break;
        }
    }

    onMount(() => {
        registerOutput(myself);
    })

    onDestroy(() => {
        unregisterOutput(myself);
    })

    function clearMessages() {
        messages = [];
        errorCount = 0;
        infoCount = 0;
        warningCount = 0;
    }


</script>

<div class="output">
    <div class="top-bar">
        <div class="buttons">
            <button class="topbar-button" on:click={clearMessages}>Clear</button>
            <button class="topbar-button">Copy</button>
        </div>
        <div class="counters">
            <div class="counter error-counter">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a><span class="iconify" data-icon="mdi-alert-circle"></span></a>
                <p>{errorCount}</p>
            </div>

            <div class="counter warning-counter">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a><span class="iconify" data-icon="mdi-alert-circle-outline"></span></a>
                <p>{warningCount}</p>
            </div>

            <div class="counter info-counter">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a><span class="iconify" data-icon="mdi-information-outline"></span></a>
                <p>{infoCount}</p>
            </div>

            <div class="counter">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a><span class="iconify" data-icon="mdi-message-badge-outline"></span></a>
                <p>{messages.length}</p>
            </div>

        </div>
    </div>
    <div class="output-text">
        

        {#each messages as message}
            <div class="message {message.type}-message">
                <!-- foreach line of the message -->
                {#each message.message.split("\n") as line}
                    <div>{line}</div>
                {/each}
            </div>
        {/each}
    </div>
</div>


<style>

    .buttons{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }

    .counters{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }

    .counter{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2px;
        padding-left: 2px;
        padding-right: 2px;

        font-size: 0.7em;

        border-radius: var(--general-border-radius);

        color: var(--text-color);

        background-color: var(--foreground-color);
    }

    .top-bar{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 2px;
        padding-right: 5px;
        padding-left: 5px;
        /* background-color: var(--foreground-color-2); */
        /* border-bottom: 1px solid var(--foreground-color); */

        gap: 5px;
    }

    .topbar-button{
        
        color: var(--text-color);

        border: none;
        /* border: 1px solid var(--foreground-color-2); */
        border-radius: var(--general-border-radius);

        background-color: var(--foreground-color);
        padding: 2px;
        padding-left: 8px;
        padding-right: 8px;
    }

    .output{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .output-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        height: 100%;
        width: 100%;
        overflow: auto;
        gap: 2px;
    }

    .message {
        padding: 5px;
        color: var(--text-color);
        font-size: 0.8em;
        width: 100%;

        border-bottom: 1px solid var(--foreground-toast-color);
    }

    .error-message {
        background-color: var(--error-toast-color);
    }

    .warning-message {
        background-color: var(--warning-toast-color);
    }

    .info-message {
        background-color: var(--info-toast-color);
    }

    .default-message {
        background-color: var(--midground-color);
    }



    .error-counter {
        color: var(--error-toast-color);
    }

    .warning-counter {
        color: var(--warning-toast-color);
    }

    .info-counter {
        color: var(--info-toast-color);
    }

</style>