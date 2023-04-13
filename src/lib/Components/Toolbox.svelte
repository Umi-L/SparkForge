<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";
    import { NodeType, NodeTypes } from "../../Types";
    import Node from "../Node.svelte";
    import { onMount } from "svelte";

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    const nodeGap = 20;

    panelGridPositions.forEach(element => {
        if (element.name == "toolbox") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });

    let childrenNodes:Array<Node> = [];

    onMount(() => {

        let runningHeight = 0;

        // for every children node
        childrenNodes.forEach(node => {
            // get first child
            let nodeBody = node.$$.props["nodeBody"];

            console.log(nodeBody);
        });
    });

</script>



<Panel name="Toolbox" rowstyle={rowStyle} colstyle={colStyle}>
    <div class="node-menu">
        <!-- for every NodeType draw it -->
        {#each Object.values(NodeTypes) as node, i}
            
            <Node bind:this={childrenNodes[i]} shape={node.name} inputPoints={node.inputs} outputPoints={node.outputs} factory={true}></Node>
            
        {/each}
    </div>
</Panel>



<style>

    .node-menu {

        position: relative;

        display: flex;
        flex-direction: column;
        align-items: center;
        /* justify-content: center; */
        gap: 20px;
        height: 100%;
        width: 100%;

        padding: 10px;

        overflow: scroll;
    }

</style>