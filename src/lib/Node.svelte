<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { NodeTypes, type IOPoint, type NodeData, type Point } from "../Types";
    import Node from "./Node.svelte";
    import { getElementFromDomElement } from "../main";
    import type Workspace from "./Components/Workspace.svelte";
    import { get_current_component } from "svelte/internal";
    import { genUUID } from "../uuid";
  import { openContextMenu, type IMenuOption } from "../ContextMenu";

    let myself = get_current_component() as Node;
    const dispatch = createEventDispatcher();

    //set up props
    export let type: NodeData = NodeTypes.Test;
    export let factory: boolean = false;
    export let dragging = false;

    let uuid: number = genUUID();
    let position: {x: number, y: number} = {x: 0, y: 0};

    let inputs = type.inputs;
    let outputs = type.outputs;
    let literals = type.literals;

    let inputElements: Array<HTMLDivElement> = [];
    let outputElements: Array<HTMLDivElement> = [];

    let nodeBody: HTMLDivElement;
    let literalInputs: Array<HTMLInputElement> = [];

    let inWorkspace = false;
    let selected = false;

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "Delete", action: destroy, avalableCheck: () => inWorkspace}, 
        {label: "Duplicate", action: ()=>{dispatch("duplicate")}, avalableCheck: () => inWorkspace},
        {label: "Peek Code", action: peekCode, avalableCheck: () => true}
    ]

    function peekCode(){
        throw Error("Unimplemented peek code");
    }


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
                destroy();
            }

            dragging = false;

            event.preventDefault();
        } 
        else{
            literalInputs.forEach(literalInput => {
                if (literalInput != event.target){
                    literalInput.blur();
                }
            });
        }
    }

    export function setInWorkspace(value: boolean){
        inWorkspace = value;
    }

    export function destroy(){
        nodeBody.remove();
        dispatch("destroy", {uuid: uuid});
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
                    type: type,
                    factory: false,
                    dragging: true,
                }
            })

            // get bounding box of the node
            let boundingBox = nodeBody.getBoundingClientRect();

            // set new node position to factory position
            newNode.setPosition(event.clientX - (boundingBox.width / 2), event.clientY - (boundingBox.height / 2));

        }
        else if (event.target.classList.contains("node-body") || event.target.classList.contains("node-header")){
            dragging = true;
        }
        else{
            // else if none of the input elements are having the mouse up
            let onLiteral = false;
            literalInputs.forEach(literalInput => {
                if (literalInput != event.target){
                    literalInput.blur();
                }
                else{
                    onLiteral = true;
                }
            });

            if (!onLiteral)
                event.preventDefault();
        }

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

            // set position
            position = {x: nodeBody.offsetLeft, y: nodeBody.offsetTop};

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
        nodeBody.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            openContextMenu(event.clientX, event.clientY, contextMenuOptions);
        });

        // set initial position
        nodeBody.style.left = position.x + "px";
        nodeBody.style.top = position.y + "px";
    })

    export function getIOPointPosition(isOutput: boolean, index){
        let styleLeft = nodeBody.style.left;
        let styleTop = nodeBody.style.top;

        styleLeft = styleLeft.replace("px", "");
        styleTop = styleTop.replace("px", "");

        // cast to float
        let left = parseFloat(styleLeft);
        let top = parseFloat(styleTop);

        // get point point
        let point = isOutput ? outputElements[index] : inputElements[index];

        let offsets = getOffset(point, nodeBody);

        // add middle of point to offset
        offsets.x += point.offsetWidth / 2;
        offsets.y += point.offsetHeight / 2;

        // console.log("offsets for node of type", isOutput ? "output" : "input", offsets)

        // get position of inputPoint relative to the node
        return {x: left + offsets.x, y: top + offsets.y};
    }

    export function getIOPoint(isOutput: boolean, index: number){
        if (isOutput){
            console.log("index", index)
            console.log("outputs", outputs)
            console.log("outputs of index", outputs[index])
            return outputs[index];
        }
        else {
            console.log("index", index)
            console.log("inputs", inputs)
            console.log("inputs of index", inputs[index])
            return inputs[index];
        }
    }

    function getOffset(element: any, finalElement: HTMLElement){
        let offset = {x: 0, y: 0};

        while (element != finalElement){

            offset.x += element.offsetLeft;
            offset.y += element.offsetTop;

            element = element.offsetParent;

        }

        return offset;
    }

    export function getLiteralValues(){
        let values = [];

        literalInputs.forEach(literalInput => {
            if (literalInput.type == "text")
                values.push(literalInput.value);
            else if (literalInput.type == "number")
                values.push(parseFloat(literalInput.value));
            else if (literalInput.type == "checkbox")
                values.push(literalInput.checked);
        });

        return values;
    }

    export function getBox(){
        let clientRect = nodeBody.getBoundingClientRect();

        return {
            x: position.x,
            y: position.y,
            width: clientRect.width,
            height: clientRect.height
        }
    }

    export function getSelected(){
        return selected;
    }

    export function setSelected(value: boolean){
        selected = value;
    }

    export function getType(){
        return type;
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

    // function that capitalises the first letter of each word
    function toTitle(string){
        let words = string.split(" ");

        let newWords = [];

        for (let word of words){
            newWords.push(word.charAt(0).toUpperCase() + word.slice(1));
        }

        return newWords.join(" ");
    }
</script>




<div class:node-body={!factory} class:node-body-factory={factory} bind:this={nodeBody} class:dragging={dragging} class:selected-body={selected}>

    <div class="node-header">
        {toTitle(type.name)}
    </div>

    <div class="node-content">

        <!-- draw the shape -->
        <div class="io-points-container input-points">

            <!-- for each literal -->
            {#each literals as literal, i}
                <div class="point-wrapper">

                    <!-- draw a circle -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <input type={literals[i].type} class="input" bind:this={literalInputs[i]}>

                    <p class="description-text">{literal.label}</p>
                </div>
            {/each}

            <!-- for each input attachment point -->
            {#each inputs as point, i}
                <div class="point-wrapper">

                    <!-- draw a circle -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div on:mousedown={(e)=>{onInputNodeMouseDown(e, i)}} on:mouseup={(e)=>{onInputNodeMouseUp(e, i)}} class="io-point" bind:this={inputElements[i]} style={"background-color: var(--" + point.type + "-color);"}></div>

                    <p class="description-text">{point.label}</p>
                </div>

            {/each}
        </div>

        <div class="io-points-container output-points">
            <!-- for each output attachment point -->
            {#each outputs as point, i}
                <div class="point-wrapper">

                    <!-- draw a circle -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <p class="description-text">{point.label}</p>

                    <div on:mousedown={(e)=>{onOutputNodeMouseDown(e, i)}} on:mouseup={(e)=>{onOutputNodeMouseUp(e, i)}} class="io-point" bind:this={outputElements[i]} style={"background-color: var(--" + point.type + "-color);"}></div>

                </div>
            {/each}
        </div>

    </div>
</div>



<style>

    .node-header{
        background-color: var(--foreground-color-2);
        width: 100%;

        font-size: 0.85em;
        padding-left: 5px;

        border-radius: var(--general-border-radius);

        color: var(--text-color);
    }

    .point-wrapper{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .description-text{
        font-size: 0.8em;
        color: var(--text-color);
    }

    .node-body {

        position: absolute;

        /* show grabbable */
        cursor: grab;

        background-color: var(--foreground-color);

        border-radius: var(--general-border-radius);

        /* box-shadow */
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);

        opacity: 0.9;
    }

    .selected-body{
        outline: 1px solid rgba(0, 0, 255, 0.5);
    }

    .node-body-factory{
        position: relative;

        /* show grabbable */
        cursor: grab;

        background-color: var(--foreground-color);

        border-radius: var(--general-border-radius);

        /* box-shadow */
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
    }

    .node-content{
        display: flex;
        flex-direction: row;
    
        justify-content: space-between;

        gap: 20px;

        pointer-events: none;

    }

    .io-point{
        width: 15px;
        height: 15px;
        border-radius: 50%;


        /* transform: translate(-50%, -50%); */

        border: 1px solid var(--midground-color);

        transition-duration: 0.1s;

        pointer-events: all;
    }

    .io-point:hover{
        cursor: pointer;

        scale: 1.7;
    }

    .dragging{
        cursor: grabbing;
        opacity: 0.8;

        /* repeat wigle animation */
        animation: wiggle 0.2s infinite;
    }

    .io-points-container{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;

        gap: 10px;

        position: relative;

        padding: 5px;

        width: fit-content;

        /* pointer-events: none; */


    }

    .input{
        max-width: 80px;
        height: 20px;

        border-radius: var(--general-border-radius);

        border: 1px solid var(--foreground-color);

        background-color: var(--midground-color);

        color: var(--text-color);

        padding: 5px;

        pointer-events: all;
    }

    .input-points{
        align-items: start;


    }

    .output-points{
        align-items: end;


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