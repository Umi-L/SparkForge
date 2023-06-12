<script lang="ts">
    import { Compile, compileAll } from "../Compiler";
    import { openContextMenu, type IMenuOption } from "../ContextMenu";
  import { changeAllPanelsTabIfPossible } from "../WindowManager";
  import { gameRunning } from "../globals";
    import { getElementFromDomElement } from "../main";
  import { loadProjectFromJson, saveProjectToJson } from "../saveAndLoad";
    import type FlowchartEditor from "./Components/Editors/FlowchartEditor.svelte";
    import Icon from "@iconify/svelte";

    const menuOptions = [
        {
            label: "New",
            action: () => {
                console.log("New");
            },
            avalableCheck: () => {
                return true;
            },
            icon: "mdi-file",
        },
        {
            label: "Open",
            action: () => {
                loadProjectFromJson();
            },
            avalableCheck: () => {
                return true;
            },
            icon: "mdi-folder-open",
        },
        {
            label: "Save As File",
            action: () => {
                saveProjectToJson();
            },
            avalableCheck: () => {
                return true;
            },
            icon: "mdi-content-save",
        },
        {
            label: "Settings",
            action: () => {
                console.log("Settings");
            },
            avalableCheck: () => {
                return true;
            },
            icon: "mdi-cog",
        },
        
    ] as Array<IMenuOption>;

    let running = false;

    gameRunning.subscribe((value) => {
        running = value;
    });

    function runGame(){

        if (running) return;

        compileAll();

        changeAllPanelsTabIfPossible("game");

        gameRunning.update(()=>{return true;});
    }

    function menuClick(event){
        // get position of click
        let x = event.clientX;
        let y = event.clientY;

        // open context menu
        openContextMenu(x,y,menuOptions);
    }

    function stopGame(){
        gameRunning.update(()=>{return false;});
    }
</script>



<div class="topbar">
    <div class="start">
        <!-- svelte-ignore a11y-missing-attribute -->
        <!-- <span class="iconify" data-icon="mdi-menu"></span> -->
        <a on:click={menuClick}><Icon icon="mdi-menu" /></a>
    </div>



    <div class="middle">
        <div class="button-assembly">
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <a class="state-button" on:click={runGame} class:highlighted-start={running}><Icon icon="mdi-play"/></a>
            
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <a class="state-button" on:click={stopGame} class:highlighted={running}><Icon icon="mdi-stop"/></a>

        </div>
    </div>



    <div class="end">

    </div>
</div>



<style>

    a{
        display: flex;
        text-decoration: none;
        color: var(--text-color);
        justify-content: center;
        align-items: center;
    }

    .topbar{
        display: flex;
        flex-direction: row;

        justify-content: space-between;

        width: calc(100% - 2 * var(--general-padding));
        height: 30px;

        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);

        margin-top: var(--general-padding);
        margin-left: var(--general-padding);
        margin-right: var(--general-padding);


        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        position: absolute;
        top: 0;
        left: 0;
    }

    .topbar .start{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
    }

    .topbar .middle{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .topbar .end{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .button-assembly{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        background-color: var(--midground-color);

        height: 100%;

        border-radius: var(--general-border-radius);
    }

    .start{
        padding-left: 10px;
    }


    .state-button{
        width: 100%;
        height: 100%;
        padding-left: 10px;
        padding-right: 10px;

        border-radius: var(--general-border-radius);

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        transition-duration: 0.1s;
    }

    .highlighted-start{
        color: var(--primary-color);
    }

    .highlighted{
        background-color: var(--foreground-color-2);
    }

    .state-button:hover{
        background-color: var(--foreground-color);
    }

</style>