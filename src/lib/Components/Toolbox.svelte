<script lang="ts">
    import { panelGridPositions } from "../../main";
    import { NodeTypes } from "../../Types";
    import Node from "../Node.svelte";
    import { afterUpdate, onMount } from "svelte";
    import Panel from "../Panel.svelte";

</script>



<Panel name="Toolbox">
    <div class="node-menu">
        <!-- for every NodeType draw it -->
        {#each Object.values(NodeTypes) as nodeType, i}
            
            <Node type={nodeType} factory={true}></Node>
            
        {/each}
    </div>
</Panel>



<style>

    .node-menu {
        display: flex;
        flex-direction: column;
        align-items: end;
        /* justify-content: center; */
        gap: 20px;
        height: 100%;
        width: 100%;

        padding: 10px;

        overflow: scroll;
    }

</style>