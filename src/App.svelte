<script lang="ts">
  import Panel from "./lib/Panel.svelte";
  import Topbar from "./lib/Topbar.svelte";
  import Workspace from "./lib/Components/Workspace.svelte";
  import Toolbox from "./lib/Components/Toolbox.svelte";
  import Output from "./lib/Components/Output.svelte";
  import Properties from "./lib/Components/Properties.svelte";
  import Explorerer from "./lib/Components/Explorerer.svelte";
</script>



<main>
  <Topbar></Topbar>

  <!-- make body div -->
  <div class="body" id="body">

    <div id="panel_indicator"></div>

    <Workspace></Workspace>
    <Toolbox></Toolbox>
    <Explorerer></Explorerer>
    <Output></Output>
    <Properties></Properties>
    
  </div>

  

</main>



<style>
  #panel_indicator{
    position: absolute;
    
    background-color: rgba(0, 0, 0, 0.2);

    z-index: 500;

    border-radius: var(--general-border-radius);
  }
</style>
