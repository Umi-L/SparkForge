<script lang="ts">
    import { FS, type FSFile } from "../../../../FileSystem";
  import { getComponent, getProperty } from "../../../../Utils";

    export let objectPath: string;
    export let position: {x: number, y: number};
    export let scale: {width: number, height: number} = {width: 35, height: 35};
    export let rotation: number = 0;

    let object = FS.getAtPath(objectPath) as FSFile;

    let spritePath = getSpritePath()
    if (!spritePath) {
        spritePath = "/UnknownSprite.svg"
    }
    
    function getSpritePath() {
        if (!object.components) return;

        console.log("object", object);
        
        let spriteComponent = getComponent(object, "Sprite");
        if (!spriteComponent) return;

        console.log("spriteComponent", spriteComponent);

        let spriteProperty = getProperty(spriteComponent, "Sprite");
        if (!spriteProperty) return;

        console.log("spriteProperty", spriteProperty);

        let spritePath = spriteProperty.value;
        
        let spriteFile = FS.getAtPath(spritePath) as FSFile;
        if (!spriteFile) return;
        
        console.log("spriteFile", spriteFile)

        let spriteContent = spriteFile.content as {frames: Array<{path: string}>};

        if (!spriteContent) return;
        if (!spriteContent.frames) return;
        if (spriteContent.frames.length === 0) return;

        spritePath = spriteContent.frames[0].path;

        if (!spritePath) return;

        let spriteImageFile = FS.getAtPath(spritePath) as FSFile;
        if (!spriteImageFile) return;

        spritePath = spriteImageFile.content["data"];
        
        return spritePath;
    }

</script>



<div class="object-container" style={`left: ${position.x}px; top: ${position.y}px; width: ${scale.width}px; height: ${scale.height}px;`}>
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src={spritePath} class="sprite-display">
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