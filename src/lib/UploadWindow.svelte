<script lang="ts">
    import Popover from "./Popover.svelte";

    let visible = false;

    export function setVisible(value: boolean){
        visible = value;
    }
</script>


<div class="upload-window-wrapper" class:visible={visible}>
    <Popover>
        <h1>
            Upload
        </h1>
    </Popover>    
</div>



<style>

    .visible{
        display: block !important;
    }

    .upload-window-wrapper{
        display: none;
    }
</style>