<script lang="ts">
    import Panel from "../Panel.svelte";
    import { panelGridPositions } from "../../main";

    let colStyle = "1 / 2";
    let rowStyle = "1 / 2";

    panelGridPositions.forEach(element => {
        if (element.name == "output") {
            colStyle = element["col"];
            rowStyle = element["row"];   
        }
    });
</script>



<Panel name="Output" rowstyle={rowStyle} colstyle={colStyle}>

</Panel>



<style>

</style>