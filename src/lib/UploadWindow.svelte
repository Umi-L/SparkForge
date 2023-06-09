<script lang="ts">
  import Icon from "@iconify/svelte";
    import Popover from "./Popover.svelte";
  import { hideUploadWindow } from "../UploadPopoverManager";
  import { FS, FileTypes } from "../FileSystem";
  import { createToast } from "../ToastManager";
  import Toast from "./Toast.svelte";
  import { ToastPosition, ToastType } from "../Types";
  import { addFilesToDirectory } from "../Utils";

    let visible = false;
    let path = "";

    let files: FileList = null;

    const supporedFileTypes = [""]

    export function setVisible(value: boolean, _path: string){
        visible = value;
        path = _path;

        files = null;
    }

    function fileChage(e: Event){
        files = (e.target as HTMLInputElement).files;
    }

    function upload(){
        console.log(files)

        if (files == null) {
            hideUploadWindow();
            return;
        };

        addFilesToDirectory(files, path);
        
        hideUploadWindow();
    }
</script>


<div class="upload-window-wrapper" class:visible={visible}>
    <Popover>
        <div class="upload-container">
            <h2 class="title-text">Upload Files To Directory "{path.replace("root", "")}"</h2>
            <input type="file" multiple id="file-picker" on:change={fileChage}>

            <div class="button-and-file-text">
                <label for="file-picker" class="custom-file-picker">
                    <div>
                        <Icon icon="mdi-upload"></Icon>
                        <span>Choose Files</span>
                    </div>

                    <p>or drag to upload</p>
                </label>

                <div class="file-text">
                    {(files == null) ? "No Files Selected" : `${files.length} Files Selected`}
                </div>
            </div>

            <button class="upload-button" on:click={upload}>{(files == null) ? "Cancel" : "Upload"}</button>
            
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
        justify-content: space-between;
        flex-direction: column;

        padding: 3rem;
    }

    #file-picker{
        display: none;
    }

    .custom-file-picker{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: var(--midground-color);
        color: var(--text-color);
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
        aspect-ratio: 1/1;

        transition-duration: 0.1s;
        outline: 1px solid var(--background-color);;
    }

    .custom-file-picker:hover{
        background-color: var(--background-color);
        outline: 2px solid var(--foreground-color-2);
    }

    p{
        margin-top: 10px;
        font-size: 0.8rem;
    }

    .upload-button{
        margin-top: 10px;
        padding: 20px;
        border-radius: 5px;
        background-color: var(--midground-color);
        color: var(--text-color);
        border: none;
        cursor: pointer;

        width: 60%;

        outline: 1px solid var(--background-color);;

        transition-duration: 0.1s;
    }

    .upload-button:hover{
        background-color: var(--background-color);
        outline: 2px solid var(--foreground-color-2);
    }

    .title-text{
        color: var(--text-color);
    }

    .button-and-file-text{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
    }

    .file-text{
        margin-top: 10px;
        font-size: 0.8rem;
        color: var(--text-color);
    }


</style>