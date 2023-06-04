<script lang="ts">
    import Icon from "@iconify/svelte";
    import { getFileTypeIcon, FileTypes } from "../../MockFS";
    import { openTabs } from "../../globals";
    import { each } from "svelte/internal";
    import FlowchartEditor from "./Editors/FlowchartEditor.svelte";
    import ScriptEditor from "./Editors/ScriptEditor.svelte";

    interface ITab {
        file: string;
        type: FileTypes;
    }

    let tabs: Array<ITab>;
    let editors: Array<any> = [];
    let selectedIndex = 0;

    openTabs.subscribe((value) => {
        tabs = value;
    });

    function deleteTab(index: number){
        console.log("deleting tab", index);
        openTabs.update((value) => value.filter((_, i) => i !== index));
    }

    function selectTab(index: number){
        selectedIndex = index;

        if (!editors[selectedIndex] || !editors[selectedIndex].onResize) return;

        editors[selectedIndex].onResize();
    }

    function getFileName(path: string){
        return path.split("/").pop();
    }
</script>



<div class="container">

    {#each tabs as tab, index}
        <div class="tab-content" class:visible={index == selectedIndex}>
            {#if tab.type == FileTypes.flowchart}
                <FlowchartEditor file={tab.file} bind:this={editors[index]}/>
            {:else if tab.type == FileTypes.script}
                <ScriptEditor file={tab.file} bind:this={editors[index]}/>
            {/if}
        </div>
    {/each}

    <div class="open-tabs">
        {#each tabs as tab, index}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="tab" class:unselected={index != selectedIndex} on:click={()=>{selectTab(index)}}>
                <Icon icon={getFileTypeIcon(tab.type)} class="icon"/>
                <p>{getFileName(tab.file)}</p>
                <div class="close-tab-button" on:click={()=>{deleteTab(index)}}>
                    <Icon icon="mdi:close" class="icon close-tab-icon"/>
                </div>
            </div>
        {/each}
    </div>

    {#if tabs.length === 0}
        <div class="no-tabs-wrapper">
            <p class="no-tabs">No files open. Double click a file to open it in the workspace.</p>
        </div>
    {/if}
</div>



<style>

    .visible{
        display: block !important;
    }

    .tab-content{
        display: none;
        width: 100%;
        height: 100%;
    }

    .close-tab-button{
        cursor: pointer;
        pointer-events: all;
        user-select: all;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    :global(.close-tab-icon){
        pointer-events: all;
    }

    :global(.close-tab-icon:hover){
        color: var(--primary-color) !important;
    }

    .tab{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: 100%;

        background-color: var(--midground-color);

        padding: var(--general-padding);

        border-radius: var(--general-border-radius);

        color: var(--text-color);

        font-size: 0.7em;

        pointer-events: all;

        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
    }

    .unselected{
        background-color: var(--midground-color-2) !important;
        color: var(--semi-light-text-color) !important;
    }

    .container{
        width:100%;
        height:100%;
    }

    .no-tabs-wrapper{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        height: 100%;

        padding: 10px;
    }

    .no-tabs{
        margin: 0;
        padding: 0;
        color: var(--text-color);

        font-size: 0.7em;

        user-select: none;

        text-align: center;
    }

    .open-tabs{
        position: absolute;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;
        gap: 10px;
        width: 100%;
        height: 1.8em;

        bottom: 0px;

        overflow-x: auto;

        /* background-color: var(--foreground-color); */
        padding: var(--general-padding);

        pointer-events: none;
        user-select: none;

        /* border-radius: var(--general-border-radius); */
    }
</style>