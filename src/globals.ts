import { writable } from "svelte/store";

export let openTabs = writable([]);
export let gameRunning = writable(false);
export let rootScene = writable(null);