import ContextMenu from "./lib/ContextMenu.svelte";

let contextMenu: ContextMenu | undefined;

export interface IMenuOption {
    label: string;
    subMenuOptions?: IMenuOption[];
    action: () => void;
}

export function openContextMenu(left: number, top: number, options: Array<IMenuOption>) {
    if (contextMenu) {
        contextMenu.$destroy();
    }

    // create new context menu
    contextMenu = new ContextMenu({
        target: document.body,
        props: {
            left: left,
            top: top,
            menuOptions: options,
        },
    });
}