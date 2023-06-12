import { saveFileSystem, type FSDirectory, loadFileSystem } from "./FileSystem"
import { rootScene } from "./globals"

export interface SaveData {
    fileSystem: FSDirectory,
    rootScene: string,
}

export function saveProjectToJson(){

    let rootScenePath;
    rootScene.update((scene)=>{
        rootScenePath = scene;
        return scene
    });

    let saveData: SaveData = {
        fileSystem: saveFileSystem(),
        rootScene: rootScenePath,
    };

    let json = JSON.stringify(saveData);
    
    // download file
    let a = document.createElement("a");
    let file = new Blob([json], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = "filesystem.json";
    a.click();

    // remove element
    a.remove();
}

export function loadProjectFromJson(){
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e)=>{
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = (e)=>{
            let json = reader.result as string;
            let saveData = JSON.parse(json) as SaveData;
            console.log(saveData);
            loadFileSystem(saveData.fileSystem);
            rootScene.update((scene)=>{
                return saveData.rootScene;
            });
        }
        reader.readAsText(file);
    }
    input.click();
}