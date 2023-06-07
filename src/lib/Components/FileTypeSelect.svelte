<script lang="ts">
    import Icon from "@iconify/svelte";
    import { FS, FileTypes, type FSFile, getFileTypeIcon } from "../../FileSystem";
    import { openContextMenu, type IMenuOption } from "../../ContextMenu";

    export let value: string;
    export let type: FileTypes;

    export let disabled: boolean = false;

    export let onChange: (value: string) => void;

    function openDropdown(event){
        if(disabled) return;

        let options = [];

        FS.getAllOfType(type).forEach(file => {
            let filePath = FS.getPath(file);

            options.push({
                label: filePath.replace("root", ""),
                action: () => {
                    value = filePath;

                    onChange(value);
                },
                avalableCheck: () => {
                    return true;
                },
                icon: getFileTypeIcon(type)
            } as IMenuOption)
        });
        
        openContextMenu(event.clientX, event.clientY, options);
    }

</script>



<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="input-root" on:click={openDropdown} class:disabled={disabled}>
    <p class="selected-text">
        {value.replace("root", "")}
    </p>
    <Icon icon="mdi-menu-down"/>
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
</style>