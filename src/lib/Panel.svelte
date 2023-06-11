<script lang="ts">
    import { get_current_component } from "svelte/internal";
    import { onPanelDragEnd, register_panel, onPanelDrag } from "../WindowManager";
    import { onMount } from "svelte";
    import type Panel from "./Panel.svelte";
    import Icon from '@iconify/svelte';
  import { toTitle } from "../Utils";

    // export let rowstyle:string;
    // export let colstyle:string;

    interface IDefaultTransform{
        left: number,
        top: number,
        width: number,
        height: number
    }

    export let resizeFuncs:Array<Function> = [];
    export let defaultTransform: IDefaultTransform | undefined;

    let myself = get_current_component() as Panel;

    let panelHeader:HTMLDivElement;
    let panelBody:HTMLDivElement;
    
    let panelContainer:HTMLDivElement;
    let dragging = false;
    let fullscreen = false;

    let tabComponents = [];

    export let size = {width: 0, height: 0};
    export let position = {x: 0, y: 0};
    export let relativePosition = {x: 0, y: 0};
    export let relativeSize = {width: 0, height: 0};

    interface Tab{
        name: string,
        component: any // class of the component
    }

    export let tabs: Array<Tab> = []
    let tabElements = [];

    let currentSelectedTab = 0;

    export function addTab(name:string, component:any){
        tabs.push({
            name: name,
            component: component
        })
    }

    function createTabs(){

        tabComponents = [];

        // for every tab, create a new element
        for (let i = 0; i < tabs.length; i++){
            let tab = tabs[i];

            tabComponents.push(new tab.component({target: tabElements[i]}))
        }

    }

    export function removeTab(name:string){
        for (let i = 0; i < tabs.length; i++){
            if (tabs[i].name == name){
                tabs.splice(i, 1);
                break;
            }
        }
    }

    export function getDefaultTransform(){
        return defaultTransform;
    }
    

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

        createTabs();
    });

    export function changeTabIfPossible(tab: string){
        for (let i = 0; i < tabs.length; i++){
            if (tabs[i].name == tab){
                currentSelectedTab = i;

                if (tabComponents[currentSelectedTab].onSelect)
                    tabComponents[currentSelectedTab].onSelect()

                break;
            }
        }
    }

    function onGlobalMouseMove(event){
        if (!dragging)
            return

        updateDragging(event.clientX, event.clientY)
    }

    function onHandleMouseDown(event){

        // if the target is not the header, return
        if (event.target != panelHeader)
            return

        // if not left click, return
        if (event.button != 0)
            return

        dragging = true;

        // get global mouse position
        let mouse = {
            x: event.clientX,
            y: event.clientY
        }



        // set relative position
        updateDragging(mouse.x, mouse.y);
    }

    function focusNewTab(event, index){
        currentSelectedTab = index;

        if (tabComponents[currentSelectedTab].onSelect)
            tabComponents[currentSelectedTab].onSelect();
    }

    function globalMouseUp(event){
        if (dragging){
            onPanelDragEnd(event.clientX, event.clientY);

            dragging = false;
        }
    }

    // function that determines the position of the panel in the grid based on the other elements the same column
    export function updateTransform(){

        // set top and left to position
        panelContainer.style.left = position.x + "px";
        panelContainer.style.top = position.y + "px";

        // set width and height to size
        panelContainer.style.width = size.width + "px";
        panelContainer.style.height = size.height + "px";

        for(let tabComponent of tabComponents){
            if (tabComponent.onResize)
                tabComponent.onResize()
        }
    }

    function updateDragging(mouseX, mouseY){        

        // move the panel centre to the mouse position accounting for the offset
        let boundingBox = panelContainer.getBoundingClientRect();

        let centre = {
            x: boundingBox.left + (boundingBox.width / 2),
            y: boundingBox.top + (boundingBox.height / 2)
        }
        let diff = {
            x: mouseX - centre.x,
            y: mouseY - centre.y
        }

        panelContainer.style.left = (panelContainer.offsetLeft + diff.x) + "px";
        panelContainer.style.top = (panelContainer.offsetTop + diff.y) + "px";

        onPanelDrag(mouseX, mouseY);
    }

    // getters
    // export function getName(){
    //     return name;
    // }

    export function getPosition(){
        return position;
    }

    export function getSize(){
        return size;
    }

    export function getRelativePosition(){
        return relativePosition;
    }

    export function getRelativeSize(){
        return relativeSize;
    }

    export function isDragging(){
        return dragging;
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

        resizeFuncs.forEach(func => {
            func(width, height);
        });

        updateTransform();
    }

    export function setRelativePosition(x, y){
        relativePosition.x = x;
        relativePosition.y = y;
    }

    export function setRelativeSize(width, height){
        relativeSize.width = width;
        relativeSize.height = height;
    }

    function setFullscreen(value: boolean){
        fullscreen = value;

        // resize
        for (let tab of tabComponents){
            if (tab.onResize)
                tab.onResize();
        }
        
    }
