import type { Component } from "./PropertiesSystem"
import { PropertyTypes, type FlowchartFileContent, NodeTypes } from "./Types"

export interface FSFile{
    type: "file"
    name: string
    fileType: FileTypes
    components: Array<Component>
    content: object
    parent: FSDirectory
    renaming?: boolean
}

export interface FSDirectory{
    type: "directory"
    name: string
    children: Array<FSFile|FSDirectory>
    parent?: FSDirectory
    open?: boolean
    renaming?: boolean
}

export enum FileTypes{
    object = "object",
    sprite = "sprite",
    scene = "scene",
    script = "script",
    flowchart = "flowchart",

    // image types
    png = "png",
    jpg = "jpg",
    jpeg = "jpeg",
    gif = "gif",

    // json
    json = "json",
}

export const creatableFileTypes = [
    FileTypes.object,
    FileTypes.sprite,
    FileTypes.scene,
    FileTypes.script,
    FileTypes.flowchart,
]

export let fileTypeDefaultComponents = {
    object: [
        {name: "Sprite", properties: [
            {name: "Sprite", value: "", type: PropertyTypes.Sprite, isModifiable: true},
        ]},
        {name: "Scripts", properties: []}
    ] as Array<Component>,
    sprite: [
        {name: "Image", properties: [
            {name: "Image", value: "", type: PropertyTypes.Image, isModifiable: true},
        ]}
    ] as Array<Component>
}

export function getFileTypeIcon(type: FileTypes): string{
    switch (type){
        case FileTypes.object:
            return "mdi-cube-outline";
        case FileTypes.scene:
            return "mdi:clapperboard-outline";
        case FileTypes.script:
            return "mdi:script-outline";
        case FileTypes.flowchart:
            return "fluent:flowchart-20-regular";
        case FileTypes.sprite:
            return "material-symbols:image-outline";
        case FileTypes.png:
            return "mdi-file-image-outline";
        case FileTypes.jpg:
            return "mdi-file-image-outline";
        case FileTypes.jpeg:
            return "mdi-file-image-outline";
        case FileTypes.gif:
            return "mdi-file-image-outline";
        case FileTypes.json:
            return "mdi-code-json";
        default:
            return "mdi-file-document-outline";
    }
}



class FileSystem{
    public root: FSDirectory = {name: "root", type: "directory", children: []}
    updateCallbacks: Array<() => void> = []

    constructor(dirs: Array<FSDirectory>){
        this.root.children = dirs

        // set all parents to root
        this.root.children.forEach(c => {
            c.parent = this.root
        });
    }

    public registerUpdateCallback(callback: () => void){
        this.updateCallbacks.push(callback)
    }

    public update(){
        this.updateCallbacks.forEach(c => c())
    }

    public getPath(item: FSFile | FSDirectory): string{
        let path = item.name
        let parent = item.parent
        while(parent){
            path = parent.name + "/" + path
            parent = parent.parent
        }
        return path
    }

    public getAtPath(path: string): FSDirectory | FSFile{
        let pathParts = path.split("/")
        let head: FSDirectory | FSFile = this.root;

        // remove all empty parts
        pathParts = pathParts.filter(p => p != "")

        if (pathParts.length == 1) return head

        for(let i = 1; i < pathParts.length; i++){
            let nextDir = (head as FSDirectory).children.find(d => d.name == pathParts[i])
            if(!nextDir) return null
            head = nextDir
        }

        return head
    }

    public writeData(path: string, data: object){
        let file = this.getAtPath(path) as FSFile

        if (file == null) {
            console.error("file not found", path)
            return
        }

        file.content = data
    }

    public setOpen(path: string, open: boolean){
        let dir = this.getAtPath(path) as FSDirectory
        dir.open = open
    }

    public setRenaming(path: string, renaming: boolean){
        let item = this.getAtPath(path)
        item.renaming = renaming
    }

    public getAllOfType(type: FileTypes | Array<FileTypes>): Array<FSFile>{
        let files = []
        let search = (dir: FSDirectory) => {
            dir.children.forEach(c => {
                if(c.type == "directory") search(c)
                
                if(c.type == "file"){
                    if(Array.isArray(type)){
                        if(type.includes(c.fileType)) files.push(c)
                    }else{
                        if(c.fileType == type) files.push(c)
                    }
                }
            })
        }
        search(this.root)
        return files
    }

    public addFile(path: string, file: FSFile){
        let parent = this.getAtPath(path) as FSDirectory

        // if the file's type is in the fileTypeDefaultComponents object, add those properties to the file
        if(fileTypeDefaultComponents[file.fileType] && file.components.length == 0){
            file.components = fileTypeDefaultComponents[file.fileType];
        }

        // if the file's name already exists in the parent, add a number to the end and increment it until it doesn't
        let name = file.name
        let i = 1
        while(parent.children.find(c => c.name == name)){
            name = file.name + i
            i++
        }
        file.name = name

        // set the file's parent
        file.parent = parent
        
        parent.children.push(file)

        // make parent open
        parent.open = true

        this.update();
    }

