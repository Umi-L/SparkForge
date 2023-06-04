<script lang="ts">
    import { registerElement, unregisterElement } from "../../../main";
    import { onDestroy, onMount } from "svelte";
    import { get_current_component, stop_immediate_propagation } from "svelte/internal";
    import Node from "../../Node.svelte";
    import { ToastType, type Point, ToastPosition, FlowDataType, NodeTypes, type NodeData } from "../../../Types";
    import { AST, ASTConnection, ASTNode } from "../../../AbstractSyntaxTree";
    import { createToast } from "../../../ToastManager";
    import { openContextMenu, type IMenuOption } from "../../../ContextMenu";
  import { FS, type FSFile } from "../../../MockFS";

    export let file: string;
    export const onResize = ()=>{};

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
    let selectionBox:HTMLDivElement;
    let currentlySelectedBox: HTMLDivElement;

    let nodes: Array<Node> = [];
    let connections: Array<Connection> = [];

    let currentDraggingNode:Node|undefined;
    let currentDraggingInputNumber:number|undefined;
    let currentDraggingOutputNumber:number|undefined;
    let dragging = false;
    
    let selecting = false;
    let selectingStartPos:Point = {x: 0, y: 0};
    let selectedNodes: Array<Node> = []

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "Delete", action: deleteSelectedNodes, avalableCheck: () => selectedNodes.length > 0, icon: "mdi-trash-can-outline"}, 
        {label: "Duplicate", action: duplicateSelectedNodes, avalableCheck: () => selectedNodes.length > 0, icon:"mdi-content-duplicate"}, 
        {label: "group", action: groupSelectedNodes, avalableCheck: () => selectedNodes.length > 1, icon: "mdi-group"}
    ]

    let currentViewPos = {x: 0, y: 0};

    const panelExtenderDistance = 200;

    onMount(() => {
        load();

        update();

        // add event listeners
        window.addEventListener("mouseup", globalOnMouseUp);
        window.addEventListener("mousemove", globalMouseMove)
        workfield.addEventListener("mousedown", workfieldMouseDown);
        workfield.addEventListener("mousemove", workfieldMouseMove);
        workfield.addEventListener("scroll", workfieldOnScroll);
        workfield.addEventListener("contextmenu", onContextMenu);

        // // start at 50% scroll
        // workfield.scrollLeft = workfield.scrollWidth / 2;
        // workfield.scrollTop = workfield.scrollHeight / 2;

        // register the workfield as the workspace
        registerElement(workfield, myself);

    });

    onDestroy(() => {
        // remove event listeners
        window.removeEventListener("mouseup", globalOnMouseUp);
        window.removeEventListener("mousemove", globalMouseMove)
        workfield.removeEventListener("mousedown", workfieldMouseDown);
        workfield.removeEventListener("mousemove", workfieldMouseMove);
        workfield.removeEventListener("scroll", workfieldOnScroll);
        workfield.removeEventListener("contextmenu", onContextMenu);

        // unregister the workfield as the workspace
        unregisterElement(myself);
    });

    export function addNode(node:Node, mouseX:number, mouseY:number) {

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

        registerNode(node);

        // update positions
        update();

        save();
    }

    function load(){
        let fsFile = FS.getAtPath(file) as FSFile;

        if (!fsFile.content["nodes"] || !fsFile.content["connections"])
            return;
        
        console.log("loading flowchart from file");

        let savedNodes: Array<SavedNode> = fsFile.content["nodes"];
        let savedConnections: Array<SavedConnection> = fsFile.content["connections"];

        for (let savedNode of savedNodes) {
            let node = new Node({
                target: workfield,
                props: {
                    type: savedNode.type,
                }
            });

            registerNode(node);

            node.setPosition(savedNode.pos.x, savedNode.pos.y);
        }

        for (let savedConnection of savedConnections) {
            createConnection(
                nodes[savedConnection.from.node],
                savedConnection.from.outputNumber,
                nodes[savedConnection.to.node],
                savedConnection.to.inputNumber
            );
        }

        panelExtender.style.left = fsFile.content["extenderPosition"].x;
        panelExtender.style.top = fsFile.content["extenderPosition"].y;


    
    }

    export function updateNodePosition(node: Node){
        save();
    }

    function registerNode(node:Node) {

        // add node to nodes
        nodes.push(node);

        node.setInWorkspace(true);

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

        // destroy event
        node.$on("destroy", (event) => {
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
        });

        //duplicate event
        node.$on("duplicate", (event)=>{
            duplicateNode(node);
        })

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
    }

    function removeConnection(connection:Connection) {
        // remove the connection from the connections array
        connections.splice(connections.indexOf(connection), 1);

        // remove the connection from the workfield
        connectionsSvg.removeChild(connection.element);

        save();
    }

    function moveBezierCurve(element: SVGPathElement, startNode:Node, startOutputNumber:number, endNode:Node, endInputNumber:number) {

        // create a bezier curve
        let curve = createBezierCurveBetweenNodes(startNode, startOutputNumber, endNode, endInputNumber);

        // set the path of the element to the path of the curve
        element.setAttribute("d", curve.getAttribute("d"));
    }

    function deleteSelectedNodes() {

        let toRemove = []

        // loop through all nodes
        for (let node of nodes) {

            // if the node is selected
            if (node.getSelected()) {

                // delete all node connections.
                for (let connection of connections) {

                    if (connection.from.node == node || connection.to.node == node) {

                        removeConnection(connection);
                    }
                }

                toRemove.push(node);
            }
        }

        // remove all selected nodes
        for (let node of toRemove) {
            node.destroy();
        }

        selectedNodes = []
        refreshSelected();

        save();
    }

    function duplicateSelectedNodes() {

        let duplicatedNodes = {}

        // loop through all nodes
        for (let node of nodes) {

            // if the node is selected
            if (node.getSelected()) {

                // duplicate the node
                duplicatedNodes[nodes.indexOf(node)] = duplicateNode(node);
            }
        }

        // loop through all connections
        for (let connection of connections) {

            // if the connection is connected between two selected nodes
            if (connection.from.node.getSelected() && connection.to.node.getSelected()) {

                // get the start and end nodes in the duplicated nodes array
                let startNode = duplicatedNodes[nodes.indexOf(connection.from.node)];
                let endNode = duplicatedNodes[nodes.indexOf(connection.to.node)];

                // duplicate the connection
                createConnection(startNode, connection.from.outputNumber, endNode, connection.to.inputNumber);
            }
        }

        selectedNodes = []
        refreshSelected();
    }

    function duplicateNode(node){
        // create a new node
        let newNode = new Node({target: workfield, props: {type: node.getType()}});

        console.log("duplicate node")
        
        // set the position of the new node
        newNode.setPosition(node.getPosition().x + 20, node.getPosition().y + 20);

        registerNode(newNode);

        return newNode;
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

        save();
    }

    function groupSelectedNodes(){
        selectedNodes = []
        refreshSelected();
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

    function onContextMenu(event){
        if (event.target == workfield || selectedNodes.length > 0) {
            openContextMenu(event.clientX, event.clientY, contextMenuOptions);

            event.preventDefault();
        }
    }

    function globalOnMouseUp(event) {

        // if left mouse
        if (event.button == 0) {

            if (selecting) {
                selecting = false;

                // get the end position of the selection box
                let mousePos = globalMousePosToWorkfieldPos({x: event.clientX, y: event.clientY});

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

                // get the elements in the selection box
                let elements = getNodesInBox({x: x, y: y, width: width, height: height});

                // merge arrays
                selectedNodes = selectedNodes.concat(elements);

                refreshSelected();


                event.preventDefault();
            }

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
    }

    function getNodesInBox(box){
        let nodesInBox = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            let nodeBox = node.getBox();

            if (box.x < nodeBox.x + nodeBox.width && box.x + box.width > nodeBox.x && box.y < nodeBox.y + nodeBox.height && box.y + box.height > nodeBox.y) {
                nodesInBox.push(node);
            }
            
        }

        return nodesInBox;
    }

    function workfieldMouseDown(event){
        if (event.button == 0){
            // if the mouse is not over only the workspace then don't drag
            if (event.target != workfield) {
                return;
            }

            // if shift is pressed then don't drag
            if (event.shiftKey) {
                selecting = true;

                selectingStartPos = globalMousePosToWorkfieldPos({x: event.clientX, y: event.clientY});

                // reset selection box
                selectionBox.style.width = "0px";
                selectionBox.style.height = "0px";

                selectionBox.style.left = selectingStartPos.x + "px";
                selectionBox.style.top = selectingStartPos.y + "px";

                //set start position of selection
            }
            else{
                selectedNodes = [];
                refreshSelected();
                dragging = true;
            }
        }

        event.preventDefault();
    }

    function refreshSelected(){
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            if (selectedNodes.includes(node)) {
                node.setSelected(true);
            }
            else{
                node.setSelected(false);
            }
        }

        // get the box of the selected nodes
        let box = getSelectedNodesBox();

        // set the position and size of the selection box
        currentlySelectedBox.style.left = box.x + "px";
        currentlySelectedBox.style.top = box.y + "px";
        currentlySelectedBox.style.width = box.width + "px";
        currentlySelectedBox.style.height = box.height + "px";
    }

    function getSelectedNodesBox(){
        // get the box that contains all the selected nodes
        // get this by using the point that has the lowest x and y and the point that has the highest x and y

        let box = {
            x: undefined,
            y: undefined,
            width: undefined,
            height: undefined,
        }

        for (let i = 0; i < selectedNodes.length; i++) {
            let node = selectedNodes[i];

            let nodeBox = node.getBox();

            // if any of the nodeBox points are outside the box then move the box to include them
            if (box.x == undefined || nodeBox.x < box.x) {
                box.x = nodeBox.x;
            }

            if (box.y == undefined || nodeBox.y < box.y) {
                box.y = nodeBox.y;
            }

            if (box.width == undefined || nodeBox.x + nodeBox.width > box.x + box.width) {
                box.width = nodeBox.x + nodeBox.width - box.x;
            }

            if (box.height == undefined || nodeBox.y + nodeBox.height > box.y + box.height) {
                box.height = nodeBox.y + nodeBox.height - box.y;
            }
        }

        // Compute the maximum x and y coordinates of all the node boxes
        let maxX = box.x;
        let maxY = box.y;
        for (let i = 0; i < selectedNodes.length; i++) {
            let nodeBox = selectedNodes[i].getBox();
            maxX = Math.max(maxX, nodeBox.x + nodeBox.width);
            maxY = Math.max(maxY, nodeBox.y + nodeBox.height);
        }

        // Compute the width and height of the bounding box
        box.width = maxX - box.x;
        box.height = maxY - box.y;

        // add 10px padding
        box.x -= 10;
        box.y -= 10;

        box.width += 20;
        box.height += 20;

        return box;
    }

    function globalMouseMove(event){
        if (selecting) {
            // get the mouse position
            let mousePos = globalMousePosToWorkfieldPos({x: event.clientX, y: event.clientY});

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

            refreshSelected();

            return;
        }
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

    export function workspaceToASTs(){
        // get every start node by itterating over every node
        let startNodes: Array<Node> = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            if (node.getType() == NodeTypes.Start) {
                startNodes.push(node);
            }
        }

        // convert every start node to an AST
        let asts = [];

        for (let i = 0; i < startNodes.length; i++) {
            let startNode = startNodes[i];

            let nodeData = startNode.getType() as NodeData;
            
            let astNode = new ASTNode(nodeData, [], undefined);

            let ast = new AST(astNode);

            // traverse the tree and add every node to the ast
            traverseTree(startNode, astNode, ast);

            asts.push(ast);
        }

        console.log(asts)

        return asts;
    }

    function traverseTree(startElement: Node, astNode: ASTNode, ast: AST, reverse: boolean = false) {

        // get the output nodes of the start element
        let outConnections = getOutConnections(startElement);
        let inConnections = getInConnections(startElement);

        // for every out connection
        if (!reverse){
            for (let i = 0; i < outConnections.length; i++) {
                let connection = outConnections[i];

                let node = connection.to.node;

                let nodeData = node.getType();

                let newNode = new ASTNode(nodeData, [], astNode);

                let astConnection = new ASTConnection(astNode, connection.from.outputNumber, newNode, connection.to.inputNumber);

                ast.addOutConnection(astConnection);

                traverseTree(node, newNode, ast);
            }
        }

        // for every in connection
        for (let i = 0; i < inConnections.length; i++) {

            if (astNode.parentHasOutConnection(inConnections[i].to.inputNumber)) {
                continue;
            }

            let connection = inConnections[i];

            let node = connection.from.node;

            let nodeData = node.getType();
            let literalValues = node.getLiteralValues();

            let newNode = new ASTNode(nodeData, [], astNode);
            newNode.literals = literalValues;

            let astConnection = new ASTConnection(newNode, connection.from.outputNumber, astNode, connection.to.inputNumber);

            ast.addInConnection(astConnection);

            traverseTree(node, newNode, ast, true);
        }
    }

    function getOutConnections(node: Node): Array<Connection> {
        let containing: Array<Connection> = [];

        // get every connection coming out of the node
        connections.forEach(connection => {
            // console.log(connection.from.node, node)
            if (connection.from.node == node) {
                containing.push(connection);
            }
        });

        return containing;
    }

    function getInConnections(node: Node): Array<Connection> {
        let containing: Array<Connection> = [];

        // get every connection coming out of the node
        connections.forEach(connection => {
            // console.log(connection.from.node, node)
            if (connection.to.node == node) {
                containing.push(connection);
            }
        });

        return containing;
    }

    interface SavedNode {
        type: NodeData,
        pos: {x: number, y: number},
        literals: Array<string>
    }

    interface SavedConnection {
        from: {
            node: number,
            outputNumber: number
        },
        to: {
            node: number,
            inputNumber: number
        }
    }

    function save(){
        // get position of every node
        let nodeData: Array<SavedNode> = [];
        let connectionData: Array<SavedConnection> = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            let nodePos = node.getPosition();

            let nodeDataItem = {
                type: node.getType(),
                pos: nodePos,
                literals: node.getLiteralValues()
            }

            nodeData.push(nodeDataItem);
        }

        for (let i = 0; i < connections.length; i++) {
            let connection = connections[i];

            let connectionDataItem = {
                from: {
                    node: nodes.indexOf(connection.from.node),
                    outputNumber: connection.from.outputNumber
                },
                to: {
                    node: nodes.indexOf(connection.to.node),
                    inputNumber: connection.to.inputNumber
                }
            }

            connectionData.push(connectionDataItem);
        }

        // write to file
        FS.writeData(file, {
            nodes: nodeData,
            connections: connectionData,
            extenderPosition: {x: panelExtender.style.left, y: panelExtender.style.top}
        });
    }
</script>



<div class="workfield" bind:this={workfield}>
    <div class="selection-box" bind:this={selectionBox} class:visible={selecting}></div>
    <div class="currently-selected-box" bind:this={currentlySelectedBox} class:visible={selectedNodes.length > 0}></div>
    <svg class="connections" bind:this={connectionsSvg}>
        <!-- <line x1="0" y1="80" x2="100" y2="20" stroke="black" /> -->
    </svg>
    <div class="extender" bind:this={panelExtender}></div>
</div>



<style>

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

    .visible{
        display: block;
    }

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