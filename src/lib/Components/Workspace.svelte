<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";
    import { onMount } from "svelte";

    let panelExtender:HTMLDivElement;
    let workfield:HTMLDivElement;

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    let dragging = false;
    let currentViewPos = {x: 0, y: 0};

    const panelExtenderDistance = 500;

    panelGridPositions.forEach(element => {
        if (element.name == "workspace") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });

    onMount(() => {
        update();

        // add event listeners
        window.addEventListener("mouseup", globalOnMouseUp);
        workfield.addEventListener("mousedown", workfieldMouseDown);
        workfield.addEventListener("mousemove", workfieldMouseMove);
        workfield.addEventListener("scroll", workfieldOnScroll);

        // // start at 50% scroll
        // workfield.scrollLeft = workfield.scrollWidth / 2;
        // workfield.scrollTop = workfield.scrollHeight / 2;
    });

    function update() {

        let elementsBox = getElementsBox();

        panelExtender.style.top = elementsBox.height + (panelExtenderDistance*2) + "px";
        panelExtender.style.left = elementsBox.width + (panelExtenderDistance*2) + "px";

    }

    function globalOnMouseUp(event) {
        if (dragging) {
            dragging = false;

            event.preventDefault();
        }
    }

    function workfieldMouseDown(event){
        dragging = true;

        event.preventDefault();
    }

    function workfieldMouseMove(event){
        if (dragging) {
            // move the workfield the same amount as the mouse moved
            workfield.scrollLeft -= event.movementX;
            workfield.scrollTop -= event.movementY;
        }
    }

    function workfieldOnScroll(event) {
        // update current view position
        currentViewPos.x = workfield.scrollLeft;
        currentViewPos.y = workfield.scrollTop;

        // update background x and y but keep the direction of scroll
        workfield.style.backgroundPositionX = -currentViewPos.x + "px";
        workfield.style.backgroundPositionY = -currentViewPos.y + "px";
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
        background-size: 30px 30px;
        overflow: scroll;
    }

    .extender{
        position: relative;

        width:1px;
        height:1px;

        background-color: transparent;
    }
</style>