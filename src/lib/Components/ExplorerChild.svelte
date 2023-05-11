<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { FS, FileTypes, type FSDirectory, type FSFile, getFileTypeIcon } from "../../MockFS";
  import { openContextMenu, type IMenuOption } from "../../ContextMenu";
  import Icon from '@iconify/svelte';
  import { createToast } from "../../ToastManager";
  import { ToastPosition, ToastType } from "../../Types";

    export let directory: FSDirectory = undefined;
    export let file: FSFile = undefined;
    export let indent = 0;

    let container: HTMLDivElement;
    let directoryElement: HTMLDivElement;
    let fileElement: HTMLDivElement;

    let renaming = false;
    let name = "";

    let dragging = false;
    let possibleDragging = false;

    let position: {x: number, y: number} = {x: 0, y: 0};

    let color = indent % 2 === 0 ? "--foreground-color" : "--midground-color";

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "New", action: ()=>{}, avalableCheck: ()=>true, subMenuOptions: [
            {label: "Folder", action: newFolder, avalableCheck: ()=>true, icon: "material-symbols:folder-outline"},
        ], icon: "mdi-plus"},
        {label: "Rename", action: startRename, avalableCheck: ()=>true, icon: "mdi-rename"},
        {label: "Duplicate", action: duplicate, avalableCheck: ()=>true, icon:"mdi-content-duplicate"},
        {label: "Delete", action: remove, avalableCheck: ()=>true, icon: "mdi-trash-can-outline"},
    ]

    // foreach fileType, add a new menu option
    for (let _ in FileTypes){
        let fileType = _ as FileTypes; // gotta love typescript
        contextMenuOptions[0].subMenuOptions.push({label: fileType, action: ()=>{newFileOfType(fileType)}, avalableCheck: ()=>true, icon: getFileTypeIcon(fileType)})
    }

    let showChildren = false;

    function newFileOfType(type: FileTypes){

        let dir = (directory) ? directory : file.parent;

        let path = FS.getPath(dir);

        FS.addFile(path, {fileType: type, type: "file", name: `new ${type}`, content: {}, parent: dir});

        // if dir not toggled, toggle it
        if (!showChildren){
            toggleShow();
        }
    }

    function startRename(){
        renaming = true;
    }

    function newFolder(){

        let dir = (directory) ? directory : file.parent;

        let path = FS.getPath(dir);

        console.log(path)
        console.log(dir)

        FS.addDir(path, {type: "directory", name: "new folder", parent: dir, children: []});

        // if dir not toggled, toggle it
        if (!showChildren){
            toggleShow();
        }
    }

    function rename(){

        if (name === ""){
            renaming = false;

            createToast("Name cannot be empty", ToastType.Error, ToastPosition.BottomRight);

            return;
        }

        let fileordir = (directory) ? directory : file;
        console.log(fileordir)
        let path = FS.getPath(fileordir);

        FS.rename(path, name);

        renaming = false;
    }

    function remove(){
            
            let fileordir = (directory) ? directory : file;
            let path = FS.getPath(fileordir);
    
            FS.delete(path);
    }

    function duplicate(){
        let fileordir = (directory) ? directory : file;
        let path = FS.getPath(fileordir);

        FS.duplicate(path);
    }

    function toggleShow(){
        showChildren = !showChildren;
    }

    onMount(()=>{
        container.addEventListener("contextmenu", onContextMenu)
        container.addEventListener("mousedown", (event)=>{
            if (event.button !== 0) return;
            possibleDragging = true;
            event.preventDefault();
        })

        window.addEventListener("mousemove", (event)=>{
            if (!possibleDragging) return;

            if (Math.abs(event.movementX) > 2 || Math.abs(event.movementY) > 2){
                dragging = true;
            }

            if (dragging){
                position.x += event.movementX;
                position.y += event.movementY;

                container.style.left = `${position.x}px`;
                container.style.top = `${position.y}px`;
            }
                        
        })

        window.addEventListener("mouseup", (event)=>{
            dragging = false;
            possibleDragging = false;
        })
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



<div class="container" style={`margin-left: ${indent*10}px; background-color: var(${color}); min-width: calc(100% - ${indent*10}px);`} bind:this={container} class:dragging={dragging}>
    {#if directory && !renaming}
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

        {#if showChildren && directory.children.length > 0}
            <div class="children">
                {#each directory.children as child}
                    {#if child.type === "file"}
                        <svelte:self file={child} indent={indent+1} />
                    {:else}
                        <svelte:self directory={child} indent={indent+1} />
                    {/if}
                {/each}
            </div>
        {/if}
    {:else if file && !renaming}
        <div class="file" bind:this={fileElement}>
            <Icon icon={getFileTypeIcon(file.fileType)} class="icon"/>
            <h3>{file.name}</h3>
            <!-- <div class="sep"></div> -->
        </div>
    {:else if renaming}
        <input type="text" class="rename"
        value={(file) ? file.name : directory.name} on:input={e=>{
            // @ts-ignore
            name = e.target.value;
        }} 
        on:keypress={(event)=>{
            if (event.key === "Enter"){
                rename();
            }
        }} 
        on:blur={rename} />

    {/if}
</div>



<style>

    .dragging{
        position: absolute;
        opacity: 0.5;
    }

    .rename{
        background-color: transparent;
        border: none;
        border-bottom: 1px solid var(--text-color);
        color: var(--text-color);
        font-size: 0.7em;
        outline: none;
        padding: 0;
        margin: 0;
        width: 100%;

        font-family: var(--font-family);
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
        flex-direction: column;
        gap: 5px;
    }
</style>