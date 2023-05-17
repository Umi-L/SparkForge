// function that capitalises the first letter of each word
export function toTitle(string){
    let words = string.split(" ");

    let newWords = [];

    for (let word of words){
        newWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }

    return newWords.join(" ");
}