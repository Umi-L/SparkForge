<script lang="ts">
    import Icon from "@iconify/svelte";
    import { FS, FileTypes, type FSFile, getFileTypeIcon } from "../../../FileSystem";
    import { openContextMenu, type IMenuOption } from "../../../ContextMenu";
    import { onMount } from "svelte";
    import { createToast } from "../../../ToastManager";
    import Toast from "../../Toast.svelte";
    import { ToastPosition, ToastType, type SpriteFileContent, type Frame } from "../../../Types";
  import { currentEntity } from "../../../globals";

   
    onMount(() => {
        load();
    })
    
    let selectedFrame: number = 0;
    let frameElements: Array<HTMLDivElement> = [];
    let frameTime = 0.1; // time between frames in seconds

    export let filePath: string;
    let frames: Array<Frame> = [];

    function save(){
        let fsFile = FS.getAtPath(filePath) as FSFile;

        let spriteContnet = fsFile.content as SpriteFileContent

        spriteContnet.frames = frames;
    }

    function load(){
        let fsFile = FS.getAtPath(filePath) as FSFile;

        let spriteContnet = fsFile.content as SpriteFileContent

        if (!spriteContnet.frames) return;

        frames = spriteContnet.frames;
    }

    function openImageSelect(event: MouseEvent){

        let options: Array<IMenuOption> = []

        let imageFiles = FS.getAllOfType([FileTypes.png, FileTypes.jpg, FileTypes.jpeg, FileTypes.gif]);

        for (let imageFile of imageFiles){
            options.push({
                label: FS.getPath(imageFile),
                action: () => {
                    frames = [...frames, {path: FS.getPath(imageFile)}];

                    save();
                },
                avalableCheck: () => true,
                icon: getFileTypeIcon(imageFile.fileType)

            })
        }

        openContextMenu(event.clientX, event.clientY, options)
    }

    function getFrameImage(frame: Frame){

        // if the frame is not in frames return
        if (!frames.includes(frame)) return;

        let fsFile = FS.getAtPath(frame.path) as FSFile;

        if (!fsFile) {
            createToast("Could Not Find File At Path: " + frame.path.replace("root", ""), ToastType.Error, ToastPosition.BottomRight, 5000);
            return;
        }

        console.log(fsFile);

        return fsFile.content["data"];
    }

    function removeFrame(index: number){
        frames.splice(index, 1);

        frames = [...frames]; // force each update

        // ensure selected frame is still in range
        if (selectedFrame >= frames.length) selectedFrame = frames.length - 1;

        console.log(frames, selectedFrame)

        save();
    }
</script>



<div class="sprite-editor-body">
    <div class="topbar">

        <div class="frames">
            {#each frames as frame, i}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="frame" on:click={(event)=>{
                    if (event.target == frameElements[i])
                        selectedFrame = i
                    }} 
                    class:selected={selectedFrame==i}
                    bind:this={frameElements[i]}>
                    <img src={getFrameImage(frame)} alt="" class="frame-thumbnail">
                    <div class="delete-button" on:click={()=>{removeFrame(i)}}>
                        <Icon icon="mdi-close" class="icon"></Icon>
                    </div>
                </div>
            {/each}

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="frame add" on:click={openImageSelect}>
                <Icon icon="mdi-plus"></Icon>
            </div>
        </div>

        <div class="frame-settings">
            <p class="frame-settings-text">
                Frame Time:
            </p>
            <input type="number" step="0.1" min="0" bind:value={frameTime} class="frame-time">
        </div>
        
    </div>

    <div class="image-viewer">
        {#if frames.length > 0}
            <img src={getFrameImage(frames[selectedFrame])} alt="" class="frame-thumbnail">
        {:else}
            <h1 class="no-frames-text">There Are No Frames <br> Click "+" or Drag Images Into The Toolbar to Add Frames</h1>
        {/if}
    </div>
</div>



<style>

    .frame-settings-text{
        color: var(--text-color);
        font-size: 0.6rem;
        font-weight: 500;
    }

    .frame-settings{

        display: flex;
        flex-direction: row;
        align-items: center;

        position: absolute;
        top: 5px;
        right: 5px;

        width: 5rem;
        height: 1rem;
    }

    .frame-time{
        width: 100%;
        height: 100%;

        background-color: var(--foreground-color);
        outline: 1px solid var(--text-color);
        border: none;
        border-radius: 5px;

        color: var(--text-color);
        font-size: 0.8rem;
        font-weight: 500;

        padding: 0.2rem;
    }

    .frame-thumbnail{
        height: 100%;

        image-rendering: pixelated;

        pointer-events: none;
    }

    .frames{
        display: flex;
        flex-direction: row;
        overflow-x: scroll;

        height: 100%;
        width: 100%;

        padding: 10px;

        gap: 10px;
    }

    .selected{
        outline: 2px solid var(--primary-color);
    }

    .no-frames-text{
        color: var(--text-color);
        font-size: 1rem;
        font-weight: 500;
        text-align: center;
    }

    .delete-button{
        position: absolute;
        top: 2px;
        right: 2px;

        width: 1rem;
        height: 1rem;


        background-color: var(--midground-color);
        border-radius: 50%;
        border: 1px solid var(--background-color);

        display: flex;
        justify-content: center;
        align-items: center;

        cursor: pointer;

        opacity: 0;

        transition: 0.1s ease-in-out;
    }

    .frame:hover .delete-button{
        opacity: 0.9;
    }

    .frame{
        cursor: pointer;

        height: 100%;
        aspect-ratio: 1/1;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: var(--foreground-color);
        /* border-radius: var(--general-border-radius); */
        box-shadow: 0 0 5px rgba(0,0,0,0.1);

        position: relative;
    }

    .sprite-editor-body{
        position: relative;

        width: 100%;
        height: 100%;

        display: flex;

        flex-direction: column;
    }

    .topbar{
        height: 10rem;
        width: 100%;

        display: flex;
        flex-direction: row;
    }

    .image-viewer{
        width: 100%;
        height: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }
</style>