import ContextMenu from "./lib/ContextMenu.svelte";

let contextMenu = new ContextMenu({
    target: document.body,
    props: {
        left: 0,
        top: 0,
        menuOptions: [],
    },
});

export interface IMenuOption {
    label: string;
    subMenuOptions?: IMenuOption[];
    avalableCheck: () => boolean;
    action: () => void;
}

export function openContextMenu(left: number, top: number, options: Array<IMenuOption>) {
    contextMenu.$set({
        left: left,
        top: top,
        menuOptions: options,
    });

    contextMenu.setVisible(true);
}