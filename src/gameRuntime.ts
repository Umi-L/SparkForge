import type { QuickJSContext, QuickJSWASMModule } from "quickjs-emscripten";
import { allEntities, currentEntity, currentVM } from "./globals";
import { ERORR } from "./Utils";
import * as PIXI from "pixi.js";
import { NodeTypes } from "./Types";

export let QuickJS: QuickJSWASMModule;
export let app: PIXI.Application;

let entities: Array<Entity> = [];

allEntities.subscribe((_entities) => {
    entities = _entities;
})

export function initQuickJS(quickJS: QuickJSWASMModule){
    QuickJS = quickJS;
}
export function initPIXIApp(_app: PIXI.Application){
    app = _app;
}

export interface Component {
    name: string;
    data: any;
}

export interface spriteComponent extends Component {
    name: "Sprite";
    data: {
        texture: PIXI.Texture;
        sprite: PIXI.Sprite;
        width: number;
        height: number;
    },
}

export interface scriptComponent extends Component {
    name: "Script";
    data: {
        code: string;
        vm?: QuickJSContext;
    }
}

export class Entity {
    components: Array<Component>;
    public id: string;
    public position: PIXI.Point = new PIXI.Point(0, 0);
    public rotation: number = 0;
    public scale: PIXI.Point = new PIXI.Point(1, 1);

    constructor(components: Array<Component>, position: PIXI.Point, rotation: number = 0, scale: PIXI.Point = new PIXI.Point(1, 1)){
        this.id = generateUUID();
        this.components = components;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        this.initComponents();
        this.initComponentListeners();
    }

    initComponentListeners(){
        // foreach component
        for (const component of this.components) {
            // if sprite
            if (component.name == "Sprite"){
                let spriteComponent = component as spriteComponent;

                console.log(spriteComponent)

                spriteComponent.data.sprite.eventMode = 'static';
                
                spriteComponent.data.sprite.on("click", () => {
                    this.callFunction("click");
                    console.log("sprite was clicked")
                });
            }
        }
    }

    initComponents(){
        // foreach component
        for (let component of this.components){
            if (component.name == "Sprite"){
                let spriteComp = component as spriteComponent;
                
                let sprite = new PIXI.Sprite(spriteComp.data.texture);

                spriteComp.data.sprite = sprite;
                
                sprite.width = spriteComp.data.width;
                sprite.height = spriteComp.data.height;

                sprite.position.x = this.position.x;
                sprite.position.y = this.position.y;

                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                
                app.stage.addChild(sprite);

                console.log(spriteComp)
                console.log(sprite)
            }
            else if (component.name == "Script"){
                let scriptComp = component as scriptComponent;
                
                scriptComp.data.vm = newVM();
                attachScriptToVM(scriptComp.data.vm, scriptComp);
                callFuncOnVM(scriptComp.data.vm, "start");
            }
        }
    }

    public dispose(){
        for (const component of this.components) {
            if (component.name == "Script"){
                let scriptComponent = component as scriptComponent;
                
                disposeVM(scriptComponent.data.vm);
            }
        }
    }

    public callFunction(event: string, args: Array<any> = undefined){

        console.log("start of func call " + event + " on vm")
        console.log(this.components)

        currentEntity.update((current) => {
            current = this;
            return current;
        })

        // foreach component
        for (const component of this.components) {
            if (component.name == "Script"){
                let scriptComponent = component as scriptComponent;
                
                currentVM.update((_) => {
                    return scriptComponent.data.vm;
                })

                if (args == undefined){
                    args = [scriptComponent.data.vm.undefined];
                }

                console.log("calling function " + event + " on vm with args ", args)

                callFuncOnVM(scriptComponent.data.vm, event, args);
            }
        }
    }

    public setPosition(x: number, y: number){
        this.position.x = x;
        this.position.y = y;

        // foreach component
        for (const component of this.components) {
            // if sprite
            if (component.name == "Sprite"){
                let spriteComponent = component as spriteComponent;
                
                spriteComponent.data.sprite.position.x = x;
                spriteComponent.data.sprite.position.y = y;
            }
        }
    }

    public setRotation(rotation: number){
        this.rotation = rotation;

        // foreach component
        for (const component of this.components) {
            // if sprite
            if (component.name == "Sprite"){
                let spriteComponent = component as spriteComponent;
                
                spriteComponent.data.sprite.rotation = rotation;
            }
        }
    }

    public setScale(x: number, y: number){
        this.scale.x = x;
        this.scale.y = y;

        // foreach component
        for (const component of this.components) {
            // if sprite
            if (component.name == "Sprite"){
                let spriteComponent = component as spriteComponent;
                
                spriteComponent.data.sprite.scale.x = x;
                spriteComponent.data.sprite.scale.y = y;
            }
        }
    }
}

export function callFuncOnVM(vm: QuickJSContext, functionName: string, args: Array<any> = [vm.undefined]){
    let funcHandle = vm.getProp(vm.global, functionName);
    
    if (funcHandle.value == undefined){
        // ERORR(`Function ${functionName} does not exist!`);
        return;
    }

    console.log("calling function " + functionName + " on vm with args ", args)

    // create handles for args
    let argHandles = args.map((arg) => {
        if (typeof arg == "string"){
            return vm.newString(arg);
        }
        else if (typeof arg == "number"){
            return vm.newNumber(arg);
        }
        return vm.newString(arg);

    });

    // call with args
    let result = vm.callFunction(funcHandle, vm.undefined, ...argHandles);
    
    if (result.error){
        // console.error(vm.dump(result.error));
        result.error.dispose();
    }
    
    funcHandle.dispose();
}

export function attachScriptToVM(vm: QuickJSContext, script: scriptComponent){
    let funcHandle = vm.evalCode(script.data.code);
    
    if (funcHandle.error){
        console.error(vm.dump(funcHandle.error));
        funcHandle.error.dispose();
        return;
    }
}

export function generateUUID(){
    // ensure unique id
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // check if id is already used
    for (const entity of entities) {
        if (entity.id == id){
            return generateUUID();
        }
    }
    
    return id;
}


function newVM(){
    let vm = QuickJS.newContext();
    
    //foreach node definition
    for (const nodeType in NodeTypes) {
        const node = NodeTypes[nodeType];
        
        if (node.func != undefined){
            // expose it to the vm
            let funcHandle = vm.newFunction(node.func.name, (...args) => node.func(...args));
            vm.setProp(vm.global, node.func.name, funcHandle);
            funcHandle.dispose();
            
            // console.log(node.func.name, "exposed to vm")
        }
    }

    return vm
}

function disposeVM(vm: QuickJSContext){
    vm.dispose();
}