<script lang="ts">
    import { Compile } from "../Compiler";
    import { getElementFromDomElement } from "../main";
    import type FlowchartEditor from "./Components/Editors/FlowchartEditor.svelte";
    import Icon from "@iconify/svelte";

    function runGame(){
        // foreach workspace
        let workfields = document.querySelectorAll(".workfield");

        let workspaces = [];

        for (let workfield of workfields){
            workspaces.push(getElementFromDomElement(workfield) as FlowchartEditor);
        }

        for (let i = 0; i < workspaces.length; i++){
            let asts = workspaces[i].workspaceToASTs();

            for (let ast of asts){

                console.log(Compile(ast));
            }
        }
    }
</script>



<div class="topbar">
    <div class="start">
        <!-- svelte-ignore a11y-missing-attribute -->
        <!-- <span class="iconify" data-icon="mdi-menu"></span> -->
        <a><Icon icon="mdi-menu" /></a>
    </div>



    <div class="middle">
        <div class="button-assembly">
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <a class="state-button" on:click={runGame}><Icon icon="mdi-play"/></a>
            
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="state-button"><Icon icon="mdi-stop"/></a>

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

    .state-button:hover{
        background-color: var(--background-color);
    }

</style>