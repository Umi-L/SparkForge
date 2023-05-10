<script lang="ts">
  import { onMount } from "svelte";
    import { FS } from "../../MockFS";
  import ExplorerChild from "./ExplorerChild.svelte";


  let localFS = FS;
  let root: HTMLDivElement;

  onMount(()=>{

    FS.registerUpdateCallback(()=>{
      localFS = FS;
    })

    root.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  })
</script>



<div class="explorer-root" bind:this={root}>
    <!-- foreach directory in FS -->

    {#each localFS.dirs as directory}
        <ExplorerChild directory={directory} />
    {/each}
</div>



<style>
    .explorer-root {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        gap: 10px;

        padding: 5px;
    }
</style>