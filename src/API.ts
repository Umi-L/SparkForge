import type { QuickJSContext, QuickJSHandle, SuccessOrFail, WeakLifetime } from "quickjs-emscripten";
import { addOutputMessage } from "./OutputSystem";
import { currentEntity, currentVM } from "./globals";
import { keysPressed, type Entity } from "./gameRuntime";

let vm: QuickJSContext = undefined;
let entity: Entity = undefined;

currentEntity.subscribe((_entity) => {
    // console.log("Entity changed");
    entity = _entity as Entity;
})

currentVM.subscribe((_vm) => {
    // console.log("VM changed");
    vm = _vm;
})

export function print(inData) {
    let value = vm.getString(inData);
    addOutputMessage(`${value}`);
    console.log(value);
}

export function moveTo(xin, yin) {
    let x = vm.getNumber(xin);
    let y = vm.getNumber(yin);
    
    // get entity
    entity.setPosition(x, y);
}

export function moveBy(xin, yin) {
    let x = vm.getNumber(xin);
    let y = vm.getNumber(yin);

    console.log(`Moving by ${x}, ${y}`);
    
    entity.setPosition(entity.position.x + x, entity.position.y + y);
}

export function sizeTo(widthin, heightin) {
    let width = vm.getNumber(widthin);
    let height = vm.getNumber(heightin);

    entity.setScale(width, height);
}

export function rotateTo(rotationin) {
    let rotation = vm.getNumber(rotationin);

    entity.setRotation(rotation);
}

export function sizeBy(widthin, heightin) {
    let width = vm.getNumber(widthin);
    let height = vm.getNumber(heightin);

    entity.setScale(entity.scale.x + width, entity.scale.y + height);
}

export function rotateBy(rotationin) {
    let rotation = vm.getNumber(rotationin);

    entity.setRotation(entity.rotation + rotation);
}

export function random(minin, maxin) {
    let min = vm.getNumber(minin);
    let max = vm.getNumber(maxin);

    return vm.newNumber(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function isKeyPressed(keyin){
    let key = vm.getString(keyin);

    // if key in keysPressed
    if (keysPressed.has(key)) {
        return vm.true;
    }
    
    return vm.false;
}


export class Vector2{
    x: number;
    y: number;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
}

export class Color {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number, a: number){
        this.r = r;
        this.g = g;
        this.b = b;
    }
}