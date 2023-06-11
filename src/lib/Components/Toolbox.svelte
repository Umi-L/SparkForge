<script lang="ts">
    import { panelGridPositions } from "../../main";
    import { NodeTypes, type NodeData } from "../../Types";
    import Node from "../Node.svelte";
    import { afterUpdate, onMount } from "svelte";
    import Panel from "../Panel.svelte";
    import { ERORR, toTitle } from "../../Utils";
  import { showCreateVariablePopover } from "../../CreateVariablePopoverManager";
  import { currentLocalVariables } from "../../globals";


    let localVariables = [];
    currentLocalVariables.subscribe((value) => {
        localVariables = value;
    });

    // sort the node types by category
    const nodeTypesByCategory = Object.values(NodeTypes).reduce((acc: any, nodeType: NodeData) => {
        if (!acc[nodeType.category]) {
            acc[nodeType.category] = [];
        }

        acc[nodeType.category].push(nodeType);

        return acc;
    }, {});

    function openCreateVariableMenu(){

        if (!localVariables){
            ERORR("You must have a flowchart open to create a variable.")
            return;
        }

        showCreateVariablePopover();
    }
</script>


<div class="node-menu">
    <!-- foreach catagory and each node within draw it -->
    {#each Object.keys(nodeTypesByCategory) as category}
        <div class="node-category">
            <h3 class="category-header">{toTitle(category)}</h3>

            {#each nodeTypesByCategory[category] as nodeType}
                <Node type={nodeType} factory={true}/>
            {/each}

            <!-- if catagory is variables -->
            {#if category === "variables"}
                <div class="create-variable-button" on:click={openCreateVariableMenu}>
                    <h1 class="create-variable-text">Create Variable</h1>
                </div>
            {/if}

            <!-- <div class="separator"></div> -->
        </div>
    {/each}
</div>



<style>

    .create-variable-button{
        width: 95%;
        height: 1.8rem;
        background-color: var(--foreground-color-2);
        border-radius: var(--general-border-radius);
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0.2rem;

        cursor: pointer;

        transition: 0.05s;

        box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.2);
    }

    .create-variable-button:hover{
        outline: 1px solid var(--text-color);
    }

    .create-variable-text{
        color: var(--text-color);
        font-size: 0.8rem;
    }

    .node-menu {
        display: flex;
        flex-direction: column;
        align-items: start;
        /* justify-content: center; */
        gap: 30px;
        height: 100%;
        width: 100%;

        padding: 10px;

        overflow: scroll;
    }

    .category-header{
        margin: 0;
        padding: 0;
        color: var(--text-color);

        font-size: 0.7em;
    }

    .node-category{
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 10px;
        width: 100%;
    }

    .separator{
        height: 1px;
        width: 100%;
        background-color: var(--background-color);
    }

</style>