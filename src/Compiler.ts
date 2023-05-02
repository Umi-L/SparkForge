import type { AST, ASTConnection, ASTNode } from "./AbstractSyntaxTree";
import { createToast } from "./ToastManager";
import { ToastPosition, ToastType } from "./Types";

interface SpecialCaseOutput {
    line: string;
    indent: number;
    close: string | undefined;
}

export function Compile(ast: AST) {
    
    let code = "";
    let node = ast.root;
    let indent = 0;

    function addLine(line: string) {
        code += "    ".repeat(indent) + line + "\n";
    }

    function addLineAndIndent(line: string) {
        addLine(line);
        indent++;
    }

    function removeIndent() {
        indent--;
    }

    function processNodeInConnections(node: ASTNode): string[] {

        let outputs = []

        for (let connection of node.inConnections) {
            // get node the node that the connection is coming from
            let fromNode = connection.from.node;

            // get the func of the fromNode
            let func = fromNode.data.func;

            if (func == undefined) {
                continue;
            }

            // get the number of parameters the node
            let numParams = fromNode.data.inputs.length;

            // if the number of params and the number of inConnections are not equal
            if (numParams != fromNode.inConnections.length) {
                //error unsatisfied parameters
                console.log("unsatisfied parameters");

                // toast error
                createToast(`Missing connections to node ${fromNode.data.name}`, ToastType.Error, ToastPosition.BottomRight);

                return;
            }

            // assume basic function call
            let line = `${fromNode.data.name}(`;

            let params = processNodeInConnections(fromNode);

            // add params to line
            line += params.join(", ");

            line += ")";

            outputs.push(line);
        }
    }


    
    // traverse the tree
    while (node) {

        // if special case hand off to special case function
        if (node.data.specialCase) {
            node.data.func(node);
        }

        let line = `${node.data.name}(`;
        let ending = ")";
        let params = [];        


        if (node.data.func == undefined) {
            line = ""
            ending = "";
        }

        // if the node has inConnections that must be processed first
        if (node.inConnections.length > 0) {
            params = processNodeInConnections(node);
        }

        // add params to line
        line += params.join(", ");

        line += ending;
        addLine(line);

    }

    return code;
}

export function specialCaseIf(){
    
}

export function specialCaseEquals(){

}

export function specialCaseNot(){

}