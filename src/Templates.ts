export class Template{
    teplate: string;
    constructor(teplate: string){
        this.teplate = teplate;
    }

    public fill(params: Array<string>, bodies: Array<string>): string{
        let code = this.teplate;

        // replace individual param indexes with params
        for(let i = 1; i < params.length+1; i++){
            code = code.replace(`{p${i}}`, params[i-1]);
        }

        // replace {p...} with all params seperated by commas
        code = code.replace(`{p...}`, params.join(", "));

        // replace individual body indexes with bodies {b1}, {b2}, etc
        for(let i = 1; i < bodies.length+1; i++){
            code = code.replace(`{b${i}}`, bodies[i-1]);
        }

        // if template has leftover template params then replace them with empty strings
        code = code.replace(/{p\d+}/g, "");
        code = code.replace(/{b\d+}/g, "");

        return code;
    }
}