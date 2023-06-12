import { writable, type Writable } from "svelte/store";
import type { FlowDataType } from "./Types";

export let openTabs = writable([]);
export let gameRunning: Writable<boolean> = writable(false);
export let rootScene:Writable<string> = writable(null);
export let currentFlowchart: Writable<string> = writable(null);
export let currentLocalVariables: Writable<Array<string>> = writable(null);

// game runtime variables
export let currentVM = writable(null);
export let currentEntity = writable(null);
export let allEntities = writable([]);
export let currentScene = writable(null);