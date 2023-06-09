<script lang="ts">
    import Icon from "@iconify/svelte";
    import { FS, FileTypes, type FSFile, getFileTypeIcon } from "../../../FileSystem";
    import { openContextMenu, type IMenuOption } from "../../../ContextMenu";
    import { onMount } from "svelte";
    import { createToast } from "../../../ToastManager";
    import Toast from "../../Toast.svelte";
    import { ToastPosition, ToastType } from "../../../Types";

    interface Frame{
        path: string;
    }
    interface SpriteContent{
        frames: Array<Frame>;
    }

    onMount(() => {
        load();
    })

    export let filePath: string;
    let frames: Array<Frame> = [];

    function save(){
        let fsFile = FS.getAtPath(filePath) as FSFile;

        let spriteContnet = fsFile.content as SpriteContent

        spriteContnet.frames = frames;
    }

    function load(){
        let fsFile = FS.getAtPath(filePath) as FSFile;

        let spriteContnet = fsFile.content as SpriteContent

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
                avalableCheck: () => !frames.find(frame => frame.path == FS.getPath(imageFile)),
                icon: getFileTypeIcon(imageFile.fileType)

            })
        }

        openContextMenu(event.clientX, event.clientY, options)
    }

    function getFrameImage(frame: Frame){
        let fsFile = FS.getAtPath(frame.path) as FSFile;

        if (!fsFile) {
            createToast("Could Not Find File At Path: " + frame.path.replace("root", ""), ToastType.Error, ToastPosition.BottomRight, 5000);
            return;
        }

        return fsFile.content["data"];
    }
</script>



<div class="sprite-editor-body">
    <div class="topbar">

        <div class="frames">
            {#each frames as frame}
                <div class="frame">
                    <img src={getFrameImage(frame)} alt="" class="frame-thumbnail">
                </div>
            {/each}

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="frame add" on:click={openImageSelect}>
                <Icon icon="mdi-plus"></Icon>
            </div>
        </div>
    </div>

    <div class="image-viewer">
        {#if frames.length > 0}
            <img src={frames[0].path} alt="">
        {:else}
            <h1 class="no-frames-text">There Are No Frames <br> Click "+" or Drag Images Into The Toolbar to Add Frames</h1>
        {/if}
    </div>
</div>



<style>

    .frame-thumbnail{
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .frames{
        display: flex;
        flex-direction: row;
        overflow-x: auto;

        height: 100%;
        width: 100%;

        padding: 10px;

        gap: 10px;
    }

    .add{
    }

    .no-frames-text{
        color: var(--text-color);
        font-size: 1rem;
        font-weight: 500;
        text-align: center;
    }

    .frame{
        cursor: pointer;

        height: 100%;
        aspect-ratio: 1/1;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    }

    .sprite-editor-body{
        width: 100%;
        height: 100%;

        display: flex;

        flex-direction: column;
    }

    .topbar{
        height: 10rem;
        width: 100%;
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