<script lang="ts">
    import Node from "./lib/Node.svelte";
    import BooleanInput from "./lib/TestComponents/BooleanInput.svelte";
    import NumberInput from "./lib/TestComponents/NumberInput.svelte";
    import StringInput from "./lib/TestComponents/StringInput.svelte";
    import ChoiceInput from "./lib/TestComponents/ChoiceInput.svelte";
    import { NodeTypes, TestPropTypes } from "./Types";

    export let ElementToTest: string = "Node";
    let classToTest: any;
    let componentToTest: any;
    let sidebar: HTMLDivElement;
    let props: any = {};

    async function loadComponent() {
        const component = await import(`./lib/${ElementToTest}.svelte`);
        const testData = await import(`./lib/${ElementToTest}.test.ts`);
        
        return [component.default, testData];
    }

    function createStringInput(propName: string){
        new StringInput({
            target: sidebar,
            props: {
                propName: propName,
                callback: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;

                    // update props
                    props[propName] = value;
                    redrawComponent();
                }
            }
        })
    }

    function createNumberInput(propName: string){
        new NumberInput({
            target: sidebar,
            props: {
                propName: propName,
                callback: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;

                    // update props
                    props[propName] = value;
                    redrawComponent();
                }
            }
        })
    }

    function createBooleanInput(propName: string){
        new BooleanInput({
            target: sidebar,
            props: {
                propName: propName,
                callback: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;

                    // update props
                    props[propName] = value;
                    redrawComponent();
                }
            }
        })
    }

    function createChoiceInput(propName: string, options: any[]){
        new ChoiceInput({
            target: sidebar,
            props: {
                propName: propName,
                choices: options,
                callback: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;

                    console.log(value)

                    // update props
                    props[propName] = options.find(option => option.name == value);
                    redrawComponent();
                }
            }
        })
    }

    function redrawComponent(){
        componentToTest.$destroy();
        componentToTest = new classToTest({
            target: document.querySelector(".test-container"),
            props: props
        });
    }

    loadComponent().then((data) => {

        const component = data[0];
        const testData = data[1];
        const propDefs = testData.possibleProps;

        classToTest = component;

        const testContainer = document.querySelector(".test-container");

        let propKeys = Object.keys(propDefs);
        propKeys.forEach(key => {

            console.log(propDefs);
            console.log(key)

            if (propDefs[key].type == TestPropTypes.String) {
                props[key] = "";
                createStringInput(key);
            } else if (propDefs[key].type == TestPropTypes.Number) {
                props[key] = 0;
                createNumberInput(key);
            } else if (propDefs[key].type == TestPropTypes.Boolean) {
                props[key] = false;
                createBooleanInput(key);
            } else if (propDefs[key].type == TestPropTypes.Choice) {
                props[key] = propDefs[key].options[0];
                createChoiceInput(key, propDefs[key].options)
            }
        });

        componentToTest = new classToTest({
            target: testContainer,
            props: props
        });

    });

    
</script>

<main class="main">

    <div class="sidebar" bind:this={sidebar}></div>

    <div class="test-container">
    </div>
</main>

<style>
    .test-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
    }

    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        /* height: 100%; */
        width: 300px;
        background-color: var(--midground-color);

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 10px;

        padding: 10px;

        border-radius: var(--general-border-radius);

        margin: 10px;

        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2);
    }

    .main{
        height: 100vh;
        width: 100vw;
    }
</style>
