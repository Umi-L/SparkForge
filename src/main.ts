import './app.css'
import App from './App.svelte'
import Test from './Test.svelte'

export let panels = []

export let panelGridPositions = [
  {
    "name": "workspace",
    "col": "2",
    "row": "1/3",
  },
  {
    "name": "output",
    "col": "2",
    "row": "3/4",
  },
  {
    "name": "toolbox",
    "col": "1",
    "row": "1/4",
  },
  {
    "name": "explorer",
    "col": "3",
    "row": "2/4",
  },
  {
    "name": "properties",
    "col": "3",
    "row": "1/2",
  },
]

// hashmap of HTML elements and their parent components
export let elementReferenceTable = new Map<Element, any>();

export function registerElement(domElement: Element, element: any) {

  // console.log("registering element: " + domElement + " to " + element)

  elementReferenceTable.set(domElement, element);
}

export function getElementFromDomElement(domElement: Element) {

  // console.log("getting element from dom element: " + domElement)

  return elementReferenceTable.get(domElement);
}

export function unregisterElement(element: any) {
  
    // console.log("unregistering element: " + element)
  
    elementReferenceTable.delete(element);
}

const app = new App({
  target: document.getElementById('app'),
})

// const app = new Test({
//   target: document.getElementById('app'),
// })

export default app
