import type { AST, ASTConnection, ASTNode } from "./AbstractSyntaxTree";
import { Template } from "./Templates";
import { createToast } from "./ToastManager";
import { ToastPosition, ToastType } from "./Types";

interface SpecialCaseInput {
    node: ASTNode;
    inputNumber: number;

}

export function Compile(ast: AST) {
    
    let rootNode = ast.root;

    // recursively process all in connections
    function processNodeInConnections(node: ASTNode): string {
        let inputs = [];

        let template = (node.data.specialCase) ? node.data.template : new Template(`${node.data.func.name}({p...})`);

        for (let connection of node.inConnections) {
            let input = processNodeInConnections(connection.from.node);
            inputs.push(input);   
        }

        return template.fill(inputs, []);
    }

    function getInputs(node: ASTNode): Array<string>{
        let inputs = [];

        for (let connection of node.inConnections) {
            let input = processNodeInConnections(connection.from.node);
            inputs.push(input);   
        }

        return inputs;
    }



    function processNode(node: ASTNode) {
        // get all the inputs
        let inputs = getInputs(node);  
        
        let template: Template;

        if (node.data.func){
            template = (node.data.specialCase) ? node.data.template : new Template(`${node.data.func.name}({p...})`);
        }
        else{
            template = new Template(`{b1}`);
        }

        let bodies = [];
        
        // for every output connection
        for (let connection of node.outConnections) {
            // recursively process the node and add the body to the bodies array
            bodies.push(processNode(connection.to.node));
        }

        return template.fill(inputs, bodies);
    }

    let code = processNode(rootNode);

    return code;
}