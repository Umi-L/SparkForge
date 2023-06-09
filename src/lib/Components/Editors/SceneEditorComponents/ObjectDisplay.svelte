<script lang="ts">
    import type { FSFile } from "../../../../FileSystem";

    export let object: FSFile;
    export let position: {x: number, y: number};
    export let size: {width: number, height: number} = {width: 35, height: 35};

    // if (object.components[Components.Sprite]){

    // }
</script>



<div class="object-container" style={`left: ${position.x}px; top: ${position.y}px; width: ${size.width}px; height: ${size.height}px;`}>
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src={"/UnknownSprite.svg"} class="sprite-display">
</div>



<style>
    .object-container{
        position: absolute;
    }

    .sprite-display{
        width: 100%;
        height: 100%;

        user-select: none;
        pointer-events: none;
    }
</style>