<script lang="ts">
    import { onMount } from "svelte";
    import { getQuickJS } from "quickjs-emscripten";
    import { NodeTypes } from "../../Types";

    async function run() {
        const QuickJS = await getQuickJS();

        const vm = QuickJS.newContext();

        //foreach node definitions
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

    onMount(run);
</script>

<div />

<style>
  .game-frame {
    width: 100%;
    height: 100%;

    border: none;
  }
</style>
