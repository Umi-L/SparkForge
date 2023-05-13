<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { FS, FileTypes, getFileTypeIcon } from "../../MockFS";
  import ExplorerChild from "./ExplorerChild.svelte";
  import { children, get_current_component } from "svelte/internal";
  import { openContextMenu, type IMenuOption } from "../../ContextMenu";
  import { registerElement, unregisterElement } from "../../main";

  let myself = get_current_component();

  let localFS = FS;
  let root: HTMLDivElement;

  let indicatorShown = false;

  export function showMoveIndicator() {
    indicatorShown = true;
  }

  export function hideMoveIndicator() {
    indicatorShown = false;
  }

  export function getPath() {
    return FS.getPath(localFS.root);
  }

    let contextMenuOptions: Array<IMenuOption> = [
        {label: "New", action: ()=>{}, avalableCheck: ()=>true, subMenuOptions: [
            {label: "Folder", action: newFolder, avalableCheck: ()=>true, icon: "material-symbols:folder-outline"},
        ], icon: "mdi-plus"},
    ]

    // foreach fileType, add a new menu option
    for (let _ in FileTypes){
        let fileType = _ as FileTypes; // gotta love typescript
        contextMenuOptions[0].subMenuOptions.push({label: fileType, action: ()=>{newFileOfType(fileType)}, avalableCheck: ()=>true, icon: getFileTypeIcon(fileType)})
    }

    function newFileOfType(type: FileTypes){

        let dir = FS.root

        let path = FS.getPath(dir);

        FS.addFile(path, {fileType: type, type: "file", name: `new ${type}`, content: {}, parent: dir});

      }

        function newFolder(){

        let dir = FS.root;

        let path = FS.getPath(dir);

        console.log(path)
        console.log(dir)

        FS.addDir(path, {type: "directory", name: "new folder", parent: dir, children: []});
        }

        

  onMount(()=>{

    registerElement(root, myself);

    FS.registerUpdateCallback(()=>{
      localFS = FS;
    })

    root.addEventListener("contextmenu", (event) => {

      console.log("context menu event")

      if (event.target !== root){
            console.log(event.target)
            return;
        }

        openContextMenu(event.clientX, event.clientY, contextMenuOptions)

        event.preventDefault();
    });
  })

  onDestroy(()=>{
    unregisterElement(root);
  })
</script>


<div class="explorer-root" bind:this={root} class:indicator-shown={indicatorShown}>

  {#key localFS.root.children}
      <!-- foreach directory in FS -->

      {#each localFS.root.children as fileOrDir}

        {#if fileOrDir.type === "directory"}
          <ExplorerChild directory={fileOrDir} />
        {:else}
          <ExplorerChild file={fileOrDir} />
        {/if}
      {/each}
  {/key}

</div>


<style>
   .indicator-shown{
        outline: 1px solid var(--highlight-color) !important;
        outline-offset: -1px;
    }

    .explorer-root {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        gap: 10px;

        padding: 5px;

        border-bottom-left-radius: var(--general-border-radius);
        border-bottom-right-radius: var(--general-border-radius);
    }
</style>