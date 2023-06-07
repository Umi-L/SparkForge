import ContextMenu from "./lib/ContextMenu.svelte";

let contextMenu = new ContextMenu({
    target: document.body,
    props: {
        left: 0,
        top: 0,
        menuOptions: [],
        maxHeight: 0,
    },
});

// on window resize close all context menus
window.addEventListener("resize", () => {
    closeContextMenu();
});

export interface IMenuOption {
    label: string;
    icon?: string;
    subMenuOptions?: IMenuOption[];
    avalableCheck: () => boolean;
    action: () => void;
}

export function openContextMenu(left: number, top: number, options: Array<IMenuOption>) {

    closeContextMenu();

    // if the context menu would be off the screen, move it to the left 200px
    if (left + 200 > window.innerWidth) {
        left -= 200;
    }

    contextMenu.$set({
        left: left,
        top: top,
        menuOptions: options,
        maxHeight: window.innerHeight - top-5,
    });

    contextMenu.setVisible(true);
}

export function closeContextMenu() {
    contextMenu.setVisible(false);
}