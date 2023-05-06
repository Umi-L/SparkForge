<script lang="ts">
    import { panelGridPositions } from "../../main";
    import { NodeTypes, type NodeData } from "../../Types";
    import Node from "../Node.svelte";
    import { afterUpdate, onMount } from "svelte";
    import Panel from "../Panel.svelte";

    // sort the node types by category
    const nodeTypesByCategory = Object.values(NodeTypes).reduce((acc: any, nodeType: NodeData) => {
        if (!acc[nodeType.category]) {
            acc[nodeType.category] = [];
            console.log(nodeType.category);
        }

        acc[nodeType.category].push(nodeType);

        return acc;
    }, {});

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


<Panel name="Toolbox">
    <div class="node-menu">
        <!-- foreach catagory and each node within draw it -->
        {#each Object.keys(nodeTypesByCategory) as category}
            <div class="node-category">
                <h3 class="category-header">{toTitle(category)}</h3>

                {#each nodeTypesByCategory[category] as nodeType}
                    <Node type={nodeType} factory={true}/>
                {/each}

                <!-- <div class="separator"></div> -->
            </div>
        {/each}
    </div>
</Panel>



<style>

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