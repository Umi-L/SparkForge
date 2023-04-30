<script lang="ts">
    export let funcName: string;
    export let callback: () => void;
</script>



<div class="input-wrapper">
    <p class="text">{funcName}</p>
    <input type="button" class="button" on:click={callback} value="run">
</div>



<style>
    .input-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        background-color: var(--foreground-color);

        padding: 10px;

        border-radius: var(--general-border-radius);

        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
    }
    
    .text{
        color: var(--text-color);
        font-weight: bold;


    }

    .button{
        height: 20px;
    }
</style>