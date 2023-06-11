import { writable } from "svelte/store";

export let openTabs = writable([]);
export let gameRunning = writable(false);
export let rootScene = writable(null);


// game runtime variables
export let currentVM = writable(null);
export let currentEntity = writable(null);
export let allEntities = writable([]);
export let currentScene = writable(null);