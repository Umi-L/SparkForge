<script lang="ts">
  import Panel from "./lib/Panel.svelte";
  import Topbar from "./lib/Topbar.svelte";
  import Workspace from "./lib/Components/Workspace.svelte";
  import Toolbox from "./lib/Components/Toolbox.svelte";
  import Output from "./lib/Components/Output.svelte";
  import Properties from "./lib/Components/Properties.svelte";
</script>



<main>
  <Topbar></Topbar>

  <!-- make body div -->
  <div class="body">

    <Workspace></Workspace>
    <Toolbox></Toolbox>
    <Output></Output>
    <Properties></Properties>
  </div>

</main>



<style>
  
</style>
