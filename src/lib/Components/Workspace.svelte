<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";
  import { onMount } from "svelte";

    let panelExtender:HTMLDivElement;
    let workfield:HTMLDivElement;

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    const panelExtenderDistance = 500;

    panelGridPositions.forEach(element => {
        if (element.name == "workspace") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });

    onMount(() => {
        update();
    });

    function update() {

        let elementsBox = getElementsBox();

        panelExtender.style.top = elementsBox.height + (panelExtenderDistance*2) + "px";
        panelExtender.style.left = elementsBox.width + (panelExtenderDistance*2) + "px";

    }

    function getElementsBox(): DOMRect {
        // get the bounding box of the elements that are in the workfield but not the extender
        let elements = workfield.children;
        let elementsBox = new DOMRect(0, 0, 0, 0);

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i] as HTMLElement;

            if (element != panelExtender) {
                let elementBox = element.getBoundingClientRect();

                if (elementBox.x < elementsBox.x) {
                    elementsBox.x = elementBox.x;
                }

                if (elementBox.y < elementsBox.y) {
                    elementsBox.y = elementBox.y;
                }

                if (elementBox.x + elementBox.width > elementsBox.x + elementsBox.width) {
                    elementsBox.width = elementBox.x + elementBox.width - elementsBox.x;
                }

                if (elementBox.y + elementBox.height > elementsBox.y + elementsBox.height) {
                    elementsBox.height = elementBox.y + elementBox.height - elementsBox.y;
                }
            }
        }

        return elementsBox;
    }
</script>



<Panel name="Workspace" rowstyle={rowStyle} colstyle={colStyle}>
    <div class="workfield" bind:this={workfield}>
        <div class="extender" bind:this={panelExtender}></div>
    </div>
</Panel>



<style>
    .workfield {
        width: 100%;
        height: 100%;
        background-image: url("/dotbg.png");
        background-size: 20px 20px;
        overflow: scroll;
    }

    .extender{
        position: relative;

        width:1px;
        height:1px;

        background-color: transparent;
    }
</style>