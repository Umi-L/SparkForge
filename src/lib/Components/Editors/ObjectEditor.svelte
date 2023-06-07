<script lang="ts">
  import { FS, type FSFile } from "../../../FileSystem";

    export let file: string;

    let fsFile = FS.getAtPath(file) as FSFile;
</script>
    
<div class="container">
    <h1>Object Editor</h1>
    <p>Editing {file}</p>
    <!-- <p>File contents: {JSON.stringify(fsFile)}</p> -->
</div>

<style>
    .container{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>