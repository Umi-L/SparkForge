<script lang="ts">
  import { onMount } from "svelte";
  import type { IMenuOption } from "../ContextMenu";

    export let menuOptions: Array<IMenuOption>;
    export let top: number;
    export let left: number;

    let menuElement: HTMLDivElement;
    
    onMount(() => {
        // add global mouseup event listener
        window.addEventListener("mouseup", onMouseUpGlobal)
    });

    function onMouseUpGlobal(event){
        // if target is not a menu option, close menu
        if (!event.target.classList.contains("menu-option")){
            // destroy self
            menuElement.parentNode.removeChild(menuElement)
        }
    }

</script>



<div bind:this={menuElement}>
    <div class="menu" style={`top: ${top}px; left: ${left}px;`}>
        {#each menuOptions as menuOption}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="menu-option" on:click={menuOption.action}>
                <div class="menu-option-label">{menuOption.label}</div>
                {#if menuOption.subMenuOptions}
                    <span class="iconify" data-icon="mdi-arrow-bottom-right-bold-box-outline"></span>
                {/if}
            </div>
        {/each}
    </div>
</div>



<style>
    .menu{
        position: absolute;
        z-index: 1000;

        width: 200px;
        height: auto;

        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);

        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .menu-option{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        padding: 5px 10px;
    }
</style>