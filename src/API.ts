import { addOutputMessage } from "./OutputSystem";

export function print(inData) {
    addOutputMessage(`${inData}`)
}

export class Vector2{
    x: number
    y: number

    constructor(x: number, y: number){
        this.x = x
        this.y = y
    }
}