import type Properties from "./lib/Components/Properties.svelte"
import { type FSFile, FS } from "./FileSystem"
import { PropertyTypes } from "./Types"

export let propertiesPanels: Array<Properties> = []

export interface Property {
    name: string
    value: any
    type: PropertyTypes
    isModifiable: boolean
    onChange: (value: any) => void
}
export interface Component {
    name: string
    properties: Array<Property>
}

export function registerPropertiesPanel(output) {
    propertiesPanels.push(output)
}

export function unregisterPropertiesPanel(output) {
    propertiesPanels.splice(propertiesPanels.indexOf(output), 1)
}

export function setProperties(properties: Array<Component>){
    for(let panel of propertiesPanels){
        panel.setProperties(properties)
    }
}

export function getPropertiesOfFile(file: FSFile): Array<Component>{
    let properties: Array<Component> = []

    let path = FS.getPath(file)

    let pathSplit = path.split("/")
    
    // remove the root/ from the path by splicing it on / and removing the first element
    pathSplit.splice(0, 1)

    // rejoin the path
    path = "/" + pathSplit.join("/")
    
    let fileCatagory = {name: "File", properties: [] as Array<Property>}

    fileCatagory.properties.push({name: "Name", value: file.name, type: PropertyTypes.String, isModifiable: false, onChange: (value) => {file.name = value}})
    fileCatagory.properties.push({name: "Path", value: path, type: PropertyTypes.String, isModifiable: false, onChange: (value) => {console.log("Path is not modifiable")}})
    fileCatagory.properties.push({name: "Type", value: file.fileType, type: PropertyTypes.String, isModifiable: false, onChange: (value) => {console.log("Type is not modifiable")}})

    properties.push(fileCatagory)

    // for all the special properties in the file

    console.log(file.components)

    for(let catagory of file.components){
        let catagoryProperties = {name: catagory.name, properties: [] as Array<Property>}

        for(let property of catagory.properties){
            catagoryProperties.properties.push({name: property.name, value: property.value, type: property.type, isModifiable: property.isModifiable, 
                onChange: (value)=>{
                    console.log(file)

                    let catagory = file.components.find((catagory) => catagory.name == catagoryProperties.name)

                    let property = catagory.properties.find((property) => property.name == catagoryProperties.name)

                    property.value = value
                }
            })
        }

        properties.push(catagoryProperties)
    }
    


    return properties
}

export function clearProperties(){
    for(let panel of propertiesPanels){
        panel.clearProperties()
    }
}