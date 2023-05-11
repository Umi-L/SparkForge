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
