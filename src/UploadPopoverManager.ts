import UploadWindow from "./lib/UploadWindow.svelte";

let uploadWindow = new UploadWindow({
    target: document.body,
});

export function showUploadWindow(){
    uploadWindow.setVisible(true);
}

export function hideUploadWindow(){
    uploadWindow.setVisible(false);
}