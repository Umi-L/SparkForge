import type { ComponentConstructorOptions } from "svelte";
import type { ToastPosition, ToastType } from "./Types";
import Toast from "./lib/Toast.svelte";
import { genUUID } from "./uuid";

let toasts = [];

export function createToast(text: string, type: ToastType, position: ToastPosition, duration: number = 3000) {

    let toast = {
        target: document.getElementById('toasts'),
        props: {
            text: text, 
            position: position, 
            type: type, 
            duration: duration,
        }
    };

    // add toast to toasts
    toasts.push(toast)

    // if this is the only toast, run it
    if(toasts.length == 1){

        // create toast
        let toastElement = new Toast(toast);

        setTimeout(() => {
            toastElement.Destroy();
            runNextToast();
        }, duration);
    }
}

function runNextToast(){
    // pop first
    toasts.shift();

    // if there is a next toast, run it
    if(toasts.length > 0){

        // create toast
        let toastElement = new Toast(toasts[0]);

        setTimeout(() => {
            toastElement.Destroy();
            runNextToast();
        }, toasts[0].props.duration);
    }
    
}