    public addDir(path: string, dir: FSDirectory){


        let parent = this.getAtPath(path) as FSDirectory


        dir.parent = parent

        // if the dir's name already exists in the parent, add a number to the end and increment it until it doesn't
        let name = dir.name
        let i = 1
        while(parent.children.find(c => c.name == name)){
            name = dir.name + i
            i++
        }
        dir.name = name

        parent.children.push(dir)

        this.update();
    }

    public move(itemToMove:string, destination:string){
        let item = this.getAtPath(itemToMove);
        let destinationDir = this.getAtPath(destination);

        if (destinationDir.type == "file"){
            destinationDir = destinationDir.parent
        }

        // if the item is a directory, make sure the destination isn't a child itself
        if(item.type == "directory"){
            let dir = item as FSDirectory
            if(dir.children.find(c => c == destinationDir)){
                console.error("can't move a directory into itself")
                return
            }
        }

        // remove the item from its parent
        if(item.parent){
            let parent = item.parent
            parent.children.splice(parent.children.indexOf(item), 1)
        } else{
            this.root.children.splice(this.root.children.indexOf(item), 1)
        }

        item.parent = destinationDir
        destinationDir.children.push(item)
        

        this.update();
    }

    public rename(path: string, newName: string){
        let item = this.getAtPath(path)

        // if name has slashes, remove them
        newName = newName.replace(/\//g, "")

        item.name = newName

        this.update();
    }

    public delete(path: string){
        let item = this.getAtPath(path)

        if (item.parent){
            if(item.type == "directory"){
                let dir = item as FSDirectory
                let parent = dir.parent
                parent.children.splice(parent.children.indexOf(dir), 1)
            }
            else{
                let file = item as FSFile
                let parent = file.parent
                parent.children.splice(parent.children.indexOf(file), 1)
            }
        } else{
            let dir = item as FSDirectory
            this.root.children.splice(this.root.children.indexOf(dir), 1)
        }

        this.update();
    }

    public duplicate(path: string){
        let item = this.getAtPath(path)
        let parent = item.parent
        
        // duplicate the item and add it using the add function if there is no parent then add to dirs
        let newItem: FSFile | FSDirectory = {...item}


        if (item.type == "directory"){
            this.addDir(this.getPath(parent), newItem as FSDirectory)
        }
        else{
            this.addFile(this.getPath(parent), newItem as FSFile)
        }
        
        this.update();
    }

    public addDataFile(name:string, path: string, type:FileTypes, data: any){
        let file = {
            name: name,
            type: "file",
            fileType: type,
            content: data,
            components: []
        } as FSFile
        this.addFile(path, file)

        this.update();
    }

    public fileExists(path: string): boolean{
        return this.getAtPath(path) != null
    }
}

export let FS = new FileSystem([
    {name: "assets", children: [], type: "directory"}, 
    {name: "flowcharts", children: [], type: "directory"},
    {name: "objects", children: [], type: "directory"},
    {name: "scenes", children: [], type: "directory"},
    {name: "scripts", children: [], type: "directory"},
    {name: "sprites", children: [], type: "directory"},
]);

export function saveFileSystemToJson(){

    let rootWithoutParents = {...FS.root}

    // remove parents
    function removeParents(dir: FSDirectory){
        dir.children.forEach(c => {
            if(c.type == "directory"){
                removeParents(c as FSDirectory)
            }
            c.parent = null
        })
    }

    removeParents(rootWithoutParents);

    let json = JSON.stringify(rootWithoutParents)
    
    // download file
    let a = document.createElement("a")
    let file = new Blob([json], {type: "application/json"})
    a.href = URL.createObjectURL(file)
    a.download = "filesystem.json"
    a.click()

    // remove element
    a.remove()
}

export function loadFileSystemFromJson(){
    let input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = () => {
        if(input.files && input.files.length > 0){
            let file = input.files[0]
            let reader = new FileReader()
            reader.onload = () => {
                let json = reader.result as string
                let obj = JSON.parse(json)
                FS.root = obj

                // add parents
                function addParents(dir: FSDirectory){
                    dir.children.forEach(c => {
                        if(c.type == "directory"){
                            addParents(c as FSDirectory)
                        }
                        c.parent = dir
                    })
                }
                addParents(FS.root)

                // foreach flowchart file
                FS.getAllOfType(FileTypes.flowchart).forEach(f => {
                    let content = f.content as FlowchartFileContent;

                    content.nodes.forEach(n => {
                        let name = n.type.name;

                        // get the node data for that type
                        let nodeData = Object.values(NodeTypes).find(n => n.name == name);

                        // set the node type to that
                        n.type = nodeData;
                    });
                })

                FS.update()
            }
            reader.readAsText(file)
        }

        // remove element
        input.remove()
    }
    input.click()
}