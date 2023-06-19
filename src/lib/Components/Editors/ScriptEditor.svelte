<script lang="ts">
	import { onMount } from "svelte";
	import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
	import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
	import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
	import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
	import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
	import { FS, type FSFile } from "../../../FileSystem";
	import type { ScriptFileContent } from "../../../Types";
	
	export let file: string;
	
	export const onResize=()=>{
		resize();
	}

	export const onSelect = () => {
		if (editor) {
			resize();
		}
	};
	
	let hasLoaded = false;

	let divEl;
	let editor;
	let Monaco;
	let content = `// this is the start function
// it is ran when the object is created
function start(){
	// . . .
}

// this is the update function
// it is ran every frame
function update(){
	// . . .
}`;
	onMount(async () => {
		
		// load file content
		load();
		
		self.MonacoEnvironment = {
			getWorker: function (_moduleId, label) {
				if (label === "json") {
					return new jsonWorker();
				}
				if (label === "css" || label === "scss" || label === "less") {
					return new cssWorker();
				}
				if (label === "html" || label === "handlebars" || label === "razor") {
					return new htmlWorker();
				}
				if (label === "typescript" || label === "javascript") {
					return new tsWorker();
				}
				return new editorWorker();
			},
		};
		Monaco = await import("monaco-editor");
		editor = Monaco.editor.create(divEl, {
			value: content,
			language: "javascript",
			theme: "sparkforge-theme",
		});
		
		editor.onDidCompositionStart = () =>{
			hasLoaded = true;
		}
		
		// on value change
		editor.onDidChangeModelContent(() => {
			const text = editor.getValue();
			
			let data = {
				code: text,
			} as ScriptFileContent;
			
			FS.writeData(file, data);
		});
		generateTheme();
		return () => {
			editor.dispose();
		};
	});
	
	function resize(){
		editor.layout({ width: 0, height: 0 });
		window.requestAnimationFrame(() => {
			const rect = divEl.parentElement.getBoundingClientRect();
			editor.layout({ width: rect.width, height: rect.height });
		});
		
		
	}
	
	function generateTheme(){
		
		let style = getComputedStyle(document.documentElement);
		
		let foreground = style.getPropertyValue('--foreground-color').replaceAll(' ', '');
		let background = style.getPropertyValue('--midground-color').replaceAll(' ', '');
		
		
		let base = 'vs';
		// match dark mode media query
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			base = 'vs-dark';
		}
		
		Monaco.editor.defineTheme("sparkforge-theme", {
			base: base,
			inherit: true,
			rules: [],
			colors: {
				// "editor.foreground": foreground,
				"editor.background": background,
				
			},
		});
		Monaco.editor.setTheme("sparkforge-theme");
	}

	function load(){
		let fsFile = FS.getAtPath(file) as FSFile;
		if (fsFile) {

			let fileContent = fsFile.content as ScriptFileContent;
			
			if (fileContent.code && fileContent.code.length > 0)
				content = fileContent.code
		}
	}
</script>

<div class="editor-container">
	
	<div class="loading-container" class:visible={!hasLoaded}>
		<!-- This loader was taken from https://loading.io/css/ under the CC0 license -->
		<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
	</div>
	
	<div class="editor" bind:this={divEl} />
</div>
<svelte:window
on:resize={resize}
/>

<style>

	.visible{
		display: flex !important;
	}

	.loading-container{
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;

		display: none;
	}
	
	.editor {
		height: 100%;
		width: 100%;
	}
	
	.editor-container {
		height: 100%;
		width: 100%;
	}
	
	.lds-ellipsis {
		display: inline-block;
		position: relative;
		width: 80px;
		height: 80px;
	}
	.lds-ellipsis div {
		position: absolute;
		top: 33px;
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: var(--background-color);
		animation-timing-function: cubic-bezier(0, 1, 1, 0);
	}
	.lds-ellipsis div:nth-child(1) {
		left: 8px;
		animation: lds-ellipsis1 0.6s infinite;
	}
	.lds-ellipsis div:nth-child(2) {
		left: 8px;
		animation: lds-ellipsis2 0.6s infinite;
	}
	.lds-ellipsis div:nth-child(3) {
		left: 32px;
		animation: lds-ellipsis2 0.6s infinite;
	}
	.lds-ellipsis div:nth-child(4) {
		left: 56px;
		animation: lds-ellipsis3 0.6s infinite;
	}
	@keyframes lds-ellipsis1 {
		0% {
			transform: scale(0);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes lds-ellipsis3 {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(0);
		}
	}
	@keyframes lds-ellipsis2 {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(24px, 0);
		}
	}
	
</style>
