import type { NodeData } from "./Types";

export class ASTNode {
    data: NodeData;
    connections: ASTConnection[];

    constructor(data: NodeData, connections: ASTConnection[]) {
        this.data = data;
        this.connections = connections;
    }
}

interface from{
    node: ASTNode;
    outputNumber: number;
}

interface to{
    node: ASTNode;
    inputNumber: number;
}

export class ASTConnection {
    from: from;
    to: to;

    constructor(outputNode: ASTNode, outputNumber: number, inputNode: ASTNode, inputNumber: number) {
        this.from = { node: outputNode, outputNumber: outputNumber };
        this.to = { node: inputNode, inputNumber: inputNumber };
    }
}

export class AST {
    public root: ASTNode;



    constructor(root: ASTNode) {
        this.root = root;
    }

    public addConnection(connection: ASTConnection) {
        connection.from.node.connections.push(connection);
    }
}