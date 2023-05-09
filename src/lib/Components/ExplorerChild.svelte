<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { FSDirectory, FSFile } from "../../MockFS";
  import { openContextMenu, type IMenuOption } from "../../ContextMenu";

    export let directory: FSDirectory = undefined;
    export let file: FSFile = undefined;
    export let indent = 0;

    let container: HTMLDivElement;

    let color = indent % 2 === 0 ? "--foreground-color" : "--midground-color";

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "New", action: ()=>{}, avalableCheck: ()=>true, subMenuOptions: [
            {label: "GameObject", action: ()=>{}, avalableCheck: ()=>true, icon: "mdi-cube-outline"},
            {label: "Folder", action: ()=>{}, avalableCheck: ()=>true, icon: "mdi-folder"},
        ], icon: "mdi-plus"},
        {label: "Rename", action: ()=>{}, avalableCheck: ()=>true, icon: "mdi-rename"},
        {label: "Delete", action: ()=>{}, avalableCheck: ()=>true, icon: "mdi-trash-can-outline"},
        {label: "Duplicate", action: ()=>{}, avalableCheck: ()=>true, icon:"mdi-content-duplicate"},
    ]

    let showChildren = false;

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
        openContextMenu(event.clientX, event.clientY, contextMenuOptions)

        event.preventDefault();
    }
</script>



<div class="container" style={`margin-left: ${indent*10}px; background-color: var(${color})`} bind:this={container}>
    {#if directory}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="directory" on:click={toggleShow}>

            <div class="arrow" class:visible={!showChildren}>
                <span class="iconify icon" data-icon="mdi-menu-right"></span>
            </div>
            <div class="arrow" class:visible={showChildren}>
                <span class="iconify icon" data-icon="mdi-menu-down"></span>
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
        <div class="file">
            <span class="iconify icon" data-icon="mdi-file-document-outline"></span>
            <h3>{file.name}</h3>
            <!-- <div class="sep"></div> -->
        </div>
    {/if}
</div>



<style>

    .icon{
        color: var(--text-color);
    }

    .file{
        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    .arrow{
        display: none;
    }

    .container{

        border-radius: var(--general-border-radius);

        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
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