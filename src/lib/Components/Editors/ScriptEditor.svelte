<script lang="ts">
	import { onMount } from "svelte";
	import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
	import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
	import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
	import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
	import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
	
	export let file: string;
	export let content;

	export const onResize = resize;
	
	let subscriptions = [];
	
	let divEl;
	let editor;
	let Monaco;
	onMount(async () => {
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
			value: "// Write your code here",
			language: "javascript",
			theme: "vs-light",
		});
		editor.onDidChangeModelContent(() => {
			const text = editor.getValue();
			subscriptions.forEach((sub) => sub(text));
		});
		content = {
			subscribe(func) {
				subscriptions.push(func);
				return () => {
					subscriptions = subscriptions.filter((sub) => sub != func);
				};
			},
			set(val) {
				editor.setValue(val);
			},
		};
		console.log(editor);
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
</script>

<div class="editor-container">
	<div class="editor" bind:this={divEl} />
</div>
<svelte:window
on:resize={resize}
/>

<style>

	:global(.monaco-editor){
		--vscode-editorGutter-background: var(--midground-color) !important;
		--vscode-editor-background: var(--midground-color) !important;
		--vscode-input-background: var(--midground-color) !important;
		--vscode-dropdown-background: var(--midground-color) !important;
		--vscode-editorStickyScroll-background: var(--midground-color) !important;
		--vscode-editorStickyScrollHover-background: var(--midground-color) !important;
		--vscode-editorHoverWidget-background: var(--midground-color) !important;
		--vscode-checkbox-background: var(--midground-color) !important;
		--vscode-breadcrumb-background: var(--midground-color) !important;
		--vscode-editorMarkerNavigation-background: var(--midground-color) !important;
		--vscode-menu-background: var(--midground-color) !important;
		--vscode-peekViewEditor-background: var(--midground-color) !important;
		--vscode-button-foreground: var(--midground-color) !important;
		--vscode-button-secondaryForeground: var(--midground-color) !important;
		--vscode-list-activeSelectionForeground: var(--midground-color) !important;
		--vscode-quickInputList-focusForeground: var(--midground-color) !important;
		--vscode-menu-selectionForeground: var(--midground-color) !important;
		--vscode-editorSuggestWidget-selectedForeground: var(--midground-color) !important;
	}

	.editor {
		height: 100%;
		width: 100%;
	}
	
	.editor-container {
		height: 100%;
		width: 100%;
	}
</style>
