<script lang="ts">
    import { onMount } from "svelte";
    import { getQuickJS, type QuickJSContext, type QuickJSWASMModule } from "quickjs-emscripten";
    import { NodeTypes } from "../../Types";
    import * as PIXI from "pixi.js";

    let gameContainer: HTMLDivElement;

    let resizeFunc: Function;
    let app: PIXI.Application;
    let QuickJS: QuickJSWASMModule;
    let vm: QuickJSContext;

    export function onResize(){
        resizeFunc();
    }

    export function onFocus(){
      setTimeout(() => {
        resizeFunc();
      }, 0);
    }

    async function init() {
        // ----- init sandbox -----
        QuickJS = await getQuickJS();
        loadVm();

        let color = getComputedStyle(document.documentElement).getPropertyValue('--midground-color');

        // ----- init pixi -----
        app = new PIXI.Application({
            backgroundColor: color,
        });

        resizeFunc = () => {
            let width = gameContainer.offsetWidth;
            let height = gameContainer.offsetHeight;

            app.renderer.resize(width, height);
        }
        
        gameContainer.appendChild(app.view as any);

        // add onresize listener
        gameContainer.addEventListener("resize", resizeFunc as any)

        setTimeout(() => {
          resizeFunc();
        }, 0);
    }

    function loadVm(){
      vm = QuickJS.newContext();

      //foreach node definition
      for (const nodeType in NodeTypes) {
          const node = NodeTypes[nodeType];

          if (node.func != undefined){
              // expose it to the vm
              let funcHandle = vm.newFunction(node.func.name, (...args) => node.func(...args));
              vm.setProp(vm.global, node.func.name, funcHandle);

              console.log(node.func.name, "exposed to vm")
          }
      }
    }

    function run(){
        // reset pixi
        app.stage.removeChildren();

        // reload vm
        loadVm();

    }

    onMount(init);
</script>

<div id="game-container" bind:this={gameContainer}/>

<style>
  #game-container {
    width: 100%;
    height: 100%;
    overflow:hidden;
  }
</style>
