<script lang="ts">

    import { panels } from "../main";
    import { onMount } from "svelte";

    export let rowstyle:string;
    export let colstyle:string;
    export let name:string;

    let panelHeader:HTMLDivElement;
    
    let panelContainer:HTMLDivElement;
    let dragging = false;

    let currentSize = {width: 0, height: 0};
    

    onMount(() => {
        // add panel to the panels array
        panels.push(panelContainer);

        // set style of the panel
        panelContainer.style.gridColumn = colstyle;
        panelContainer.style.gridRow = rowstyle;

        // update the position of the panel
        updatePosition();

        // add event listeners
        window.addEventListener("mousemove", onGlobalMouseMove);
        window.addEventListener("mouseup", globalMouseUp);

        // add event listeners to the panel's header
        panelHeader.addEventListener("mousedown", onHandleMouseDown);
    });

    function onGlobalMouseMove(event){
        if (!dragging)
            return

        
        // set the panel size to the current size
        panelContainer.style.width = currentSize.width + "px";
        panelContainer.style.height = currentSize.height + "px";
    }

    function onHandleMouseDown(event){
        dragging = true;

        // get the current size of the panel using the bounding box
        let boundingBox = panelContainer.getBoundingClientRect();

        currentSize.width = boundingBox.width;
        currentSize.height = boundingBox.height;

        // set the panel size to the current size
        panelContainer.style.width = currentSize.width + "px";
        panelContainer.style.height = currentSize.height + "px";
    }

    function globalMouseUp(){
        dragging = false;
    }

    // function that determines the position of the panel in the grid based on the other elements the same column
    function updatePosition(){

        let panelsInSameColumn = [];

        // look at all panels
        for (let i = 0; i < panels.length; i++) {
            // if the panel is the same as the current panel
            if (panels[i] == panelContainer) 
                continue;
            
            // determine the panel's position in the grid
            let panelPosition = panels[i].getBoundingClientRect();
            // determine the current panel's position in the grid
            let currentPanelPosition = panelContainer.getBoundingClientRect();

            // if the panel is in the same column as the current panel
            if (panelPosition.left == currentPanelPosition.left) {
                // add the panel to the array
                panelsInSameColumn.push(panels[i]);
            }
        }

        
    }
    

</script>



<div class="panel-container" bind:this={panelContainer} class:dragging={dragging}>
    <div class="panel-header" bind:this={panelHeader}>
        <div class="panel-title">
            <h1>{name}</h1>
        </div>
        <div class="panel-buttons">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="min-close-button"><span class="iconify" data-icon="mdi-minus"></span></a>

            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="min-close-button"><span class="iconify" data-icon="mdi-close"></span></a>
        </div>
    </div>
    <div class="panel-body">
        <slot></slot>
    </div> 
</div>



<style>

    .panel-body{
        width: 100%;
        height: 100%;
        overflow: auto;

        user-select: none;
    }

    .panel-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background-color: var(--midground-color);
        border-radius: var(--general-border-radius);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        overflow: hidden;

        user-select: none;
    }

    .panel-header{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 5px;
        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);

        user-select: none;
    }
    .panel-header h1 {
        color: var(--text-color);
        font-size: 0.8rem;
        font-weight: 300;

        margin: 0;

        user-select: none;
    }
    .panel-header a {
        font-size: 0.8rem;
        color: var(--text-color);
        text-decoration: none;

        margin: 0;
        padding: 0;
    }
    .panel-buttons{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5px;
    }

    .min-close-button:hover{
        color: var(--primary-color);
    }

    .dragging{
        opacity: 0.8;

        position: absolute;
    }

</style>