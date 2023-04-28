import type { ComponentConstructorOptions } from "svelte";
import type { ToastPosition, ToastType } from "./Types";
import Toast from "./lib/Toast.svelte";
import { genUUID } from "./uuid";

let toasts = {};

export function createToast(text: string, type: ToastType, position: ToastPosition, duration: number = 3000) {

    let id = genUUID()

    let toast = new Toast({
        target: document.getElementById('toasts'),
        props: {
            text: text, 
            position: position, 
            type: type, 
            duration: duration,
        }
    });

    toasts[id] = toast;

    setTimeout(() => {
        toast.Destroy();
        delete toasts[id];
    }, duration);
}