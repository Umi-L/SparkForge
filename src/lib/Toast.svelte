<script lang="ts">
  import { onMount } from "svelte";
  import type { ToastPosition, ToastType } from "../Types";

    export let text: string;
    export let duration: number;
    export let position: ToastPosition;
    export let type: ToastType;

    const styles = getComputedStyle(document.documentElement);

    let toastBody: HTMLDivElement;

    let appearing = true;
    let disappearing = false;

    onMount(() => {
        // set color of toast depending on type
        switch (type){
            case "error":
                toastBody.style.backgroundColor = styles.getPropertyValue('--error-toast-color');
                break;
            case "warning":
                toastBody.style.backgroundColor = styles.getPropertyValue('--warning-toast-color');
                break;
            case "success":
                toastBody.style.backgroundColor = styles.getPropertyValue('--success-toast-color');
                break;
            case "info":
                toastBody.style.backgroundColor = styles.getPropertyValue('--info-toast-color');
                break;
        }

        // set position of toast
        switch (position){
            case "top-left":
                toastBody.style.top = "10px";
                toastBody.style.left = "10px";
                break;
            case "top-right":
                toastBody.style.top = "10px";
                toastBody.style.right = "10px";
                break;
            case "bottom-left":
                toastBody.style.bottom = "10px";
                toastBody.style.left = "10px";
                break;
            case "bottom-right":
                toastBody.style.bottom = "10px";
                toastBody.style.right = "10px";
                break;
        }

    });

    export function Destroy(){
        setTimeout(() => {
            toastBody.remove();
        }, 400);

        disappearing = true;
        appearing = false;
    }

    

</script>



<div bind:this={toastBody} class="toast-body" class:appear={appearing} class:disappear={disappearing}>
    <p>{text}</p>
</div>



<style>
    .toast-body{
        position: absolute;
        padding: 10px;
        border-radius: var(--general-border-radius);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(0, 0, 0, 0.2);
        transition: 0.5s;

        /* easing */
        transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0);
    }

    .appear{
        animation: slideInFromBottom 0.5s;
    }

    .disappear{
        animation: slideOutToBottom 0.5s;
    }

    @keyframes slideInFromBottom {
        0% {
            transform: translateY(calc(100% + 50px));
        }
        100% {
            transform: translateY(0px);
        }
    }

    @keyframes slideOutToBottom {
        0% {
            transform: translateY(0px);
        }
        100% {
            transform: translateY(calc(100% + 50px));
        }
    }
    
</style>