<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { IMenuOption } from "../ContextMenu";

    export let menuOptions: Array<IMenuOption>;
    export let top: number;
    export let left: number;
    let showMenu = false;

    let menuElement: HTMLDivElement;
    let justShown = true;
    
    onMount(() => {
        // add global mouseup event listener
        window.addEventListener("mouseup", onMouseUpGlobal)
    });

    function onMouseUpGlobal(event){
        // if target is not a menu option, close menu
        if (!event.target.classList.contains("menu-option")){

            // if menu was just shown, don't close it
            if (justShown){
                justShown = false;
                return;
            }

            showMenu = false;
        }
    }

    export function setVisible(visible: boolean){
        showMenu = visible;

        // if menu is being shown, set justShown to true
        if (visible){
            justShown = true;
        }
    }

    function runThenHide(action){
        action();
        showMenu = false;
    }

</script>


{#if showMenu}
    <div bind:this={menuElement}>
        <div class="menu" style={`top: ${top}px; left: ${left}px;`}>
            {#each menuOptions as menuOption}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="menu-option" on:click={()=>{runThenHide(menuOption.action)}} class:unavalable={!menuOption.avalableCheck()}>
                    <div class="menu-option-label">{menuOption.label}</div>
                    {#if menuOption.subMenuOptions}
                        <span class="iconify" data-icon="mdi-arrow-bottom-right-bold-box-outline"></span>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
{/if}



<style>

    .unavalable{
        opacity: 0.5;
        user-select: none;
    }    

    .menu{

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;

        position: absolute;
        z-index: 1000;

        width: 200px;
        height: auto;

        background-color: var(--midground-color);
        border-radius: var(--general-border-radius);

        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        overflow: hidden;
    }

    .menu-option{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        background-color: var(--foreground-color);


        font-size: 0.7em;

        padding: 5px 10px;

        transition: 0.1s;
    }

    .menu-option:hover{
        background-color: var(--midground-color);
    }

    .menu-option-label{
        user-select: none;
        pointer-events: none;
    }
</style>