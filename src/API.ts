import type { QuickJSContext, QuickJSHandle, SuccessOrFail, WeakLifetime } from "quickjs-emscripten";
import { addOutputMessage } from "./OutputSystem";
import { currentVM } from "./globals";

let vm: QuickJSContext = undefined;

currentVM.subscribe((_vm) => {
    console.log("VM changed")
    vm = _vm
})

export function print(inData) {
    let value = vm.getString(inData)
    addOutputMessage(`${value}`)
    console.log(inData)
    console.log(value)
    // inData.dispose()
}

export class Vector2{
    x: number
    y: number

    constructor(x: number, y: number){
        this.x = x
        this.y = y
    }
}