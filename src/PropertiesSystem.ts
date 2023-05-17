import type Properties from "./lib/Components/Properties.svelte"
import { type FSFile, FS } from "./MockFS"

export let propertiesPanels: Array<Properties> = []

enum PropertyTypes {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Array = "array",
}

export interface Property {
    name: string
    value: any
    type: PropertyTypes
    isModifiable: boolean
}

export function registerPropertiesPanel(output) {
    propertiesPanels.push(output)
}

export function unregisterPropertiesPanel(output) {
    propertiesPanels.splice(propertiesPanels.indexOf(output), 1)
}

export function setProperties(properties: Array<Property>){
    for(let panel of propertiesPanels){
        panel.setProperties(properties)
    }
}

export function getPropertiesOfFile(file: FSFile): Array<Property>{
    let properties: Array<Property> = []

    let path = FS.getPath(file)

    let pathSplit = path.split("/")
    
    // remove the root/ from the path by splicing it on / and removing the first element
    pathSplit.splice(0, 1)

    // rejoin the path
    path = "/" + pathSplit.join("/")
    

    properties.push({name: "Name", value: file.name, type: PropertyTypes.String, isModifiable: true})
    properties.push({name: "Path", value: path, type: PropertyTypes.String, isModifiable: false})
    properties.push({name: "Type", value: file.fileType, type: PropertyTypes.String, isModifiable: false})

    // for all the special properties in the file

    if (file.fileTypeProperties){
        for(let property of file.fileTypeProperties){
            properties.push({name: property.name, value: property.value, type: property.type, isModifiable: property.isModifiable})
        }
    }


    return properties
}

export function clearProperties(){
    for(let panel of propertiesPanels){
        panel.clearProperties()
    }
}