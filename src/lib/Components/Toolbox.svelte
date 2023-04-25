<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";
    import { NodeTypes } from "../../Types";
    import Node from "../Node.svelte";
    import { afterUpdate, onMount } from "svelte";

    const nodeGap = 40;

    let childrenNodes:Array<Node> = [];

    onMount(() => {
        window.onresize = positionElements;
    });

    function positionElements(){
        // start with "padding"
        let runningHeight = nodeGap/2;

        // for every children node
        childrenNodes.forEach(node => {
            // get first child
            let nodeBody = node.getRoot();

            // get the centre of the node's image
            let boundingBox = nodeBody.children[0].getBoundingClientRect();

            // // get the centre of the node
            // let centre = {
            //     x: boundingBox.width / 2,
            //     y: boundingBox.height / 2
            // }

            // get the width of the menu
            let menuWidth = nodeBody.parentElement.getBoundingClientRect().width;

            // set the position of the node to the centre
            // nodeBody.style.left = (menuWidth / 2 - centre.x) + "px";

            // justify right but leave a gap
            nodeBody.style.left = (menuWidth - boundingBox.width - nodeGap) + "px";

            nodeBody.style.top = (runningHeight) + "px";
            
            // add the height of the node to the running height
            runningHeight += boundingBox.height + nodeGap;
        });
    }

</script>



<Panel name="Toolbox">
    <div class="node-menu">
        <!-- for every NodeType draw it -->
        {#each Object.values(NodeTypes) as node, i}
            
            <Node bind:this={childrenNodes[i]} shape={node.name} inputPoints={node.inputs} outputPoints={node.outputs} factory={true} on:reposition={positionElements}></Node>
            
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