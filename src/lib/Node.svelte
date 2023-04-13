<script lang="ts">
    import { onMount } from "svelte";
    import type { NodeType, Point } from "../Types";
    import Node from "./Node.svelte";


    //set up props
    export let shape: string;
    export let inputPoints: Array<Point>;
    export let outputPoints: Array<Point>;
    export let factory: boolean = false;
    export let dragging = false;
    export let justCreatedByFactory = false;

    let scale = 1;

    let nodeBody: HTMLDivElement;


    function globalOnMouseUp(event){
        if (dragging) {

            // get all elements the mouse is over
            let elements = document.elementsFromPoint(event.clientX, event.clientY);

            elements.forEach(element => {
                if (element.classList.contains("workfield")){
                    // if the mouse is over the workfield, add the node to the workfield
                    element.appendChild(nodeBody);
                }
            });



            dragging = false;

            event.preventDefault();
        }
    }

    function nodeBodyMouseDown(event){

        if (factory){

            // create a duplicate of the node
            let newNode = new Node({
                target: document.body,
                props: {
                    shape: shape,
                    inputPoints: inputPoints,
                    outputPoints: outputPoints,
                    factory: false,
                    dragging: true,
                    justCreatedByFactory: true
                }
            })
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

        /* show grabbable */
        cursor: grab;

        outline: 1px solid black;

        /* take up as little width as possible */
        width: fit-content;

        max-height: 65px;
    }

    .node-body :global(img) {
        /* fill parent */
        width: 100%;
        height: 100%;

        max-height: 65px;

        /* keep aspect ratio */
        object-fit: contain;
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
        opacity: 0.8;

        /* repeat wigle animation */
        animation: wiggle 0.2s infinite;
    }

    /* wiggleing keyframes */
    @keyframes wiggle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(2deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-2deg); }
        100% { transform: rotate(0deg); }
    }

</style>