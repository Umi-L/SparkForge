<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import type { IOPoint, NodeType, Point } from "../Types";
    import Node from "./Node.svelte";
    import { getElementFromDomElement } from "../main";
    import type Workspace from "./Components/Workspace.svelte";
    import { get_current_component } from "svelte/internal";
    import { genUUID } from "../uuid";

    let myself = get_current_component() as Node;

    //set up props
    export let shape: string;
    export let inputs: Array<IOPoint>;
    export let outputs: Array<IOPoint>;
    export let factory: boolean = false;
    export let dragging = false;

    export let uuid: number = genUUID();

    let inWorkspace = false;

    const dispatch = createEventDispatcher();

    export let position: {x: number, y: number} = {x: 0, y: 0};

    let nodeBody: HTMLDivElement = null;

    export function getRoot(): HTMLDivElement {
        return nodeBody;
    }

    export function setPosition(x: number, y: number){
        position = {x: x, y: y};
        nodeBody.style.left = x + "px";
        nodeBody.style.top = y + "px";
    }

    export function getPosition(): {x: number, y: number} {
        return position;
    }

    function globalOnMouseUp(event){
        if (dragging) {

            // get all elements the mouse is over
            let elements = document.elementsFromPoint(event.clientX, event.clientY);

            let wasUsed = false;

            elements.forEach(element => {
                if (element.classList.contains("workfield")){

                    // get the workspace; kinda hacky but it works.
                    let workspace = getElementFromDomElement(element) as Workspace;

                    // if the node is already in the workspace don't bother re-registering.
                    if (!inWorkspace){
                        workspace.addNode(myself, event.clientX, event.clientY);
                        inWorkspace = true;  
                    }                

                    wasUsed = true;
                }
            });

            if (!wasUsed){
                // if the mouse is not over the workfield, remove the node
                nodeBody.remove();
            }



            dragging = false;

            dispatch("dragend", {uuid: uuid, x: position.x, y: position.y, destroyed: !wasUsed});

            event.preventDefault();
        }
    }

    function nodeBodyMouseDown(event){

        // if not left click, return
        if (event.button != 0)
            return

        if (factory){

            // create a duplicate of the node
            let newNode = new Node({
                target: document.body,
                props: {
                    shape: shape,
                    inputs: inputs,
                    outputs: outputs,
                    factory: false,
                    dragging: true,
                }
            })

            // get bounding box of the node
            let boundingBox = nodeBody.getBoundingClientRect();

            // set new node position to factory position
            newNode.setPosition(event.clientX - (boundingBox.width / 2), event.clientY - (boundingBox.height / 2));

        }
        else if (event.target.classList.contains("node-image")){
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

            // dispatch event
            dispatch("drag", {uuid: uuid, x: nodeBody.offsetLeft, y: nodeBody.offsetTop});
        
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

    export function getOutputOffset(index: number){
        let boundingBox = nodeBody.getBoundingClientRect();

        let outputPoint = outputs[index];

        let styleLeft = nodeBody.style.left;
        let styleTop = nodeBody.style.top;

        styleLeft = styleLeft.replace("px", "");
        styleTop = styleTop.replace("px", "");

        // cast to float
        let left = parseFloat(styleLeft);
        let top = parseFloat(styleTop);

        let x = left + (boundingBox.width * outputPoint.x);
        let y = top + (boundingBox.height * outputPoint.y);

        return {x: x, y: y};
    }

    export function getInputOffset(index: number){
        let boundingBox = nodeBody.getBoundingClientRect();

        let inputPoint = inputs[index];

        let styleLeft = nodeBody.style.left;
        let styleTop = nodeBody.style.top;

        styleLeft = styleLeft.replace("px", "");
        styleTop = styleTop.replace("px", "");

        // cast to float
        let left = parseFloat(styleLeft);
        let top = parseFloat(styleTop);

        let x = left + (boundingBox.width * inputPoint.x);
        let y = top + (boundingBox.height * inputPoint.y);

        return {x: x, y: y};
    }

    function onInputNodeMouseDown(event, index){
        console.log("input node mouse down", index);

        dispatch('inputNodeMouseDown', index);
    }

    function onOutputNodeMouseDown(event, index){
        console.log("output node mouse down", index);

        dispatch('outputNodeMouseDown', index);
    }



    function onInputNodeMouseUp(event, index){
        console.log("input node released on top of", index);

        dispatch('inputNodeMouseUp', index);
    }

    function onOutputNodeMouseUp(event, index){
        console.log("output node released on top of", index);

        dispatch('outputNodeMouseUp', index);
    }
</script>




<!-- draw the svg -->
<div class="node-body" bind:this={nodeBody} class:dragging={dragging}>
    <!-- draw the shape -->
    <div class="input-points">
        <!-- for each input attachment point -->
        {#each inputs as point, i}
            <!-- draw a circle -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:mousedown={(e)=>{onInputNodeMouseDown(e, i)}} on:mouseup={(e)=>{onInputNodeMouseUp(e, i)}} class="io-point input-point" style="left: {point.x*100}%; top: {point.y*100}%;"></div>
        {/each}
    </div>

    <div class="output-points">
        <!-- for each output attachment point -->
        {#each outputs as point, i}
            <!-- draw a circle -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:mousedown={(e)=>{onOutputNodeMouseDown(e, i)}} on:mouseup={(e)=>{onOutputNodeMouseUp(e, i)}} class="io-point output-point" style="left: {point.x*100}%; top: {point.y*100}%;"></div>
        {/each}
    </div>
</div>



<style>

    .node-body {
        position: absolute;

        /* show grabbable */
        cursor: grab;

        /* outline: 1px solid black; */

        /* take up as little width as possible */
        /* width: fit-content; */

        background-color: var(--foreground-color);

        min-width: 4em;
        min-height: 4em;
    }

    .io-point{
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

    .input-points{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;

        position: absolute;
        left: 0%;
        top: 0%;
    }

    .output-points{

        display: flex;
        flex-direction: column;
        align-items: center;

        justify-content: space-between;
        height: 100%;

        position: absolute;
        right: 0%;
        top: 0%;
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