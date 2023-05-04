export class Template{
    teplate: string;
    constructor(teplate: string){
        this.teplate = teplate;
    }

    public fill(params: Array<string>, bodies: Array<Array<string>>): string{
        let code = this.teplate;

        // replace individual param indexes with params
        for(let i = 1; i < params.length+1; i++){
            code = code.replace(`{p${i}}`, params[i]);
        }

        // replace {p...} with all params seperated by commas
        code = code.replace(`{p...}`, params.join(", "));

        // replace individual body indexes with bodies {b1}, {b2}, etc
        for(let i = 1; i < bodies.length+1; i++){
            let body = bodies[i];
            let bodyString = "";
            for(let line of body){
                bodyString += line + "\n";
            }
            code = code.replace(`{b${i}}`, bodyString);
        }

        // if template has leftover template params then replace them with empty strings
        code = code.replace(/{p\d+}/g, "");
        code = code.replace(/{b\d+}/g, "");

        return code;
    }
}