import type Output from "./lib/Components/Output.svelte"

export let outputs: Array<Output> = []

export enum OutputTypes {
    Error = "error",
    Info = "info",
    Warning = "warning",
    Default = "default"
}

export interface OutputMessage {
    type: string
    message: string
}

export function registerOutput(output) {
    outputs.push(output)
}

export function unregisterOutput(output) {
    outputs.splice(outputs.indexOf(output), 1)
}

export function addOutputMessage(message: string, type: OutputTypes = OutputTypes.Default){
    for(let output of outputs){
        output.addMessage({type: type, message: message})
    }
}