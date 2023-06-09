<script lang="ts">

</script>



<div class="popover-root">
    <div class="popover-container">
        <slot></slot>
    </div>
</div>



<style>

    .popover-root{
        position: absolute;

        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        background-color: rgba(0, 0, 0, 0.4);

        z-index: 1000;
    }

    .popover-container{
        width: 90%;
        height: 90%;
        
        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);

        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 
    }
</style>