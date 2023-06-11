<script lang="ts">
  import Icon from "@iconify/svelte";
  import { FlowLiteralType } from "../Types";
  import Node from "./Node.svelte";
  import { currentLocalVariables } from "../globals";
  import { openContextMenu, type IMenuOption } from "../ContextMenu";
  import { createEventDispatcher } from "svelte";


    const dispatch = createEventDispatcher();

    export let type: FlowLiteralType;

    let localVars: Array<string> = [];
    currentLocalVariables.subscribe(value => {
        localVars = value;
    });

    let value: any
    let inputElement: HTMLInputElement;

    export function getValue() {
        if (inputElement){
            if (type == "text")
                value = inputElement.value;

                if (value == undefined)
                    value = "";
            else if (type == "number")
                value = parseFloat(inputElement.value);

                if (value == undefined)
                    value = 0;
            else if (type == "checkbox")
                value = inputElement.checked;

                if (value == undefined)
                    value = false;
        }

        return value;
    }

    export function setValue(newValue: any) {
        value = newValue;

        if (inputElement){
            if (type == "text")
                inputElement.value = value;
            else if (type == "number")
                inputElement.value = value;
            else if (type == "checkbox")
                inputElement.checked = value;
        }
    }

    function valueChanged(){

        if (inputElement){
            if (type == "text")
                value = inputElement.value;

                if (value == undefined)
                    value = "";
            else if (type == "number")
                value = parseFloat(inputElement.value);

                if (value == undefined)
                    value = 0;
            else if (type == "checkbox")
                value = inputElement.checked;

                if (value == undefined)
                    value = false;
        }

        // create event for parent
        dispatch("valueChange", value)
    }

    function openDropdown(event: MouseEvent){
        // foreach localvar make an IMenuOption
        let options: Array<IMenuOption> = [];

        localVars.forEach(localVar => {
            options.push({
                label: localVar,
                action: () => {
                    value = localVar;
                    valueChanged();
                },
                icon: "mdi-variable",
                avalableCheck: () => {
                    return true;
                }
            } as IMenuOption);
        });

        openContextMenu(event.clientX, event.clientY, options);
    }

    export function blur(){

        if (!inputElement)
            return

        inputElement.blur();
    }

    export function getInputElement(){
        return inputElement;
    }
</script>



<div>
    {#if type == FlowLiteralType.Variable}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="input-root" on:click={openDropdown}>
            <p class="selected-text">
                {#if value}
                    {value}
                {:else}
                    Select a variable
                {/if}
            </p>
            <Icon icon="mdi-menu-down"/>
        </div>
    {:else}
        <input bind:this={inputElement} type={type} class="input" on:change={valueChanged} on:input={valueChanged}>
    {/if}
</div>





<style>
    .input-root{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        max-width: 100%;

        border-radius: var(--general-border-radius);
        background-color: var(--midground-color);

        border: 1px solid var(--background-color);

        padding-left: 5px;
        /* padding-right: 5px; */

        cursor: pointer;
        pointer-events: all;
    }

    .selected-text{
        font-size: 0.7rem;
        color: var(--text-color);

        text-overflow: ellipsis;
        word-wrap: break-word;

        width: 100%;

        overflow: hidden;
        white-space: nowrap;
    }

    .disabled{
        cursor: not-allowed;
    }

    .input{
        max-width: 80px;
        height: 20px;

        border-radius: var(--general-border-radius);

        border: 1px solid var(--foreground-color);

        background-color: var(--midground-color);

        color: var(--text-color);

        padding: 5px;

        pointer-events: all;
    }
</style>