<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { closeContextMenu, type IMenuOption } from "../ContextMenu";
  import type ContextMenu from "./ContextMenu.svelte";

    export let menuOptions: Array<IMenuOption>;
    export let top: number;
    export let left: number;
    export let goingDirection = undefined;

    let showMenu = false;

    let menuElement: HTMLDivElement;
    let justShown = true;

    let subMenuOptions = [];
    let subMenuLeft = 0;
    let subMenuTop = 0;
    let submenuGoingDirection = undefined;
    let submenu: ContextMenu | any;


    let menuOptionElements = [];
    
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
        closeContextMenu(); // done to also close main menu when sub menu is clicked
    }

    function convertRemToPixels(rem) {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

</script>


{#if showMenu}
    <div bind:this={menuElement}>
        <div class="menu" style={`top: ${top}px; left: ${left}px;`}>
            {#each menuOptions as menuOption, i}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="menu-option" bind:this={menuOptionElements[i]} 
                    on:click={
                        ()=>{
                            if(menuOption.avalableCheck() && menuOption.subMenuOptions == undefined)
                            {
                                runThenHide(menuOption.action)
                            }
                        }
                    } 
                    on:mouseenter={
                        () => {
                            if(menuOption.avalableCheck() && menuOption.subMenuOptions != undefined)
                            {
                                submenu.setVisible(true);
                                subMenuOptions = menuOption.subMenuOptions;
                                submenuGoingDirection = goingDirection;


                                //calculate the number of px in 12rem
                                let px = convertRemToPixels(12);

                                let offset = px + 10;

                                if (goingDirection == "left"){
                                    offset = -offset;
                                }
                                else if (goingDirection == "right"){
                                    offset = offset;
                                }
                                else if (menuOptionElements[i].getBoundingClientRect().right+offset > window.innerWidth){
                                    offset = -offset;
                                    submenuGoingDirection = "left";
                                }
                                else{
                                    offset = offset;
                                    submenuGoingDirection = "right";
                                }
                                

                                subMenuLeft = menuOptionElements[i].getBoundingClientRect().left+offset;
                                subMenuTop = menuOptionElements[i].getBoundingClientRect().top;
                            }else{
                                submenu.setVisible(false);
                            }
                        }
                    }
                    
                    class:unavalable={!menuOption.avalableCheck()}>


                    

                    <div class="label-container">
                        {#if menuOption.icon}
                            <span class="iconify icon" data-icon={menuOption.icon}></span>
                        {/if}
                        <div class="menu-option-label">{menuOption.label}</div>
                    </div>

                    {#if menuOption.subMenuOptions}
                        <span class="iconify icon" data-icon="mdi-menu-right"></span>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <svelte:self menuOptions={subMenuOptions} top={subMenuTop} left={subMenuLeft} goingDirection={submenuGoingDirection} bind:this={submenu} />
{/if}



<style>

    .label-container{
        display: flex;
        flex-direction: row;
        align-items: center;

        gap: 5px;

        user-select: none;
        pointer-events: none;
    }

    .icon{

        font-size: 1em;
        color: var(--text-color);

        user-select: none;
        pointer-events: none;
    }

    .unavalable{
        opacity: 0.5;
        user-select: none;
        pointer-events: none;
    }    

    .menu{

        padding-top: 5px;
        padding-bottom: 5px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;

        position: absolute;
        z-index: 1000;

        width: 12rem;
        height: auto;

        background-color: var(--background-color);
        border-radius: var(--general-border-radius);

        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        overflow: hidden;

        outline: 1px solid var(--midground-color);
    }

    .menu-option{

        width: 96%;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        background-color: var(--background-color);

        border-radius: var(--general-border-radius);


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
        color: var(--text-color);
    }
</style>