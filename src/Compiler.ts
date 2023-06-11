import { ASTNode, AST, ASTConnection } from "./AbstractSyntaxTree";
import { FS, FileTypes } from "./FileSystem";
import { OutputTypes, addOutputMessage } from "./OutputSystem";
import { Template } from "./Templates";
import { createToast } from "./ToastManager";
import { NodeTypes, ToastPosition, ToastType, type SavedNode, type SavedConnection, NodeCatagories, type FlowchartFileContent } from "./Types";

function flowchartDataToASTs(data: any): Array<AST> {

    let nodes = data.nodes as Array<SavedNode>;
    let connections = data.connections as Array<SavedConnection>;

    // get every start node by itterating over every node
    let startNodes: Array<SavedNode> = [];

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];

        if (node.type.category == NodeCatagories.Events) {
            startNodes.push(node);
        }
    }

    // convert every start node to an AST
    let asts = [];

    for (let i = 0; i < startNodes.length; i++) {
        let startNode = startNodes[i];

        let nodeData = startNode.type;
        
        let astNode = new ASTNode(nodeData, [], undefined);

        let ast = new AST(astNode);

        // traverse the tree and add every node to the ast
        traverseTree(startNode, astNode, ast);

        asts.push(ast);
    }

    console.log(asts)

    return asts;
    

    function traverseTree(startElement: SavedNode, astNode: ASTNode, ast: AST, reverse: boolean = false) {

        // get the output nodes of the start element
        let outConnections = getOutConnections(startElement);
        let inConnections = getInConnections(startElement);

        // for every out connection
        if (!reverse){
            for (let i = 0; i < outConnections.length; i++) {
                let connection = outConnections[i];

                let node = connection.to.node;

                let nodeData = nodes[node].type;

                let newNode = new ASTNode(nodeData, [], astNode);

                let astConnection = new ASTConnection(astNode, connection.from.outputNumber, newNode, connection.to.inputNumber);

                ast.addOutConnection(astConnection);

                traverseTree(nodes[node], newNode, ast);
            }
        }

        // for every in connection
        for (let i = 0; i < inConnections.length; i++) {

            if (astNode.parentHasOutConnection(inConnections[i].to.inputNumber)) {
                continue;
            }

            let connection = inConnections[i];

            let node = nodes[connection.from.node];

            let nodeData = node.type;
            let literalValues = node.literals;

            let newNode = new ASTNode(nodeData, [], astNode);
            newNode.literals = literalValues;

            let astConnection = new ASTConnection(newNode, connection.from.outputNumber, astNode, connection.to.inputNumber);

            ast.addInConnection(astConnection);

            traverseTree(node, newNode, ast, true);
        }
    }

    function getOutConnections(node: SavedNode): Array<SavedConnection> {
        let containing: Array<SavedConnection> = [];

        // get every connection coming out of the node
        connections.forEach(connection => {
            // console.log(connection.from.node, node)
            if (nodes[connection.from.node] == node) {
                containing.push(connection);
            }
        });

        return containing;
    }

    function getInConnections(node: SavedNode): Array<SavedConnection> {
        let containing: Array<SavedConnection> = [];

        // get every connection coming out of the node
        connections.forEach(connection => {
            // console.log(connection.from.node, node)
            if (nodes[connection.to.node] == node) {
                containing.push(connection);
            }
        });

        return containing;
    }
}

export function Compile(ast: AST) {
    
    let rootNode = ast.root;

    // recursively process all in connections
    function processNodeInConnections(node: ASTNode): string {
        let inputs = [];

        console.log(node)
        let template = (node.data.specialCase) ? node.data.template : new Template(`${node.data.func.name}({p...})`);

        for (let connection of node.inConnections) {
            let input = processNodeInConnections(connection.from.node);
            inputs.push(input);
        }

        return template.fill(inputs, [], node.literals);
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

        console.log("processing node", node.data.name)

        // get all the inputs
        let inputs = getInputs(node);  
        
        let template: Template;

        if (node.data.func){
            template = (node.data.specialCase) ? node.data.template : new Template(`${node.data.func.name}({p...})\n{b1}`);
        }
        else if (node.data.template) {
            template = node.data.template;
        } else {
            template = new Template(`{b1}`);
        }

        let bodies = [];
        
        // for every output connection
        for (let connection of node.outConnections) {
            // recursively process the node and add the body to the bodies array
            bodies.push(processNode(connection.to.node));
        }

        console.log("filling template", template, "inputs", inputs, "bodies", bodies)
        console.log("filled template", template.fill(inputs, bodies))

        return template.fill(inputs, bodies, node.literals);
    }

    let code = processNode(rootNode);

    console.log("code \n", code)


    try{
        // use prettier to format the code
        // @ts-ignore
        code = prettier.format(code, { parser: "babel", plugins: prettierPlugins });

        addOutputMessage("Compiled code: \n" + code)
    }
    catch(error){
        addOutputMessage("Failed to format generated code ERROR: \n" + error, OutputTypes.Error)
        addOutputMessage("Generated code: \n" + code)
    }

    return code;
}

export function compileAll(){
    // get all flowchart files
    let files = FS.getAllOfType(FileTypes.flowchart);

    for (let file of files){
        let asts = flowchartDataToASTs(file.content);

        let code = "";

        // TODO: Error handling
        for (let ast of asts){
            code += Compile(ast) + "\n";
        }

        // get current flowchart data
        let flowchartData = file.content as FlowchartFileContent;

        flowchartData.compiledCode = code;

        console.log("flowchart compiled:")
        console.log(file)
    }
}