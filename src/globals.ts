import { writable } from "svelte/store";
import { FileTypes } from "./MockFS";

export let openTabs = writable([{file: "test", type: FileTypes.object}, {file: "test2", type: FileTypes.object}]);