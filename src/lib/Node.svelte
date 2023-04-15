<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import type { NodeType, Point } from "../Types";
    import Node from "./Node.svelte";

    //set up props
    export let shape: string;
    export let inputPoints: Array<Point>;
    export let outputPoints: Array<Point>;
    export let factory: boolean = false;
    export let dragging = false;

    const dispatch = createEventDispatcher();

    export let position: {x: number, y: number} = {x: 0, y: 0};

    let scale = 1;

    let nodeBody: HTMLDivElement = null;

    export function getRoot(): HTMLDivElement {
        return nodeBody;
    }

    function globalMousePosToWorkfieldPos(workfield: Element, mousePos: {x: number, y: number}): {x: number, y: number} {
        let workfieldPos = {x: 0, y: 0};

        // current scroll position of the workfield
        let scrollPos = {
            x: workfield.scrollLeft,
            y: workfield.scrollTop
        }

        workfieldPos.x = mousePos.x - workfield.getBoundingClientRect().x;
        workfieldPos.y = mousePos.y - workfield.getBoundingClientRect().y;

        // add the scroll position to the position
        workfieldPos.x += scrollPos.x;
        workfieldPos.y += scrollPos.y;

        return workfieldPos;
    }

    function globalOnMouseUp(event){
        if (dragging) {

            // get all elements the mouse is over
            let elements = document.elementsFromPoint(event.clientX, event.clientY);

            let wasUsed = false;

            elements.forEach(element => {
                if (element.classList.contains("workfield")){
                    // if the mouse is over the workfield, add the node to the workfield
                    element.appendChild(nodeBody);

                    // get reference to the workspace component
                    let workspace = element.parentElement;

                    // get the centre of the node
                    let boundingBox = nodeBody.getBoundingClientRect();

                    let nodeCentre = {
                        x: boundingBox.width / 2,
                        y: boundingBox.height / 2
                    }

                    // call the globalMousePosToWorkfieldPos function on the workspace component
                    let pos = globalMousePosToWorkfieldPos(element, {x: event.clientX - nodeCentre.x, y: event.clientY - nodeCentre.y});

                    console.log(pos);

                    // set the node position to the position returned by the function
                    nodeBody.style.left = pos.x + "px";
                    nodeBody.style.top = pos.y + "px";

                    wasUsed = true;
                }
            });

            if (!wasUsed){
                // if the mouse is not over the workfield, remove the node
                nodeBody.remove();
            }



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
                }
            })

            // set new node position to factory position
            let boundingBox = nodeBody.getBoundingClientRect();

            newNode.$set({
                position: {
                    x: boundingBox.left,
                    y: boundingBox.top
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

        // set initial position
        nodeBody.style.left = position.x + "px";
        nodeBody.style.top = position.y + "px";
    })

    function onImageLoad(){
        console.log("image loaded")

        dispatch('reposition');
    }
</script>




<!-- draw the svg -->
<div class="node-body" bind:this={nodeBody} class:dragging={dragging}>
    <!-- draw the shape -->
    <img class="node-image" src="/shapes/{shape}.svg" alt={shape} on:load={onImageLoad}>

    <!-- for each input attachment point -->
    {#each inputPoints as point}
        <!-- draw a circle -->
        <div class="io-point input-point" style="left: {point.x*100}%; top: {point.y*100}%;"></div>
    {/each}

    <!-- for each output attachment point -->
    {#each outputPoints as point}
        <!-- draw a circle -->
        <div class="io-point output-point" style="left: {point.x*100}%; top: {point.y*100}%;"></div>
    {/each}
</div>



<style>

    .node-body {
        position: absolute;

        /* show grabbable */
        cursor: grab;

        /* outline: 1px solid black; */

        /* take up as little width as possible */
        /* width: fit-content; */

        max-height: 65px;
    }

    .node-body :global(img) {
        /* fill parent */
        /* width: 100%; */
        height: 100%;

        max-height: 65px;

        /* keep aspect ratio */
        object-fit: contain;
    }

    .io-point{
        position: absolute;

        width: 15px;
        height: 15px;
        border-radius: 50%;

        transform: translate(-50%, -50%);

        border: 1px solid var(--midground-color);

        transition-duration: 0.1s;
    }

    .input-point {
        background-color: var(--aquamarine);
    }

    .output-point{
        background-color: var(--pale-dogwood);
    }

    .io-point:hover{
        cursor: pointer;

        width: 25px;
        height: 25px;
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