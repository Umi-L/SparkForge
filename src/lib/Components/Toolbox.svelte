<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";
    import { NodeType, NodeTypes } from "../../Types";
    import Node from "../Node.svelte";

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    panelGridPositions.forEach(element => {
        if (element.name == "toolbox") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });

</script>



<Panel name="Toolbox" rowstyle={rowStyle} colstyle={colStyle}>
    <div class="node-menu">
        <!-- for every NodeType draw it -->
        {#each Object.values(NodeTypes) as node}
            <div class="node-wrapper">
                <Node shape={node.name} inputPoints={node.inputs} outputPoints={node.outputs} factory={true}></Node>
            </div>
        {/each}
    </div>
</Panel>



<style>

    .node-menu {
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

    /* .node-wrapper{
        max-width: 80%;
        max-height: 85px;
    } */

</style>