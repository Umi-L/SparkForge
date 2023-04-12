<script lang="ts">
    import { onMount } from "svelte";
    import type { NodeType, Point } from "../Types";

  

    //set up props
    export let shape: string;
    export let inputPoints: Array<Point>;
    export let outputPoints: Array<Point>;
    export let factory: boolean = false;

    let dragging = false;

    let nodeBody: HTMLDivElement;

    function globalOnMouseUp(event){
        if (dragging) {
            dragging = false;

            event.preventDefault();
        }
    }

    function nodeBodyMouseDown(event){

        if (factory){
            // create clone of node
            let clone = nodeBody.cloneNode(true) as HTMLDivElement;
        }else{
            dragging = true;
        }

        event.preventDefault();
    }

    function globalMouseMove(event){
        if (dragging) {
            // get centre of node using bounding box
            let boundingBox = nodeBody.getBoundingClientRect();

            let centre = {
                x: boundingBox.left + (boundingBox.width / 2),
                y: boundingBox.top + (boundingBox.height / 2)
            }

            // get mouse position
            let mouse = {
                x: event.clientX,
                y: event.clientY
            }

            // get difference between mouse and centre
            let diff = {
                x: mouse.x - centre.x,
                y: mouse.y - centre.y
            }

            // move node
            nodeBody.style.left = (nodeBody.offsetLeft + diff.x) + "px";
            nodeBody.style.top = (nodeBody.offsetTop + diff.y) + "px";



            event.preventDefault();
        }
    }

    onMount(()=>{
        // add event listeners to the node
        nodeBody.addEventListener("mousedown", nodeBodyMouseDown);
        window.addEventListener("mouseup", globalOnMouseUp);
        window.addEventListener("mousemove", globalMouseMove);
    })
</script>




<!-- draw the svg -->
<div class="node-body" bind:this={nodeBody} class:dragging={dragging} >
    <!-- draw the shape -->
    {@html `<img class="node-image" src="/shapes/${shape + ".svg"}"></img>`}

    <!-- for each input attachment point -->
    {#each inputPoints as point}
        <!-- draw a circle -->
        <div class="input-point io-point" style="left: {point.x*100}%; top: {point.y*100}%;"></div>
    {/each}

    <!-- for each output attachment point -->
    {#each outputPoints as point}
        <!-- draw a circle -->
        <div class="output-point io-point" style="left: {point.x*100}%; top: {point.y*100}%;"></div>
    {/each}
</div>



<style>

    .node-body {
        position: relative;
        width: 100%;
        height: 100%;

        /* show grabbable */
        cursor: grab;

        outline: 1px solid black;
    }

    .node-body :global(img) {
        width: 100%;
        height: 100%;
    }

    .io-point{
        position: absolute;

        width: 10px;
        height: 10px;
        border-radius: 50%;

        transform: translate(-50%, -50%);

        transition-duration: 0.1s;
    }

    .input-point {
        background-color: green;
    }

    .output-point{
        background-color: red;
    }

    .io-point:hover{
        cursor: pointer;

        width: 20px;
        height: 20px;

        border: 1px solid white;
    }

    .dragging{
        cursor: grabbing;
    }

</style>