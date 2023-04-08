import './app.css'
import App from './App.svelte'

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
    "name": "properties",
    "col": "3",
    "row": "1/4",
  },
]

const app = new App({
  target: document.getElementById('app'),
})

export default app
