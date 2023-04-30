import type { NodeData } from "./Types";

export class ASTNode {
    data: NodeData;
    connections: Connection[];

    constructor(data: NodeData, connections: Connection[]) {
        this.data = data;
        this.connections = connections;
    }
}

export class Connection {
    
    outputNode: ASTNode;
    outputNumber: number;

    inputNode: ASTNode;
    inputNumber: number;

    constructor(outputNode: ASTNode, outputNumber: number, inputNode: ASTNode, inputNumber: number) {
        this.outputNode = outputNode;
        this.outputNumber = outputNumber;
        this.inputNode = inputNode;
        this.inputNumber = inputNumber;
    }
}

export class AST {
    public root: ASTNode;



    constructor(root: ASTNode) {
        this.root = root;
    }

    public addNode(node: NodeData, outputNode, outputIndex, inputIndex) {

        let newNode = new ASTNode(node, []);

        let connection = new Connection(outputNode, outputIndex, newNode, inputIndex);

        connection.outputNode.connections.push(connection);
    }

    public addConnection(connection: Connection) {
        connection.outputNode.connections.push(connection);
    }
}