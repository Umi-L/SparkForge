<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions, registerElement } from "../../main";
    import { onMount } from "svelte";
    import { get_current_component, stop_immediate_propagation } from "svelte/internal";
    import type Node from "../Node.svelte";
    import { ToastType, type Point, ToastPosition, FlowDataType, NodeTypes, type NodeData } from "../../Types";
    import { AST, ASTNode, Connection } from "../../AbstractSyntaxTree";
    import { createToast } from "../../ToastManager";


    interface Connection {

        from: {
            node: Node,
            outputNumber: number
        },

        to: {
            node: Node,
            inputNumber: number
        },
        
        element: SVGPathElement
    }

    const svgns = "http://www.w3.org/2000/svg";

    let myself = get_current_component();

    let panelExtender:HTMLDivElement;
    let workfield:HTMLDivElement;
    let connectionsSvg:SVGSVGElement;

    let nodes = [];
    let connections: Array<Connection> = [];

    let currentDraggingNode:Node|undefined;
    let currentDraggingInputNumber:number|undefined;
    let currentDraggingOutputNumber:number|undefined;
    let dragging = false;
    let currentViewPos = {x: 0, y: 0};

    const panelExtenderDistance = 200;

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


        // register for the node's i/o mousedown event
        node.$on("inputNodeMouseDown", (event) => {
            // console.log("started dragging input");
            // console.log(event);

            currentDraggingNode = node;
            currentDraggingInputNumber = event.detail;
        });

        node.$on("outputNodeMouseDown", (event) => {
            // console.log("started dragging output");
            // console.log(event);

            currentDraggingNode = node;
            currentDraggingOutputNumber = event.detail;
        });

        // register for the node's i/o mouseup event
        node.$on("inputNodeMouseUp", (event) => {
            // console.log("stopped dragging on input");
            // console.log(event);

            // if the current dragging nodeNumber is not undefined
            if (currentDraggingNode != undefined) {

                // console.log("current dragging node is not undefined");

                // if the current dragging node is not the same as the node that the input was dragged on
                if (currentDraggingNode != node) {

                    // console.log("current dragging node is not the same as the node that the input was dragged on");

                    // if the current dragging outputNumber is not undefined
                    if (currentDraggingOutputNumber != undefined) {

                        // console.log("current dragging outputNumber is not undefined");

                        let inputIndex = event.detail;

                        // get the node types for the input and output
                        let inputPoint = node.getIOPoint(false, inputIndex);
                        let outputPoint = currentDraggingNode.getIOPoint(true, currentDraggingOutputNumber);

                        // if the types are the same
                        if (inputPoint.type == outputPoint.type || inputPoint.type == FlowDataType.Any || outputPoint.type == FlowDataType.Any) {

                            // console.log("types are the same");

                            // create a connection
                            createConnection(currentDraggingNode, currentDraggingOutputNumber, node, event.detail);
                        } else {
                            // console.log("types are not the same");

                            // create a toast
                            createToast("Types are not the same", ToastType.Error, ToastPosition.TopRight);
                        }
                    }
                }
            }
        });

        node.$on("outputNodeMouseUp", (event) => {
            // console.log("stopped dragging on output");
            // console.log(event);

            // if the current dragging nodeNumber is not undefined
            if (currentDraggingNode != undefined) {

                // console.log("current dragging node is not undefined");

                // if the current dragging node is not the same as the node that the input was dragged on
                if (currentDraggingNode != node) {

                    // console.log("current dragging node is not the same as the node that the input was dragged on");

                    // if the current dragging inputNumber is not undefined
                    if (currentDraggingInputNumber != undefined) {

                        // console.log("current dragging inputNumber is not undefined");

                        let outputIndex = event.detail;

                        // get the node types for the input and output
                        let inputPoint = currentDraggingNode.getIOPoint(false, currentDraggingInputNumber);
                        let outputPoint = node.getIOPoint(true, outputIndex);

                        console.log(inputPoint);
                        console.log(outputPoint);

                        // if the types are the same
                        if (inputPoint.type == outputPoint.type || inputPoint.type == FlowDataType.Any || outputPoint.type == FlowDataType.Any) {

                            // console.log("types are the same");

                            // create a connection
                            createConnection(node, event.detail, currentDraggingNode, currentDraggingInputNumber);
                        } else {
                            // console.log("types are not the same");

                            // create a toast
                            createToast("Types are not the same", ToastType.Error, ToastPosition.TopRight);
                        }
                    }
                }
            }
        });

        // dragend event
        node.$on("dragend", (event) => {

            // if the node was destroyed
            if (event.detail.destroyed) {

                // remove the node from the nodes array
                nodes.splice(nodes.indexOf(node), 1);

                let toRemove = []

                // remove all connections that are connected to this node
                for (let connection of connections) {

                    if (connection.from.node == node || connection.to.node == node) {

                        toRemove.push(connection);
                    }
                }

                // kinda hacky solution... not sure why it doesn't work without this
                for (let connection of toRemove) {

                    removeConnection(connection);
                }

            }
        });

        // move event
        node.$on("drag", (event) => {
            // move all connections that are connected to this node
            for (let connection of connections) {
                if (connection.to.node == node) {
                    // move the curve
                    moveBezierCurve(connection.element, connection.from.node, connection.from.outputNumber, node, connection.to.inputNumber);
                } else if (connection.from.node == node) {
                    // move the curve
                    moveBezierCurve(connection.element, node, connection.from.outputNumber, connection.to.node, connection.to.inputNumber);
                }
            }
        });

        // update positions
        update();
    }

    function removeConnection(connection:Connection) {
        // remove the connection from the connections array
        connections.splice(connections.indexOf(connection), 1);

        // remove the connection from the workfield
        connectionsSvg.removeChild(connection.element);
    }

    function moveBezierCurve(element: SVGPathElement, startNode:Node, startOutputNumber:number, endNode:Node, endInputNumber:number) {

        // create a bezier curve
        let curve = createBezierCurveBetweenNodes(startNode, startOutputNumber, endNode, endInputNumber);

        // set the path of the element to the path of the curve
        element.setAttribute("d", curve.getAttribute("d"));
    }

    function createConnection(startNode:Node, startOutputNumber:number, endNode:Node, endInputNumber:number) {

        // if the connection already exists, return
        for (let connection of connections) {
            if (connection.to.node == endNode && connection.to.inputNumber == endInputNumber && connection.from.node == startNode && connection.from.outputNumber == startOutputNumber) {
                createToast("Connection already exists", ToastType.Error, ToastPosition.BottomRight, 3000);
                return;
            }
        }

        console.log("creating connection with params: " + startNode + ", " + startOutputNumber + ", " + endNode + ", " + endInputNumber + "");

        // create a bezier curve
        let curve = createBezierCurveBetweenNodes(startNode, startOutputNumber, endNode, endInputNumber);

        // add the curve to the svg
        connectionsSvg.appendChild(curve);

        // create a connection object
        let connection:Connection = {
            from: {
                node: startNode,
                outputNumber: startOutputNumber,
            },
            to: {
                node: endNode,
                inputNumber: endInputNumber,
            },

            element: curve,
        }
        
        // add the connection to the connections array
        connections.push(connection);
    }

    function drawLineToMouse(node:Node, isOutput:boolean, index:number, mouseX:number, mouseY:number){

        // delete previous line
        removeMouseLine()

        // get the mouse position
        let mousePos = globalMousePosToWorkfieldPos({x: mouseX, y: mouseY});

        // get the offset of the input/output
        let pos = node.getIOPointPosition(isOutput, index);

        // get the position of the input/output

        // draw a line from the input/output to the mouse
        let line = createBezierCurve(pos, mousePos);

        line.id = "mouseLine";
        
        // add the line to the svg
        connectionsSvg.appendChild(line);
    }

    function removeMouseLine(){
        let previousLine = document.getElementById("mouseLine");
        if (previousLine != null) {
            previousLine.remove();
        }
    }

    // create bezier curve
    function createBezierCurve(startPos:Point, endPos:Point){
        // make the bezier path
        let path = document.createElementNS(svgns, "path");

        // get difference between start and end position
        let diff = {
            x: endPos.x - startPos.x,
            y: endPos.y - startPos.y,
        }

        // generate start control point
        let startControlPoint = {
            x: startPos.x + diff.x,
            y: startPos.y,
        }

        // generate end control point
        let endControlPoint = {
            x: endPos.x - diff.x,
            y: endPos.y,
        }

        // set the path's d attribute
        path.setAttribute("d", "M" + startPos.x + "," + startPos.y + " C" + startControlPoint.x + "," + startControlPoint.y + " " + endControlPoint.x + "," + endControlPoint.y + " " + endPos.x + "," + endPos.y);

        // set the path's style
        path.classList.add("connection")

        return path;
    }

    // create bezier curve between two nodes
    function createBezierCurveBetweenNodes(startNode:Node, startOutputNumber:number, endNode:Node, endInputNumber:number): SVGPathElement {

        // get the start and end positions of the curve
        let startPos = startNode.getIOPointPosition(true, startOutputNumber);
        let endPos = endNode.getIOPointPosition(false, endInputNumber);

        // // draw point at start position
        // let startCircle = document.createElementNS(svgns, "circle");
        // startCircle.setAttribute("cx", startPos.x + "");
        // startCircle.setAttribute("cy", startPos.y + "");
        // startCircle.setAttribute("r", "5");
        // startCircle.setAttribute("fill", "blue");
        // startCircle.setAttribute("stroke", "black");

        // // draw point at end position
        // let endCircle = document.createElementNS(svgns, "circle");
        // endCircle.setAttribute("cx", endPos.x + "");
        // endCircle.setAttribute("cy", endPos.y + "");
        // endCircle.setAttribute("r", "5");
        // endCircle.setAttribute("fill", "blue");
        // endCircle.setAttribute("stroke", "black");

        // add the points to the svg
        // connectionsSvg.appendChild(startCircle);
        // connectionsSvg.appendChild(endCircle);

        let curve = createBezierCurve(startPos, endPos);

        return curve;
    }


    function update() {

        let elementsBox = getElementsBox();

        panelExtender.style.top = elementsBox.height + (panelExtenderDistance*2) + "px";
        panelExtender.style.left = elementsBox.width + (panelExtenderDistance*2) + "px";

        // set width and height of the connections svg
        connectionsSvg.setAttribute("width", elementsBox.width + (panelExtenderDistance*2) + "px");
        connectionsSvg.setAttribute("height", elementsBox.height + (panelExtenderDistance*2) + "px");

    }

    function globalOnMouseUp(event) {
        if (dragging) {
            dragging = false;

            event.preventDefault();
        }

        if (currentDraggingNode != undefined) {
            currentDraggingNode = undefined;
            currentDraggingInputNumber = undefined;
            currentDraggingOutputNumber = undefined;

            removeMouseLine();
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

        if (currentDraggingNode != undefined) {

            let isOutput = currentDraggingOutputNumber != undefined;

            let index = isOutput ? currentDraggingOutputNumber : currentDraggingInputNumber;

            drawLineToMouse(currentDraggingNode, isOutput, index, event.clientX, event.clientY);
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

            // if the element is the panel extender then skip it
            if (element == panelExtender)
                continue;
            
            // if the element is the connections svg then skip it
            if (element == connectionsSvg as Element)
                continue;

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

        return elementsBox;
    }

    function workspaceToASTs(){
        // get every start node by itterating over every node
        let startNodes: Array<Node> = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            if (node.type == NodeTypes.Start) {
                startNodes.push(node);
            }
        }

        // convert every start node to an AST
        let asts = [];

        for (let i = 0; i < startNodes.length; i++) {
            let startNode = startNodes[i];

            let nodeData = startNode.type as NodeData;
            
            let astNode = new ASTNode(nodeData, []);

            let ast = new AST(astNode);

            // traverse the tree and add every node to the ast
            traverseTree(startNode, astNode, ast);

            asts.push(ast);
        }
    }

    function traverseTree(startElement: Node, astNode: ASTNode, ast: AST) {
        // get the output nodes of the start element
        let connections = getConnections(startElement);

        // for every output node
        for (let i = 0; i < connections.length; i++) {
            let connection = connections[i];

            // get the connections

            // traverse the tree
            // traverseTree(, , ast);
        }
    }

    function getConnections(node: Node): Array<Node> {
        let connections: Array<Node> = [];

        // get every connection coming out of the node
        connections.forEach(connection => {
            if (connection.from.node == node) {
                connections.push(connection);
            }
        });

        return connections;
    }
</script>



<Panel name="Workspace">
    <div class="workfield" bind:this={workfield}>
        <svg class="connections" bind:this={connectionsSvg}>
            <!-- <line x1="0" y1="80" x2="100" y2="20" stroke="black" /> -->
        </svg>
        <div class="extender" bind:this={panelExtender}></div>
    </div>
</Panel>



<style>
    .workfield {
        width: 100%;
        height: 100%;
        
        background-size: 30px 30px;
        overflow: scroll;

        background-color: var(--midground-color);

        position: relative;
    }

    @media (prefers-color-scheme: dark){
        .workfield{
            background-image: url("/dot-dark.svg");
        }
    }
    @media (prefers-color-scheme: light){
        .workfield{
            background-image: url("/dot-light.svg");
        }
    }

    .extender{
        position: absolute;

        width:1px;
        height:1px;

        background-color: transparent;
    }

    :global(.connection){
        color: var(--text-color);
        stroke: var(--text-color);
        stroke-width: 2px;
        fill: none;
    }

    .connections {
        position: absolute;
        top: 0;
        left: 0;
        
        pointer-events: none;
    }
</style>