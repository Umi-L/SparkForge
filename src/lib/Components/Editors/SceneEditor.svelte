<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import { FileTypes, FS, type FSDirectory, type FSFile } from "../../../FileSystem";
    import { registerElement } from "../../../main";
    import { get_current_component } from "svelte/internal";
    import ObjectDisplay from "./SceneEditorComponents/ObjectDisplay.svelte";
    import { createToast } from "../../../ToastManager";
    import { ToastPosition, ToastType, type ISceneObject, type SceneFileContent } from "../../../Types";
  import { getContainingBoxOfBoxes, type Rect } from "../../../Utils";
  import { writable, type Writable } from "svelte/store";

    
    let myself = get_current_component();
    
    let container: HTMLDivElement;
    let viewer: HTMLDivElement;
    let stage: HTMLDivElement;
    
    let selecting = false;
    let selectedItemsStore: Writable<Array<ObjectDisplay>> = writable([]);
    let selectedItems: Array<ObjectDisplay> = []
    let currentlySelectedBoxStyle = "";

    selectedItemsStore.subscribe(value => {
        selectedItems = value;
        generateCurrentlySelectedBoxStyle();
    })

    let dragging = false;
    let selectingStartPos = {x: 0, y: 0};
    
    let selectionBox: HTMLDivElement;
    let currentlySelectedBox: HTMLDivElement;
    
    let stageSize = {width: 25, height: 15};
    let gridSize = 35;
    
    let hasBeenFocused = false;
    
    let pulloutOpen = true;
    
    let objects: Array<ISceneObject> = [];

    let backgroundColor = "#52d9d7";
    
    export let filePath;
    
    onMount(()=>{
        registerElement(viewer, myself);
        
        window.addEventListener("mousemove", globalMouseMove);
        window.addEventListener("mouseup", globalMouseUp);
    })
    
    export function onSelect(event){
        if (!hasBeenFocused){
            hasBeenFocused = true;
            
            load();
            
            // wait for the viewer to be rendered
            requestAnimationFrame(()=>{
                // centre viewer
                viewer.scrollLeft = (viewer.scrollWidth - viewer.clientWidth) / 2;
                viewer.scrollTop = (viewer.scrollHeight - viewer.clientHeight) / 2;
            })
            
            }
        }
        
        function load(){
            let fsFile = FS.getAtPath(filePath) as FSFile;
            
            if (!fsFile) {
                createToast(`Error cannot load file ${filePath.replace("root", "")} because it does not exist`, ToastType.Error, ToastPosition.BottomRight);
                return;
            }
            
            let content = fsFile.content as SceneFileContent;

            if (!content.objects)
                return
            
            for (let object of content.objects){
                let displayObject = makeObjectDisplay(object.object, object.position, object.rotation, object.scale);
                
                objects.push({
                    object: object.object,
                    position: object.position,
                    rotation: object.rotation,
                    scale: object.scale,
                    displayObject: displayObject
                })
            }

            backgroundColor = content.backgroundColor;
        }
        
        function save(){
            let fsFile = FS.getAtPath(filePath) as FSFile;
            
            if (fsFile == null) {
                createToast(`Error cannot save file ${filePath.replace("root", "")} because it does not exist`, ToastType.Error, ToastPosition.BottomRight);
                return;
            }
            
            let content = fsFile.content as SceneFileContent;

            let objectsWithoutDisplayObjects = [];

            // remove display objects from objects
            for (let object of objects){
                objectsWithoutDisplayObjects.push({
                    object: object.object,
                    position: object.position,
                    rotation: object.rotation,
                    scale: object.scale
                })
            }
            
            content.objects = objectsWithoutDisplayObjects;
            content.backgroundColor = backgroundColor;
       
        }
        
        function viewerMouseDown(event){            
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
                    selectedItemsStore.set([]);
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
                x: stage.scrollLeft,
                y: stage.scrollTop
            }
            
            workfieldPos.x = mousePos.x - stage.getBoundingClientRect().x;
            workfieldPos.y = mousePos.y - stage.getBoundingClientRect().y;
            
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

        function globalMouseUp(event: MouseEvent){
            selecting = false;
        }
        
        function toggleSidebar(){
            pulloutOpen = !pulloutOpen;
        }
        
        export function onFileDrop(file: FSFile | FSDirectory, mousePos: {x: number, y: number}){
            // if the file is a directory ignore
            if (file.type == "directory") {
                return;
            }
            
            // if fileType is not an object ignore
            if (file.fileType != FileTypes.object){
                return;
            }
            
            // add the object to the scene at the drop position
            let localPos = globalMousePosToViewerPos(mousePos);
            
            // get file path
            let filePath = FS.getPath(file);

            // create objectDisplay
            let objectDisplay = makeObjectDisplay(filePath, localPos, 0, {width: gridSize, height: gridSize})

            let objProps = {
                object: filePath,
                position: localPos,
                rotation: 0,
                scale: {width: gridSize, height: gridSize},
                displayObject: objectDisplay,
            } as ISceneObject;

            objects.push(objProps);

            save();
        }

        function makeObjectDisplay(objectPath: string, position: {x: number, y: number}, rotation: number, scale: {width: number, height: number}){
            let objectDisplay = new ObjectDisplay({
                target: stage,
                props: {
                    objectPath: objectPath,
                    position: position,
                    rotation: rotation,
                    scale: scale,
                }
            });

            objectDisplay.$on("click", ()=>{
                selectedItemsStore.set([objectDisplay]);
            })

            return objectDisplay;
        }

        function getSelectedBounds(){
            let rects: Array<Rect> = [];

            // foreach selected item
            for (let item of selectedItems){
                // get the bounds of the item
                rects.push(item.getBounds());
            }

            // get the bounds of all the items
            let bounds = getContainingBoxOfBoxes(rects);

            // add 10px padding
            bounds.x -= 5;
            bounds.y -= 5;
            bounds.width += 10;
            bounds.height += 10;

            return bounds;
        }

        function generateCurrentlySelectedBoxStyle(){
            let bounds = getSelectedBounds();

            currentlySelectedBoxStyle = `
                left: ${bounds.x}px;
                top: ${bounds.y}px;
                width: ${bounds.width}px;
                height: ${bounds.height}px;
            `;
        }
    </script>
    
    
    
    <div class="scene-container" bind:this={container}>
        
        <div class="sidebar" class:closed={!pulloutOpen}>
            
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="sidebar-pullout" on:click={toggleSidebar}>
                <Icon icon={(pulloutOpen) ? "mdi-chevron-left" : "mdi-chevron-right"} class="icon"/>
            </div>
            
            <div class="sidebar-content">
                <div class="sidebar-header">
                    <h1>Scene</h1>
                </div>
                <div class="sidebar-body">
                    <div class="sidebar-section">
                        <div class="sidebar-section-row">
                            <h2 class="property-name">Width:</h2>
                            <input type="number" bind:value={stageSize.width} on:change={save} class="value-input"/>
                        </div>
                        <div class="sidebar-section-row">
                            <h2 class="property-name">Height:</h2>
                            <input type="number" bind:value={stageSize.height} on:change={save} class="value-input"/>
                        </div>
                        <div class="sidebar-section-row">
                            <h2 class="property-name">Background Color:</h2>
                            <input type="color" bind:value={backgroundColor} on:change={save} class="value-input"/>
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
    
        
        <div class="scrollable-viewer" bind:this={viewer} on:mousedown={viewerMouseDown} on:mousemove={viewerMouseMove} on:mouseup={viewerMouseUp}>
            <div class="stage" bind:this={stage} style={`width: ${stageSize.width*gridSize}px; height: ${stageSize.height*gridSize}px; background-size: ${gridSize}px ${gridSize}px; background-color: ${backgroundColor};`}>
                <div class="grid" style={`width: ${stageSize.width*gridSize}px; height: ${stageSize.height*gridSize}px; background-size: ${gridSize}px ${gridSize}px;`}></div>

                <div class="selection-box" bind:this={selectionBox} class:visible={selecting}></div>
                <div class="currently-selected-box" bind:this={currentlySelectedBox} style={currentlySelectedBoxStyle} class:visible={selectedItems.length > 0}>
                    <div class="top-left-handle handle"></div>
                    <div class="top-right-handle handle"></div>
                    <div class="bottom-left-handle handle"></div>
                    <div class="bottom-right-handle handle"></div>

                    <div class="left-handle handle"></div>
                    <div class="right-handle handle"></div>
                    <div class="top-handle handle"></div>
                    <div class="bottom-handle handle"></div>
                </div>
            </div>
        </div>
    </div>
    
    
    
    <style>
        
        .closed{
            transform: translate(-105%);
        }
        
        .sidebar-pullout{
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            
            width: 2rem;
            
            height: 4rem;
            
            background-color: var(--foreground-color);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            
            display: flex;
            justify-content: center;
            align-items: center;
            
            font-size: 5rem;
            
            cursor: pointer;
            
            border-top-right-radius: var(--general-border-radius);
            border-bottom-right-radius: var(--general-border-radius);
            
        }
        
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
            display: block !important;
        }
        
        .stage{
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            margin: 20rem;
            pointer-events: none;
            position: relative;
        }
        
        .handle{
            --handle-size: 0.5rem;

            position: absolute;
            width: var(--handle-size);
            height: var(--handle-size);
            background-color: var(--foreground-color);
            border-radius: 2px;
            border: 1px solid var(--text-color);
            pointer-events: all;
        }

        .top-left-handle{
            top: calc(var(--handle-size)/-2);
            left: calc(var(--handle-size)/-2);
            cursor: nwse-resize;
        }

        .top-right-handle{
            top: calc(var(--handle-size)/-2);
            right: calc(var(--handle-size)/-2);
            cursor: nesw-resize;
        }

        .bottom-left-handle{
            bottom: calc(var(--handle-size)/-2);
            left: calc(var(--handle-size)/-2);
            cursor: nesw-resize;
        }

        .bottom-right-handle{
            bottom: calc(var(--handle-size)/-2);
            right: calc(var(--handle-size)/-2);
            cursor: nwse-resize;
        }

        .left-handle{
            top: 50%;
            left: calc(var(--handle-size)/-2);
            transform: translateY(-50%);
            cursor: ew-resize;
        }

        .right-handle{
            top: 50%;
            right: calc(var(--handle-size)/-2);
            transform: translateY(-50%);
            cursor: ew-resize;
        }

        .top-handle{
            top: calc(var(--handle-size)/-2);
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
        }

        .bottom-handle{
            bottom: calc(var(--handle-size)/-2);
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
        }

        .sidebar{
            width: 15rem;
            height: 90%;
            background-color: var(--midground-color);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            
            position: absolute;
            
            left: 1%;
            top: 3%;
            
            z-index: 1;
            
            border-radius: var(--general-border-radius);
            
            transition: transform 0.2s ease-in-out;
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

        .grid{
            opacity: 0.5;
        }

        .top-handle{
            
        }
        
        
        
        @media (prefers-color-scheme: dark){
            .grid{
                background-image: url("/grid-dark.svg");
            }
        }
        @media (prefers-color-scheme: light){
            .grid{
                background-image: url("/grid-light.svg");
            }
        }
    </style>