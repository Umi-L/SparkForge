import UploadWindow from "./lib/UploadWindow.svelte";

let uploadWindow = new UploadWindow({
    target: document.body,
});

export function showUploadWindow(path: string){
    uploadWindow.setVisible(true, path);
}

export function hideUploadWindow(){
    uploadWindow.setVisible(false, "");
}