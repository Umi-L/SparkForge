import type { NodeData } from "./Types";

export class ASTNode {
    data: NodeData;
    parent: ASTNode | undefined;
    outConnections: ASTConnection[];
    inConnections: ASTConnection[];
    literals: any[];

    constructor(data: NodeData, outConnections: ASTConnection[], parent: ASTNode | undefined, inConnections: ASTConnection[] = [], literals: any[] = []) {
        this.data = data;
        this.outConnections = outConnections;
        this.inConnections = inConnections;
        this.parent = parent;
        this.literals = literals;
    }

    public setLiterals(literals: any[]) {
        this.literals = literals;
    }

    public parentHasOutConnection(inputNumber: number): boolean {
        if (this.parent) {
            console.log("parent exists")
            for (let connection of this.parent.outConnections) {
                console.log(connection.to.inputNumber, inputNumber)
                if (connection.to.inputNumber == inputNumber && connection.to.node == this) {
                    console.log("parent has out connection")
                    return true;
                }
            }
        }
        else{
            console.log("parent does not exist")
        }
        return false;
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

    public addOutConnection(connection: ASTConnection) {
        connection.from.node.outConnections.push(connection);
    }

    public addInConnection(connection: ASTConnection) {
        connection.to.node.inConnections.push(connection);
    }
}