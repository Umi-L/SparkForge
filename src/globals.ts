import { writable } from "svelte/store";
import { FileTypes } from "./MockFS";

export let openTabs = writable([{file: "test", type: FileTypes.object}, {file: "test2", type: FileTypes.flowchart}, {file: "test3", type: FileTypes.script}]);