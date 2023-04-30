<script lang="ts">
    export let propName: string;
    export let callback: (e: Event) => void;
</script>



<div class="input-wrapper">
    <p class="text">{propName}</p>
    <input type="text" class="text" on:change={callback}>
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

    .text{
        height: 20px;
        width: 20px;
    }
</style>