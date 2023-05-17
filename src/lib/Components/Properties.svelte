<script lang="ts">
  import { get_current_component } from "svelte/internal";
    import { registerPropertiesPanel, type Property, unregisterPropertiesPanel } from "../../PropertiesSystem";
    import { onMount, onDestroy } from "svelte";

    let myself = get_current_component();
    
    let properties: Array<Property> = [];

    export function setProperties(newProperties: Array<Property>){
        properties = newProperties;
    }

    export function clearProperties(){
        properties = [];
    }

    onMount(()=>{
        registerPropertiesPanel(myself);
    })

    onDestroy(()=>{
        unregisterPropertiesPanel(myself);
    })
</script>



<div class="properties-container">
    {#each properties as property}
        <div class="property">
            <div class="property-topbar">
                <h1 class="property-name">{property.name}</h1>
            </div>
            <div class="property-content">{property.value}</div>
        </div>
    {/each}

    {#if properties.length == 0}
        <div class="unselected-message-wrapper">
            <h2 class="unselected-message">Select an Item in The Explorer</h2>
        </div>
    {/if}
</div>



<style>

    .unselected-message-wrapper{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .unselected-message{
        color: var(--text-color);
        font-size: 1rem;
        text-align: center;
    }

    .properties-container{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        /* justify-content: center; */
        align-items: center;
        gap: 10px;

        padding: 5px;
    }

    .property{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: fit-content;

        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);
        overflow: hidden;
    }

    .property-topbar{
        background-color: var(--foreground-color-2);
        padding: 2px;
        padding-left: 5px;
        padding-right: 5px;
    }

    .property-name{
        font-size: 1rem;
        color: var(--text-color);
    }

    .property-content{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: fit-content;
        padding: 5px;
        padding-left: 10px;
        padding-right: 10px;
        gap: 5px;

        font-size: 0.8rem;
        color: var(--text-color);
    }
</style>