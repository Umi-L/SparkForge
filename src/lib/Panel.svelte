<script lang="ts">
    import { get_current_component } from "svelte/internal";
    import { register_panel } from "../WindowManager";
    import { onMount } from "svelte";
    import type Panel from "./Panel.svelte";

    // export let rowstyle:string;
    // export let colstyle:string;
    export let name:string;

    let myself = get_current_component() as Panel;

    let panelHeader:HTMLDivElement;
    
    let panelContainer:HTMLDivElement;
    let dragging = false;

    export let size = {width: 0, height: 0};
    export let position = {x: 0, y: 0};
    

    onMount(() => {
        // add panel to the panels array
        register_panel(myself)

        // set style of the panel
        // panelContainer.style.gridColumn = colstyle;
        // panelContainer.style.gridRow = rowstyle;

        // update the transform of the panel
        updateTransform();

        // add event listeners
        window.addEventListener("mousemove", onGlobalMouseMove);
        window.addEventListener("mouseup", globalMouseUp);

        // add event listeners to the panel's header
        panelHeader.addEventListener("mousedown", onHandleMouseDown);
    });

    function onGlobalMouseMove(event){
        if (!dragging)
            return

        updateDragging(event.clientX, event.clientY)
    }

    function onHandleMouseDown(event){
        dragging = true;

        // update the dragging
        updateDragging(event.clientX, event.clientY);
    }

    function globalMouseUp(){
        dragging = false;
    }

    // function that determines the position of the panel in the grid based on the other elements the same column
    export function updateTransform(){

        // set top and left to position
        panelContainer.style.left = position.x + "px";
        panelContainer.style.top = position.y + "px";

        // set width and height to size
        panelContainer.style.width = size.width + "px";
        panelContainer.style.height = size.height + "px";
    }

    function updateDragging(mouseX, mouseY){        

        // move the panel centre to the mouse position
        panelContainer.style.left = mouseX + "px";
        panelContainer.style.top = mouseY + "px";
    }

    // getters
    export function getName(){
        return name;
    }

    export function getPosition(){
        return position;
    }

    export function getSize(){
        return size;
    }

    // setters
    export function setPosition(x, y){
        position.x = x;
        position.y = y;

        updateTransform();
    }

    export function setSize(width, height){
        size.width = width;
        size.height = height;

        updateTransform();
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

        position: absolute;

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