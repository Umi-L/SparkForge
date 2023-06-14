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

export async function addFilesToDirectory(files: FileList, path: string){
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
        reader.onload = async ()=>{

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
                data: await fileToDataURI(file),
            }

            // add the file to the file system
            FS.addDataFile(file.name, parentPath, FileTypes[fileType], content);
        }
    }
}

function fileToDataURI(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
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

export function ERORR(text: string){
    console.error(text);
    createToast(text, ToastType.Error, ToastPosition.BottomRight);
}

export function getContainingBoxOfBoxes(boundingClientRects: Array<Rect>){

    // if length is 0, return box of 0
    if (boundingClientRects.length == 0) return {
        y: 0,
        x: 0,
        height: 0,
        width: 0,
    }

    let top = boundingClientRects[0].y;
    let left = boundingClientRects[0].x;
    let bottom = boundingClientRects[0].height;
    let right = boundingClientRects[0].width;

    for (let i = 1; i < boundingClientRects.length; i++){
        let box = boundingClientRects[i];

        if (box.y < top) top = box.y;
        if (box.x < left) left = box.x;
        if (box.height > bottom) bottom = box.height;
        if (box.width > right) right = box.width;
    }

    return {
        y: top,
        x: left,
        height: bottom,
        width: right,
    }
}

export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number,
}