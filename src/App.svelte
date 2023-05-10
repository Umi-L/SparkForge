<script lang="ts">
  import Panel from "./lib/Panel.svelte";
  import Topbar from "./lib/Topbar.svelte";
  import Workspace from "./lib/Components/Workspace.svelte";
  import Toolbox from "./lib/Components/Toolbox.svelte";
  import Output from "./lib/Components/Output.svelte";
  import Properties from "./lib/Components/Properties.svelte";
  import Explorerer from "./lib/Components/Explorerer.svelte";
  import Game from "./lib/Components/Game.svelte";
  import Scene from "./lib/Components/Scene.svelte";
</script>



<main>
  <Topbar></Topbar>

  <!-- make body div -->
  <div class="body" id="body">

    <div id="panel_indicator"></div>

    <Panel tabs={[{name:"workspace", component: Workspace}, {name: "scene", component: Scene}, {name: "game", component: Game}]} defaultTransform={{left: 0.2, top: 0, width: 0.6, height: 0.8}}></Panel>
    <Panel tabs={[{name:"output", component: Output}]} defaultTransform={{left: 0.2, top: 0.8, width: 0.6, height: 0.2}}></Panel>
    <Panel tabs={[{name:"toolbox", component: Toolbox}]} defaultTransform={{left: 0, top: 0, width: 0.2, height: 1}}></Panel>
    <Panel tabs={[{name:"properties", component: Properties}, {name:"explorer", component: Explorerer}]} defaultTransform={{left: 0.8, top: 0, width: 0.2, height: 1}}></Panel>

    <!-- <Workspace></Workspace>
    <Toolbox></Toolbox>
    <Explorerer></Explorerer>
    <Output></Output>
    <Properties></Properties> -->

    <div class="debug-space-check"></div>
    <div class="debug-space-check"></div>
    <div class="debug-space-check"></div>
    <div class="debug-space-check"></div>

    <div id="panel-handles"></div>
    
    <div id="toasts">

    </div>
  </div>

  

</main>



<style>

  #panel-handles{
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  #panel_indicator{
    position: absolute;
    
    background-color: rgba(0, 0, 0, 0.2);

    z-index: 500;

    border-radius: var(--general-border-radius);
  }

  #toasts{
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }
</style>
