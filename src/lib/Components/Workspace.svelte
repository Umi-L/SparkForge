<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions, registerElement } from "../../main";
    import { onMount } from "svelte";
    import { get_current_component } from "svelte/internal";
    import type Node from "../Node.svelte";

    let myself = get_current_component();

    let panelExtender:HTMLDivElement;
    let workfield:HTMLDivElement;
    let connectionsSvg:SVGSVGElement;

    let nodes = [];
    let connections = [];

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    let dragging = false;
    let currentViewPos = {x: 0, y: 0};

    const panelExtenderDistance = 200;

    panelGridPositions.forEach(element => {
        if (element.name == "workspace") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });

    onMount(() => {
        update();

        // add event listeners
        window.addEventListener("mouseup", globalOnMouseUp);
        workfield.addEventListener("mousedown", workfieldMouseDown);
        workfield.addEventListener("mousemove", workfieldMouseMove);
        workfield.addEventListener("scroll", workfieldOnScroll);

        // // start at 50% scroll
        // workfield.scrollLeft = workfield.scrollWidth / 2;
        // workfield.scrollTop = workfield.scrollHeight / 2;

        console.log(myself)

        // register the workfield as the workspace
        registerElement(workfield, myself);
    });

    export function addNode(node:Node, mouseX:number, mouseY:number) {

        // add node to nodes
        nodes.push(node);

        let nodeBody = node.getRoot();


        console.log("adding node");
        workfield.appendChild(nodeBody);

        // get the centre of the node
        let boundingBox = nodeBody.getBoundingClientRect();

        let nodeCentre = {
            x: boundingBox.width / 2,
            y: boundingBox.height / 2
        }

        // call the globalMousePosToWorkfieldPos function on the workspace component
        let pos = globalMousePosToWorkfieldPos({x: mouseX - nodeCentre.x, y: mouseY - nodeCentre.y});

        // set the node position to the position returned by the function
        nodeBody.style.left = pos.x + "px";
        nodeBody.style.top = pos.y + "px";

        node.setPosition(pos.x, pos.y);

        update();
    }


    function update() {

        let elementsBox = getElementsBox();

        panelExtender.style.top = elementsBox.height + (panelExtenderDistance*2) + "px";
        panelExtender.style.left = elementsBox.width + (panelExtenderDistance*2) + "px";

    }

    function globalOnMouseUp(event) {
        if (dragging) {
            dragging = false;

            event.preventDefault();
        }
    }

    function workfieldMouseDown(event){

        // if the mouse is not over only the workspace then don't drag
        if (event.target != workfield) {
            return;
        }

        dragging = true;

        event.preventDefault();
    }

    function workfieldMouseMove(event){
        if (dragging) {
            // move the workfield the same amount as the mouse moved
            workfield.scrollLeft -= event.movementX;
            workfield.scrollTop -= event.movementY;
        }
    }

    function workfieldOnScroll(event) {
        // update current view position
        currentViewPos.x = workfield.scrollLeft;
        currentViewPos.y = workfield.scrollTop;

        // update background x and y but keep the direction of scroll
        workfield.style.backgroundPositionX = -currentViewPos.x + "px";
        workfield.style.backgroundPositionY = -currentViewPos.y + "px";
    }

    function globalMousePosToWorkfieldPos(mousePos: {x: number, y: number}): {x: number, y: number} {
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


    function getElementsBox(): DOMRect {
        // get the bounding box of the elements that are in the workfield but not the extender
        let elements = workfield.children;
        let elementsBox = new DOMRect(0, 0, 0, 0);

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i] as HTMLElement;

            if (element != panelExtender) {
                let elementBox = element.getBoundingClientRect();

                if (elementBox.x < elementsBox.x) {
                    elementsBox.x = elementBox.x;
                }

                if (elementBox.y < elementsBox.y) {
                    elementsBox.y = elementBox.y;
                }

                if (elementBox.x + elementBox.width > elementsBox.x + elementsBox.width) {
                    elementsBox.width = elementBox.x + elementBox.width - elementsBox.x;
                }

                if (elementBox.y + elementBox.height > elementsBox.y + elementsBox.height) {
                    elementsBox.height = elementBox.y + elementBox.height - elementsBox.y;
                }
            }
        }

        return elementsBox;
    }
</script>



<Panel name="Workspace" rowstyle={rowStyle} colstyle={colStyle}>
    <div class="workfield" bind:this={workfield}>
        <svg class="connections" bind:this={connectionsSvg}></svg>
        <div class="extender" bind:this={panelExtender}></div>
    </div>
</Panel>



<style>
    .workfield {
        width: 100%;
        height: 100%;
        background-image: url("/dotbg.png");
        background-size: 30px 30px;
        overflow: scroll;

        position: relative;
    }

    .extender{
        position: absolute;

        width:1px;
        height:1px;

        background-color: transparent;
    }
</style>