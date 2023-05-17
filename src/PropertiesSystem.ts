import type Properties from "./lib/Components/Properties.svelte"
import { type FSFile, FS } from "./MockFS"

export let propertiesPanels: Array<Properties> = []

export enum PropertyTypes {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Vector2 = "vector2",
    Array = "array",
}

export interface Property {
    name: string
    value: any
    type: PropertyTypes
    isModifiable: boolean
}
export interface Catagory {
    name: string
    properties: Array<Property>
}

export function registerPropertiesPanel(output) {
    propertiesPanels.push(output)
}

export function unregisterPropertiesPanel(output) {
    propertiesPanels.splice(propertiesPanels.indexOf(output), 1)
}

export function setProperties(properties: Array<Catagory>){
    for(let panel of propertiesPanels){
        panel.setProperties(properties)
    }
}

export function getPropertiesOfFile(file: FSFile): Array<Catagory>{
    let properties: Array<Catagory> = []

    let path = FS.getPath(file)

    let pathSplit = path.split("/")
    
    // remove the root/ from the path by splicing it on / and removing the first element
    pathSplit.splice(0, 1)

    // rejoin the path
    path = "/" + pathSplit.join("/")
    
    let fileCatagory = {name: "File", properties: [] as Array<Property>}

    fileCatagory.properties.push({name: "Name", value: file.name, type: PropertyTypes.String, isModifiable: false})
    fileCatagory.properties.push({name: "Path", value: path, type: PropertyTypes.String, isModifiable: false})
    fileCatagory.properties.push({name: "Type", value: file.fileType, type: PropertyTypes.String, isModifiable: false})

    properties.push(fileCatagory)

    // for all the special properties in the file

    if (file.fileTypeProperties){
        for(let catagory of file.fileTypeProperties){
            let catagoryProperties = {name: catagory.name, properties: [] as Array<Property>}

            for(let property of catagory.properties){
                catagoryProperties.properties.push({name: property.name, value: property.value, type: property.type, isModifiable: property.isModifiable})
            }

            properties.push(catagoryProperties)
        }
    }


    return properties
}

export function clearProperties(){
    for(let panel of propertiesPanels){
        panel.clearProperties()
    }
}