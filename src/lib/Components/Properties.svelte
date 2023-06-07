<script lang="ts">
  import { each, get_current_component } from "svelte/internal";
    import { registerPropertiesPanel, type Property, unregisterPropertiesPanel, type Component} from "../../PropertiesSystem";
    import { onMount, onDestroy } from "svelte";
  import { PropertyTypes } from "../../Types";
  import FileTypeSelect from "./FileTypeSelect.svelte";
  import { FileTypes } from "../../FileSystem";

    let myself = get_current_component();
    
    let properties: Array<Component> = [];

    export function setProperties(newProperties: Array<Component>){
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

    {#each properties as catagory}
        <div class="catagory">
            <div class="catagory-topbar">
                <h1 class="catagory-name">{catagory.name}</h1>
            </div>

            <div class="catagory-content">
                {#each catagory.properties as property}
                    <div class="property">
                        <h1 class="property-name">{property.name + ": "}</h1>


                        <div class="property-content">
                            <!-- svelte-ignore empty-block -->
                            {#if property.type == PropertyTypes.String}
                                <input type="text" value={property.value} class="input" disabled={!property.isModifiable}/>

                            {:else if property.type == PropertyTypes.Number}
                                <input type="number" value={property.value} class="input" disabled={!property.isModifiable}/>
                            {:else if property.type == PropertyTypes.Boolean}
                                <input type="checkbox" value={property.value} class="input" disabled={!property.isModifiable}/>
                            {:else if property.type == PropertyTypes.Vector2}
                                <p>x:</p><input type="number" value={property.value["x"]} class="input" disabled={!property.isModifiable}/>
                                <p>y:</p><input type="number" value={property.value["y"]} class="input" disabled={!property.isModifiable}/>
                            {:else if property.type == PropertyTypes.Sprite}
                                <FileTypeSelect value={property.value} disabled={!property.isModifiable} type={FileTypes.sprite} 
                                onChange={(newValue)=>{property.onChange(newValue)}}/>
                            {/if}
                        </div>
                        
                    </div>
                {/each}
            </div>
        </div>
    {/each}

    {#if properties.length == 0}
        <div class="unselected-message-wrapper">
            <h2 class="unselected-message">Select an Item in The Explorer</h2>
        </div>
    <!-- super long and bad way of doing this. Might refactor at some point but I'm lazy :p -->
    <!-- TODO: Refactor this -->
    {:else if properties.find((catagory) => catagory.name == "File" && catagory.properties.find((property) => property.name == "Type").value == "object")}
        <!-- svelte-ignore a11y-missing-attribute -->
        <div class="add-component-button">
            <h1 class="add-component-button-text">Add Component</h1>
        </div>
    {/if}
</div>



<style>

    .property-content{
        overflow:hidden;
    }

    .add-component-button{
        width: 95%;
        height: 1.8rem;
        background-color: var(--foreground-color-2);
        border-radius: var(--general-border-radius);
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0.2rem;

        cursor: pointer;

        transition: 0.05s;

        box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.2);

    }

    .add-component-button:hover{
        outline: 1px solid var(--text-color);
    }

    .add-component-button-text{
        color: var(--text-color);
        font-size: 0.8rem;
    }

    .input{
        border-radius: var(--general-border-radius);
        border: 1px solid var(--background-color);
        padding: 1px 2px;
        width: 100%;

        background-color: var(--foreground-color-2);
    }

    .input:disabled{
        background-color: var(--midground-color);
    }

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

    h1{
        margin: 0;
        padding: 0;

        font-size: 1rem;
    }

    p{
        margin: 0;
        padding: 0;

        font-size: 0.7rem;
        color: var(--text-color);

        display: flex;
        align-items: center;
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

    .catagory{
        width: 100%;
        height: fit-content;

        background-color: var(--foreground-color);
        border-radius: var(--general-border-radius);
        overflow: hidden;

        box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.2);
    }
    
    .catagory-content{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: auto;
        gap: 5px;

        padding: 5px;
    }

    .property{
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 5px;

        overflow: hidden;
    }

    .catagory-topbar{
        background-color: var(--foreground-color-2);
        padding: 2px;
        padding-left: 5px;
        padding-right: 5px;

        border-radius: var(--general-border-radius);
    }

    .property-name{
        font-size: 0.8rem;
        color: var(--text-color);
        width: fit-content;

        display: flex;
        align-items: center;
    }

    .catagory-name{
        font-size: 1rem;
        color: var(--text-color);
        width: fit-content;

        display: flex;
        align-items: center;
    }
</style>