import type { Catagory } from "./PropertiesSystem"
import { PropertyTypes } from "./Types"

export interface FSFile{
    type: "file"
    name: string
    fileType: FileTypes
    fileTypeProperties?: Array<Catagory>
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
}

export let fileTypeProperties = {
    object: [
        {name: "Sprite", properties: [
            {name: "Sprite", value: "", type: PropertyTypes.Sprite, isModifiable: true},
        ]}
    ] as Array<Catagory>,
    sprite: [
        {name: "Image", properties: [
            {name: "Image", value: "", type: PropertyTypes.Image, isModifiable: true},
        ]}
    ] as Array<Catagory>,
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

    public addFile(path: string, file: FSFile){
        let dir = this.getAtPath(path) as FSDirectory

        let parent = this.getAtPath(path) as FSDirectory

        // if the file's type is in the fileTypeProperties object, add those properties to the file
        if(fileTypeProperties[file.fileType] && !file.fileTypeProperties){
            file.fileTypeProperties = fileTypeProperties[file.fileType];
        }

        // if the file's name already exists in the parent, add a number to the end and increment it until it doesn't
        let name = file.name
        let i = 1
        while(parent.children.find(c => c.name == name)){
            name = file.name + i
            i++
        }
        file.name = name
        
        dir.children.push(file)

        this.update();
    }

    public addDir(path: string, dir: FSDirectory){

        console.log("adding dir", path, dir)

        let parent = this.getAtPath(path) as FSDirectory

        console.log("parent", parent)

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
                console.log("can't move a directory into itself")
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

        console.log(this.root)
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
}

export let FS = new FileSystem([
    {name: "assets", children: [], type: "directory"}, 
    {name: "objects", children: [], type: "directory"},
    {name: "scenes", children: [], type: "directory"}
]);
