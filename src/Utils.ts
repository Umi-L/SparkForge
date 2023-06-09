import { FS, FileTypes, type FSFile } from "./FileSystem";
import type { Component } from "./PropertiesSystem";
import { createToast } from "./ToastManager";
import { ToastPosition, ToastType } from "./Types";

// function that capitalises the first letter of each word
export function toTitle(string){
    let words = string.split(" ");

    let newWords = [];

    for (let word of words){
        newWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }

    return newWords.join(" ");
}

export function numToPrecision(number: number, precision: number) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

export function addFilesToDirectory(files: FileList, path: string){
    // for each file
    for (let i = 0; i < files.length; i++){
        let file = files[i];

        // get the file path
        let filePath = path + file.name;
        let parentPath = path;

        // read the file
        let reader = new FileReader();
        reader.readAsText(file);

        // when the file is read
        reader.onload = ()=>{

            // get filetype
            let fileType = file.name.split(".").pop();

            // check if file type is supported
            if (!FileTypes[fileType]) {
                createToast(`File type "${fileType}" is not supported.`, ToastType.Error, ToastPosition.BottomRight, 5000);
                return;
            };

            // if the file already exists
            if (FS.fileExists(filePath)){
                // ask the user if they want to overwrite the file
                if (!confirm(`A file named "${file.name}" already exists in this directory. Do you want to overwrite it?`)) return;
                else{
                    // if they do, delete the file
                    FS.delete(filePath);
                }
            }

            let content = {
                data: URL.createObjectURL(file),
            }

            // add the file to the file system
            FS.addDataFile(file.name, parentPath, FileTypes[fileType], content);
        }
    }
}

export function getComponent(file: FSFile, componentName: string){
    for (let component of file.components){
        if (component.name == componentName) return component;
    }

    return null;
}

export function getProperty(component: Component, propertyName: string){
    for (let property of component.properties){
        if (property.name == propertyName) return property;
    }

    return null;
}