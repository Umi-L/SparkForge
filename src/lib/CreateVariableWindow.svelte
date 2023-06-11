<script lang="ts">
    import Popover from "./Popover.svelte";
    import { currentLocalVariables } from "../globals";
  import { hideCreateVariablePopover } from "../CreateVariablePopoverManager";
    
    let visible = false;
    let varName = "";
    
    let localVariables = [];
    currentLocalVariables.subscribe(value => {
        localVariables = value;
    })
    
    export function setVisible(value: boolean){
        visible = value;
    }
    
    function createVariable(){
        // if not already created
        if(!localVariables.includes(varName)){
            currentLocalVariables.update(value => {
                value.push(varName);
                return value;
            })
        } else{
            alert("Variable already exists; choose a different name!");
        }
        hideCreateVariablePopover();
    }
</script>


<div class="upload-window-wrapper" class:visible={visible}>
    <Popover>
        <div class="upload-container">
            <h2 class="title-text">Create A New Variable</h2>
            
            <input type="text" placeholder="Variable Name" bind:value={varName}/>
            
            <button class="create-button" on:click={createVariable}>{(varName.length == 0) ? "Close" : "Create Variable"}</button>
            
        </div>
    </Popover>    
</div>



<style>
    
    .visible{
        display: block !important;
    }
    
    .upload-window-wrapper{
        display: none;
    }
    
    .upload-container{
        width: 100%;
        height: 100%;
        
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        
        padding: 3rem;
    }
    
    .create-button{
        margin-top: 10px;
        padding: 20px;
        border-radius: 5px;
        background-color: var(--midground-color);
        color: var(--text-color);
        border: none;
        cursor: pointer;
        
        width: 60%;
        
        outline: 1px solid var(--background-color);;
        
        transition-duration: 0.1s;
    }
    
    .create-button:hover{
        background-color: var(--background-color);
        outline: 2px solid var(--foreground-color-2);
    }
    
    .title-text{
        color: var(--text-color);
    }
</style>