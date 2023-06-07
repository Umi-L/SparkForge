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

        background-color: rgba(0, 0, 0, 0.2);
    }

    .popover-container{
        width: 80%;
        height: 80%;
        
        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);
    }
</style>