</script>



<div class="panel-container" bind:this={panelContainer} class:dragging={dragging} class:fullscreen={fullscreen}>
    <div class="panel-header" bind:this={panelHeader}>

        <div class="tabs-container">
            {#each tabs as tab, i}   
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="tab-header" on:click={(e)=>{focusNewTab(e,i)}} class:active-tab-header={i == currentSelectedTab} class:inactive-tab-header={i != currentSelectedTab}>
                    <h1>{toTitle(tab.name)}</h1>
                </div>        
            {/each}
        </div>

        <div class="panel-buttons">
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            {#if !fullscreen}
                <a class="header-button" on:click={()=>{setFullscreen(true)}}><Icon icon="mdi-fullscreen" /></a>
            {:else}
                <a class="header-button" on:click={()=>{setFullscreen(false)}}><Icon icon="mdi-fullscreen-exit" /></a>
            {/if}

            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- <span class="iconify" data-icon="mdi-close"></span> -->
            <a class="header-button"><Icon icon="mdi-close" /></a>
        </div>
    </div>
    <div class="panel-body" bind:this={panelBody}>
        {#each tabs as tab, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="tab-body" bind:this={tabElements[i]} class:active-tab={i == currentSelectedTab} class:inactive-tab={i != currentSelectedTab}>
            </div>
        {/each}
    </div> 
</div>



<style>

    .fullscreen{
        position: fixed !important;
        top: 0 !important;
        left: 0!important;
        width: 100% !important;
        height: 100% !important;

        border-radius: 0 !important;

        z-index: 5000;
    }

    .active-tab-header{

        /* border-top: 1px solid var(--foreground-color-2);
        border-left: 1px solid var(--foreground-color-2);
        border-right: 1px solid var(--foreground-color-2); */

        background-color: var(--midground-color);

        /* box-shadow: 0 0 5px rgba(0, 0, 0, 0.5); */

    }
    .inactive-tab-header{
        background-color: var(--midground-color-2);

    }

    .inactive-tab-header h1 {
        color: var(--semi-light-text-color) !important;
    }

    .tabs-container{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        height: 100%;

        overflow-x: auto;
    }

    .active-tab{
        display : block;
    }

    .inactive-tab{
        display : none;
    }


    .tab-body{
        width: 100%;
        height: 100%;
    }

    .tab-header{
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 2px;
        padding-left: 8px;
        padding-right: 8px;
        /* background-color: var(--foreground-color-2); */
        /* border-radius: var(--general-border-radius); */

        user-select: none;

        border-top-left-radius: var(--general-border-radius);
        border-top-right-radius: var(--general-border-radius);
    }

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
        /* padding: 2px; */

        padding-left: 5px;
        padding-right: 5px;
        padding-top: 3px;

        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);

        user-select: none;
    }
    .panel-header h1 {
        color: var(--text-color);
        font-size: 0.8em;
        font-weight: 300;

        margin: 0;

        user-select: none;
    }
    .panel-header a {
        font-size: 0.8em;
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

    .header-button:hover{
        color: var(--primary-color);
    }

    .dragging{
        opacity: 0.8;

        position: absolute;

        z-index: 1000;

        max-width: 8em;
        max-height: 10em;
    }

</style>