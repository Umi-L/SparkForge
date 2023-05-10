export interface FSFile{
    type: "file"
    name: string
    fileType: FileTypes
    content: object
    parent: FSDirectory
}

export interface FSDirectory{
    type: "directory"
    name: string
    children: Array<FSFile|FSDirectory>
    parent?: FSDirectory
}

export enum FileTypes{
    "gameobject",
    "scene",
    "sprite",
    "script",
    "flowchart",
}



class FileSystem{
    public dirs: Array<FSDirectory> = []
    updateCallbacks: Array<() => void> = []

    constructor(dirs: Array<FSDirectory>){
        this.dirs = dirs
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
        let currentDir = this.dirs.find(d => d.name == pathParts[0])
        if(!currentDir) return null

        for(let i = 1; i < pathParts.length; i++){
            let child = currentDir.children.find(c => c.name == pathParts[i])
            if(!child) return null
            if(child.type == "directory"){
                currentDir = child
            }
            else{
                return child
            }
        }
        return currentDir
    }

    public addFile(path: string, file: FSFile){
        let dir = this.getAtPath(path) as FSDirectory

        let parent = this.getAtPath(path) as FSDirectory

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

    public rename(path: string, newName: string){
        let item = this.getAtPath(path)
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
            this.dirs.splice(this.dirs.indexOf(dir), 1)
        }

        this.update();
    }

    public duplicate(path: string){
        let item = this.getAtPath(path)
        let parent = item.parent

        if (parent){
            let newItem = JSON.parse(JSON.stringify(item))
            newItem.name = item.name + " copy"

            parent.children.push(newItem)
        } else{
            let newItem = JSON.parse(JSON.stringify(item))
            newItem.name = item.name + " copy"

            this.dirs.push(newItem)
        }

        this.update();
    }
}

export let FS = new FileSystem([
    {name: "assets", children: [], type: "directory"}, 
    {name: "objects", children: [], type: "directory"},
    {name: "scenes", children: [], type: "directory"}
]);
