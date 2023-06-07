<script lang="ts">
    import Popover from "./Popover.svelte";

    let visible = false;

    export function setVisible(value: boolean){
        visible = value;
    }
</script>


<div class="upload-window-wrapper" class:visible={visible}>
    <Popover>
        <div class="upload-container">
            UPLOAD
        </div>
    </Popover>    
</div>



<style>

    .visible{
        display: block !important;
    }

    .upload-window-wrapper{
        display: none;
    }

    .upload-container{
        width: 100%;
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
</style>