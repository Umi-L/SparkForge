<script lang="ts">
	import { onMount } from "svelte";
	import { getQuickJS, type QuickJSContext, type QuickJSWASMModule } from "quickjs-emscripten";
	import { NodeTypes, ToastPosition, ToastType, type SceneFileContent, type ISceneObject, type SpriteFileContent, type ScriptFileContent, type FlowchartFileContent } from "../../Types";
	import * as PIXI from "pixi.js";
	import { currentVM, gameRunning, rootScene } from "../../globals";
	import { FileTypes, FS, type FSFile } from "../../FileSystem";
	import { createToast } from "../../ToastManager";
	import Toast from "../Toast.svelte";
	import { getProperty } from "../../Utils";
  import { exportedClasses } from "../../API";
	
	interface Component {
		name: string;
		data: any;
	}
	
	interface spriteComponent extends Component {
		name: "Sprite";
		data: {
			texture: PIXI.Texture;
			width: number;
			height: number;
		}
	}

	interface scriptComponent extends Component {
		name: "Script";
		data: {
			code: string;
		}
	}
	
	interface Entity {
		id: string;
		components: Array<Component>;
	}
		
	let gameContainer: HTMLDivElement;
	
	let resizeFunc: Function;
	let app: PIXI.Application;
	let QuickJS: QuickJSWASMModule;
	
	let entities: Array<Entity> = [];
		
		let baseScene: string;
		rootScene.subscribe((scene) => {
			baseScene = scene;
		});
		
		gameRunning.subscribe((running) => {
			if (running){
				run();
			}
		});

		export function onSelect(){
			resizeFunc();

			requestAnimationFrame(() =>{
				resizeFunc();
			})
		}
		
		export function onResize(){
			resizeFunc();
		}
		
		export function onFocus(){
			setTimeout(() => {
				resizeFunc();
			}, 0);
		}
		
		async function init() {
			// ----- init sandbox -----
			QuickJS = await getQuickJS();
			
			let color = getComputedStyle(document.documentElement).getPropertyValue('--midground-color');
			
			// ----- init pixi -----
			app = new PIXI.Application({
				backgroundColor: color,
			});
			
			resizeFunc = () => {
				let width = gameContainer.offsetWidth;
				let height = gameContainer.offsetHeight;
				
				app.renderer.resize(width, height);
			}
			
			gameContainer.appendChild(app.view as any);
			
			// add onresize listener
			gameContainer.addEventListener("resize", resizeFunc as any)
			
			setTimeout(() => {
				resizeFunc();
			}, 0);
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

			currentVM.update((_) => {
				return vm;
			})

			return vm
		}

		function disposeVM(vm: QuickJSContext){
			vm.dispose();
		}
		
		export function run(){
			// reset pixi
			app.stage.removeChildren();
			
			// check if scene exists
			let sceneFile = FS.getAtPath(baseScene) as FSFile;
			
			if (!sceneFile){
				createToast(`Scene ${baseScene.replace("root", "")} does not exist!`, ToastType.Error, ToastPosition.BottomRight);
				return;
			}
			
			console.log(sceneFile)
			
			// load scene
			loadScene(sceneFile);

			// start call
			// foreach entity
			for (const entity of entities) {
				callEventOnEntity(entity, "start")
			}
			
			// main loop
			app.ticker.add((dt) => {
				// foreach entity
				for (const entity of entities) {
					callEventOnEntity(entity, "update")
				}
			})
			
		}

		function callFuncOnVM(vm: QuickJSContext, functionName: string){
			let funcHandle = vm.getProp(vm.global, functionName);
			
			if (funcHandle.value == undefined){
				ERORR(`Function ${functionName} does not exist!`);
				return;
			}
			
			let result = vm.callFunction(funcHandle, vm.undefined, vm.undefined);
			
			if (result.error){
				console.error(vm.dump(result.error));
				result.error.dispose();
			}
			
			funcHandle.dispose();
		}

		function attachScriptToVM(vm: QuickJSContext, script: scriptComponent){
			let funcHandle = vm.evalCode(script.data.code);
			
			if (funcHandle.error){
				console.error(vm.dump(funcHandle.error));
				funcHandle.error.dispose();
				return;
			}
		}

		function callEventOnEntity(entity: Entity, event: string){
			// foreach component
			for (const component of entity.components) {
				if (component.name == "Script"){
					let scriptComponent = component as scriptComponent;
					
					let vm = newVM();
					attachScriptToVM(vm, scriptComponent);
					callFuncOnVM(vm, event);
					disposeVM(vm);
				}
			}
		}
		
		function loadScene(scene: FSFile){
			let content = scene.content as SceneFileContent;
			
			if (!content){
				ERORR(`Scene ${scene} is empty!`);
				return;
			}
			
			let objects = content.objects;
			
			if (!objects){
				ERORR(`Scene ${scene} has no objects!`);
				return;
			}

			// set background color
			app.renderer.background.color = content.backgroundColor;
			
			// foreach object
			for (const object of objects) {
				let entity = objectToEntity(object);
				
				entities.push(entity);
				
				// foreach component
				for (let component of entity.components){
					if (component.name == "Sprite"){
						let spriteComponent = component as spriteComponent;
						
						let sprite = new PIXI.Sprite(spriteComponent.data.texture);
						
						sprite.width = spriteComponent.data.width;
						sprite.height = spriteComponent.data.height;

						sprite.position.x = object.position.x;
						sprite.position.y = object.position.y;
						
						app.stage.addChild(sprite);

						console.log(spriteComponent)
						console.log(sprite)
					}
					else if (component.name == "Script"){

					}
				}
			}
		}
		
		function objectToEntity(object: ISceneObject): Entity {
			let entity: Entity = {
				id: generateUUID(),
				components: [],
			};

			
			
			// foreach component
			for (const component in object.object.components) {
				const currentComponent = object.object.components[component];
				
				if (currentComponent.name == "Sprite"){

					let spritePath = getProperty(currentComponent, "Sprite");
			
					if (!spritePath){
						ERORR(`Sprite component in object ${object.object.name} has no sprite!`);
						return;
					}
					
					let spriteFile = FS.getAtPath(spritePath.value) as FSFile;
					
					if (!spriteFile){
						ERORR(`Sprite ${spritePath.value} does not exist!`);
						return;
					}

					let spriteTexture = spriteFileToTexture(spriteFile, 0);
					
					
					// create sprite component
					let spriteComponent = {
						name: "Sprite",
						data: {
							texture: spriteTexture,
							width: object.scale.width,
							height: object.scale.height,
						}
					}
					
					entity.components.push(spriteComponent);
				}
				else if (currentComponent.name == "Scripts"){
					// foreach property
					for (let property of currentComponent.properties){
						// get script file
						let scriptFile = FS.getAtPath(property.value) as FSFile;
						
						if (!scriptFile){
							ERORR(`Script ${property.value} does not exist!`);
							return;
						}

						let code: string;

						if (scriptFile.fileType == FileTypes.script){

							// get script content
							let scriptContent = scriptFile.content as ScriptFileContent;

							if (!scriptContent){
								ERORR(`Script ${property.value} is empty!`);
								return;
							}
							
							code = scriptContent.code;
						} else if (scriptFile.fileType == FileTypes.flowchart){
							// get script content
							let flowchartContent = scriptFile.content as FlowchartFileContent;

							if (!flowchartContent){
								ERORR(`flowchart ${property.value} is empty!`);
								return;
							}
							
							code = flowchartContent.compiledCode;
						} else {
							ERORR(`Script ${property.value} is not a script file!`);
							return;
						}
						
						
						
						// create script component
						let scriptComponent = {
							name: "Script",
							data: {
								code: code,
							}
						}
						
						entity.components.push(scriptComponent);
					}
				}
			}
			
			return entity;
		}

		function spriteFileToTexture(spriteFile: FSFile, frame:number): PIXI.Texture {
			
			let spriteContent = spriteFile.content as SpriteFileContent;
			
			if (!spriteContent){
				ERORR(`Sprite ${spriteFile.name} is empty!`);
				return;
			}

			let frames = spriteContent.frames;

			if (!frames){
				ERORR(`Sprite ${spriteFile.name} has no frames!`);
				return;
			}

			let frameData = frames[frame];

			if (!frameData){
				ERORR(`Sprite ${spriteFile.name} has no frame ${frame}!`);
				return;
			}

			let frameImageFile = FS.getAtPath(frameData.path) as FSFile;

			if (!frameImageFile){
				ERORR(`Sprite ${spriteFile.name} has no frame ${frame}!`);
				return;
			}

			let frameImageContent = frameImageFile.content;

			if (!frameImageContent){
				ERORR(`Sprite ${spriteFile.name} has no frame ${frame}!`);
				return;
			}

			let frameDataUrl = frameImageContent["data"];

			if (!frameDataUrl){
				ERORR(`Sprite ${spriteFile.name} has no frame ${frame}!`);
				return;
			}
			
			let spriteTexture = PIXI.Texture.from(frameDataUrl);

			return spriteTexture;
		}
		
		function generateUUID(){
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
		
		function ERORR(text: string){
			console.error(text);
			createToast(text, ToastType.Error, ToastPosition.BottomRight);
		}
		
		onMount(init);
	</script>
	
	<div id="game-container" bind:this={gameContainer}/>
	
	<style>
		#game-container {
			width: 100%;
			height: 100%;
			overflow:hidden;
		}
	</style>
	