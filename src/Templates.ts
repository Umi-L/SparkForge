export class Template{
    teplate: string;
    constructor(teplate: string){
        this.teplate = teplate;
    }

    public fill(params: Array<string>, bodies: Array<string>, literals?: Array<any>): string{
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

        // foreach literal replace {l1} with the literal
        if (literals){
            for(let i = 1; i < literals.length+1; i++){

                // console.log("replacing literal", i, literals[i-1])
                // console.log("typeof", typeof literals[i-1])

                console.log(code)

                code = code.replace(`{l${i}}`, literals[i-1]);
            }
        }

        // if template has leftover template params then replace them with empty strings
        code = code.replace(/{p\d+}/g, "");
        code = code.replace(/{b\d+}/g, "");
        code = code.replace(/{l\d+}/g, "");

        return code;
    }
}