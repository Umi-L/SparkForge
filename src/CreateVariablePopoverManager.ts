import CreateVariableWindow from "./lib/CreateVariableWindow.svelte";

let variableCreateWindow = new CreateVariableWindow({
    target: document.body,
});

export function showCreateVariablePopover(){
    variableCreateWindow.setVisible(true);
}

export function hideCreateVariablePopover(){
    variableCreateWindow.setVisible(false);
}