<script lang="ts">
	import { onMount } from "svelte";
	import { getQuickJS, type QuickJSContext, type QuickJSWASMModule } from "quickjs-emscripten";
	import { NodeTypes, ToastPosition, ToastType, type SceneFileContent, type ISceneObject, type SpriteFileContent, type ScriptFileContent, type FlowchartFileContent } from "../../Types";
	import * as PIXI from "pixi.js";
	import { allEntities, currentEntity, gameRunning, rootScene } from "../../globals";
	import { FileTypes, FS, type FSFile } from "../../FileSystem";
	import { createToast } from "../../ToastManager";
	import Toast from "../Toast.svelte";
	import { ERORR, getProperty } from "../../Utils";
  	import { app, Entity, initPIXIApp, initQuickJS, QuickJS, type spriteComponent } from "../../gameRuntime";
		
	let gameContainer: HTMLDivElement;
	
	let resizeFunc: Function;
	
	let entities: Array<Entity> = [];

	allEntities.subscribe((newEntities) => {
		entities = newEntities;
	})
		
		let baseScene: string;
		rootScene.subscribe((scene) => {
			baseScene = scene;
		});
		
		gameRunning.subscribe((running) => {
			if (running){
				run();
			} else {
				if (!app)
					return
				app.ticker.stop();
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
			initQuickJS(await getQuickJS());
			
			let color = getComputedStyle(document.documentElement).getPropertyValue('--midground-color');
			
			// ----- init pixi -----
			initPIXIApp(new PIXI.Application({
				backgroundColor: color,
			}));
			
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

			// add keydown listener
			window.addEventListener("keydown", (e) => {
				// foreach entity
				for (const entity of entities) {
					entity.callFunction("keyDown", [e.key]);
				}
			})

			// add keyup listener
			window.addEventListener("keyup", (e) => {
				// foreach entity
				for (const entity of entities) {
					entity.callFunction("keyUp", [e.key]);
				}
			})
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
				entity.callFunction("start");
			}
			
			// main loop
			app.ticker.add((dt) => {
				// foreach entity
				for (const entity of entities) {
					entity.callFunction("update");


				}
			})
			
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
				
				allEntities.update((entities) => {
					entities.push(entity);
					return entities;
				})
			}
		}
		
		function objectToEntity(object: ISceneObject): Entity {
			console.log("is being entitied", object)
			let components = [];

			let FSObject = FS.getAtPath(object.object) as FSFile;
			
			// foreach component
			for (const component in FSObject.components) {
				const currentComponent = FSObject.components[component];
				
				if (currentComponent.name == "Sprite"){

					let spritePath = getProperty(currentComponent, "Sprite");
			
					if (!spritePath){
						ERORR(`Sprite component in object ${FSObject.name} has no sprite!`);
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
					} as spriteComponent;
					
					components.push(spriteComponent);
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
						
						components.push(scriptComponent);
					}
				}
			}

			let entity = new Entity(components, new PIXI.Point(object.position.x, object.position.y));
			
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
	