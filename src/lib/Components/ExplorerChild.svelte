<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { FS, FileTypes, type FSDirectory, type FSFile } from "../../MockFS";
  import { openContextMenu, type IMenuOption } from "../../ContextMenu";
  import Icon from '@iconify/svelte';

    export let directory: FSDirectory = undefined;
    export let file: FSFile = undefined;
    export let indent = 0;

    let container: HTMLDivElement;
    let directoryElement: HTMLDivElement;
    let fileElement: HTMLDivElement;

    let color = indent % 2 === 0 ? "--foreground-color" : "--midground-color";

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "New", action: ()=>{}, avalableCheck: ()=>true, subMenuOptions: [
            {label: "GameObject", action: newGameObject, avalableCheck: ()=>true, icon: "mdi-cube-outline"},
            {label: "Folder", action: newFolder, avalableCheck: ()=>true, icon: "mdi-folder"},
        ], icon: "mdi-plus"},
        {label: "Rename", action: rename, avalableCheck: ()=>true, icon: "mdi-rename"},
        {label: "Delete", action: ()=>{}, avalableCheck: ()=>true, icon: "mdi-trash-can-outline"},
        {label: "Duplicate", action: ()=>{}, avalableCheck: ()=>true, icon:"mdi-content-duplicate"},
    ]

    let showChildren = false;

    function newGameObject(){

        let dir = (directory) ? directory : file.parent;

        let path = FS.getPath(dir);

        FS.addFile(path, {fileType: FileTypes.gameobject, type: "file", name: "new gameobject", content: {}, parent: dir});

        // if dir not toggled, toggle it
        if (!showChildren){
            toggleShow();
        }
    }

    function newFolder(){

        let dir = (directory) ? directory : file.parent;

        let path = FS.getPath(dir);

        FS.addDir(path, {type: "directory", name: "new folder", parent: dir, children: []});

        // if dir not toggled, toggle it
        if (!showChildren){
            toggleShow();
        }
    }

    function rename(){
        let fileordir = (directory) ? directory : file;
        let path = FS.getPath(fileordir);

        FS.rename(path, "new name");
    }

    function toggleShow(){
        showChildren = !showChildren;
    }

    onMount(()=>{
        container.addEventListener("contextmenu", onContextMenu)
    })

    onDestroy(()=>{
        container.removeEventListener("contextmenu", onContextMenu)
    })

    function onContextMenu(event){

        if (event.target !== directoryElement && event.target !== fileElement && event.target !== container){
            console.log(event.target)
            return;
        }

        openContextMenu(event.clientX, event.clientY, contextMenuOptions)

        event.preventDefault();
    }
</script>



<div class="container" style={`margin-left: ${indent*10}px; background-color: var(${color})`} bind:this={container}>
    {#if directory}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="directory" on:click={toggleShow} bind:this={directoryElement}>

            <div class="arrow" class:visible={!showChildren}>
                <!-- <span class="iconify icon" data-icon="mdi-menu-right"></span> -->
                <Icon icon="mdi-menu-right" class="icon" />
            </div>
            <div class="arrow" class:visible={showChildren}>
                <!-- <span class="iconify icon" data-icon="mdi-menu-down"></span> -->
                <Icon icon="mdi-menu-down" class="icon" />
            </div>

            <h3>
                {directory.name}
            </h3>

           
        </div>

        <div class="children" class:visible={showChildren}>
            {#each directory.children as child}
                {#if child.type === "file"}
                    <svelte:self file={child} indent={indent+1} />
                {:else}
                    <svelte:self directory={child} indent={indent+1} />
                {/if}
            {/each}
        </div>
    {:else if file}
        <div class="file" bind:this={fileElement}>
            <Icon icon="mdi-file-document-outline"/>
            <h3>{file.name}</h3>
            <!-- <div class="sep"></div> -->
        </div>
    {/if}
</div>



<style>

    .icon{
        color: var(--text-color);
        pointer-events: none;
    }

    .file{
        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    .arrow{
        display: none;
        pointer-events: none;
    }

    .container{

        border-radius: var(--general-border-radius);

        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
        width: fit-content;

        min-width: 10rem;
    }

    .directory{
        display: flex;
        flex-direction: row;
        gap: 5px;
        align-items: center;
        cursor: pointer;
    }

    h3{
        color: var(--text-color);
        font-size: 0.7em;
        margin: 0;

        pointer-events: none;
    }

    .visible {
        display: flex !important;
    }

    .children{
        display: none;

        flex-direction: column;
        gap: 5px;
    }
</style>