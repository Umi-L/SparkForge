<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";
    import { NodeTypes } from "../../Types";
    import Node from "../Node.svelte";
    import { afterUpdate, onMount } from "svelte";

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    const nodeGap = 40;

    panelGridPositions.forEach(element => {
        if (element.name == "toolbox") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });

    let childrenNodes:Array<Node> = [];

    onMount(() => {
    });

    function positionElements(){
        // start with "padding"
        let runningHeight = nodeGap/2;

        // for every children node
        childrenNodes.forEach(node => {
            // get first child
            let nodeBody = node.getRoot();

            console.log(nodeBody);

            // get the centre of the node's image
            let boundingBox = nodeBody.children[0].getBoundingClientRect();

            console.log(boundingBox);

            // get the centre of the node
            let centre = {
                x: boundingBox.width / 2,
                y: boundingBox.height / 2
            }

            console.log(centre);

            // get the width of the menu
            let menuWidth = nodeBody.parentElement.getBoundingClientRect().width;

            console.log(menuWidth);

            // set the position of the node
            nodeBody.style.left = (menuWidth / 2 - centre.x) + "px";
            nodeBody.style.top = (runningHeight) + "px";

            console.log(nodeBody.style.left)
            
            // add the height of the node to the running height
            runningHeight += boundingBox.height + nodeGap;

            console.log(runningHeight)
        });
    }

</script>



<Panel name="Toolbox" rowstyle={rowStyle} colstyle={colStyle}>
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