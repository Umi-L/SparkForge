<script lang="ts">
  import { onMount } from "svelte";

    let container: HTMLDivElement;
    let viewer: HTMLDivElement;

    let selecting = false;
    let selectedItems = [];
    let dragging = false;
    let selectingStartPos = {x: 0, y: 0};

    let selectionBox: HTMLDivElement;
    let currentlySelectedBox: HTMLDivElement;

    let stageSize = {width: 25, height: 15};
    let gridSize = 35;

    let hasBeenFocused = false;

    onMount(()=>{
        window.addEventListener("mousemove", globalMouseMove);
    })

    export function onSelect(event){
        if (!hasBeenFocused){
            hasBeenFocused = true;
            
            // wait for the viewer to be rendered
            requestAnimationFrame(()=>{
                // centre viewer
                viewer.scrollLeft = (viewer.scrollWidth - viewer.clientWidth) / 2;
                viewer.scrollTop = (viewer.scrollHeight - viewer.clientHeight) / 2;
            })
            
        }
    }

    function viewerMouseDown(event){
        console.log("mouse down");

        if (event.button == 0){
            // if the mouse is not over only the workspace then don't drag
            if (event.target != viewer) {
                return;
            }


            // if shift is pressed then don't drag
            if (event.shiftKey) {
                selecting = true;

                selectingStartPos = globalMousePosToViewerPos({x: event.clientX, y: event.clientY});

                // reset selection box
                selectionBox.style.width = "0px";
                selectionBox.style.height = "0px";

                selectionBox.style.left = selectingStartPos.x + "px";
                selectionBox.style.top = selectingStartPos.y + "px";

                //set start position of selection
            }
            else{
                selectedItems = [];
                // refreshSelected();
                dragging = true;
            }
        }

        event.preventDefault();
    }

    function viewerMouseMove(event){
        if (dragging) {
            // move the workfield the same amount as the mouse moved
            viewer.scrollLeft -= event.movementX;
            viewer.scrollTop -= event.movementY;
        }
    }

    function viewerMouseUp(event){
        if (dragging){
            dragging = false;
        }
    }

    function globalMousePosToViewerPos(mousePos: {x: number, y: number}): {x: number, y: number} {
        let workfieldPos = {x: 0, y: 0};

        // current scroll position of the workfield
        let scrollPos = {
            x: viewer.scrollLeft,
            y: viewer.scrollTop
        }

        workfieldPos.x = mousePos.x - viewer.getBoundingClientRect().x;
        workfieldPos.y = mousePos.y - viewer.getBoundingClientRect().y;

        // add the scroll position to the position
        workfieldPos.x += scrollPos.x;
        workfieldPos.y += scrollPos.y;

        return workfieldPos;
    }

    function globalMouseMove(event){
        if (selecting) {
            // get the mouse position
            let mousePos = globalMousePosToViewerPos({x: event.clientX, y: event.clientY});

            // box is difference between start and end position
            let box = {
                x: mousePos.x - selectingStartPos.x,
                y: mousePos.y - selectingStartPos.y,
            }

            // set the position of the selection box to the point closest to 0,0
            let x = box.x < 0 ? mousePos.x : selectingStartPos.x;
            let y = box.y < 0 ? mousePos.y : selectingStartPos.y;

            // set the width and height of the selection box
            let width = Math.abs(box.x);
            let height = Math.abs(box.y);

            // set the position and size of the selection box
            selectionBox.style.left = x + "px";
            selectionBox.style.top = y + "px";

            selectionBox.style.width = width + "px";
            selectionBox.style.height = height + "px";

            // refreshSelected();

            return;
        }
    }

</script>



<div class="scene-container" bind:this={container}>

    <div class="sidebar">
        <div class="sidebar-content">
            <div class="sidebar-header">
                <h1>Scene</h1>
            </div>
            <div class="sidebar-body">
                <div class="sidebar-section">
                    <div class="sidebar-section-row">
                        <h2 class="property-name">Width:</h2>
                        <input type="number" bind:value={stageSize.width} class="value-input"/>
                    </div>
                    <div class="sidebar-section-row">
                        <h2 class="property-name">Height:</h2>
                        <input type="number" bind:value={stageSize.height} class="value-input"/>
                    </div>
                </div>

                <div class="sidebar-section">
                    <h2 class="section-header">
                        Grid
                    </h2>
                    <div class="sidebar-section-row">
                        <h2 class="property-name">Grid Size:</h2>
                        <input type="number" bind:value={gridSize} class="value-input"/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="selection-box" bind:this={selectionBox} class:visible={selecting}></div>
    <div class="currently-selected-box" bind:this={currentlySelectedBox} class:visible={selectedItems.length > 0}></div>

    <div class="scrollable-viewer" bind:this={viewer} on:mousedown={viewerMouseDown} on:mousemove={viewerMouseMove} on:mouseup={viewerMouseUp}>
        <div class="stage" style={`width: ${stageSize.width*gridSize}px; height: ${stageSize.height*gridSize}px; background-size: ${gridSize}px ${gridSize}px;`}>

        </div>
    </div>
</div>



<style>

    .value-input{
        width: 100%;
        height: 1.5rem;
        border-radius: 0.2rem;
        border: none;
        background-color: var(--background-color);
        color: var(--text-color);
        padding: 0.2rem;
        font-size: 0.8rem;
    }

    .property-name{
        font-size: 0.8rem;
        color: var(--text-color);
    }

    .sidebar-section-row{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }

    .sidebar-body{
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 100%;

        padding: 1rem;
    }

    .sidebar-section{
        width: 100%;
        margin-bottom: 1rem;

        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .sidebar-header{
        font-size: 0.8rem;
        
        display: flex;
        justify-content: center;
        align-items: center;

        color: var(--text-color);

        padding: 0.2rem;

        width: 100%;
        
        border-radius: var(--general-border-radius);
        background-color: var(--foreground-color);
    }

    .section-header{
        font-size: 1.2rem;
        color: var(--text-color);
        text-align: center;
    }

    .visible{
        display: block;
    }

    .stage{
        background-color: var(--foreground-color);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        margin: 20rem;
        pointer-events: none;
    }

    .sidebar{
        width: 15rem;
        height: 94%;
        background-color: var(--midground-color);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        position: absolute;

        left: 2%;
        top: 3%;

        z-index: 1000;

        border-radius: var(--general-border-radius);


    }

    .currently-selected-box{
        display: none;
        position: absolute;
        top: 0;
        left: 0;

        width: 0;
        height: 0;

        border-radius: var(--general-border-radius);
        border: 1px solid var(--text-color);
        background-color: rgba(199, 199, 255, 0.3);

        pointer-events: none;

        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .selection-box{
        display: none;
        position: absolute;
        top: 0;
        left: 0;

        width: 0;
        height: 0;

        border-radius: var(--general-border-radius);
        border: 1px solid var(--text-color);
        background-color: rgba(140, 140, 255, 0.3);

        pointer-events: none;

        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .scene-container{
        width: 100%;
        height: 100%;

        pointer-events: all;
        position: relative;
    }

    .scrollable-viewer{
        width: 100%;
        height: 100%;
        
        overflow: scroll;

        background-color: var(--midground-color);

        position: relative;
    }



    @media (prefers-color-scheme: dark){
        .stage{
            background-image: url("/grid-dark.svg");
        }
    }
    @media (prefers-color-scheme: light){
        .stage{
            background-image: url("/grid-light.svg");
        }
    }
</style>