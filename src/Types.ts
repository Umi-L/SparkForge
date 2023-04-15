export interface Point {
    x: number
    y: number

    name?: string
}

export interface NodeInterface {
    name: string
    inputs: Point[]
    outputs: Point[]
}

export enum NodeType {
    Start = 'start',
    If = 'if',
    Elseif = 'elseif',
    Else = 'else',
}

export const NodeTypes = {
    Start: { name: 'start', inputs: [], outputs: [{ x: 0.5, y: 1 }] },

    // Logic
    If: { name: 'if', inputs: [{ x: 0.5, y: 0}], outputs: [{ x: 1, y: 0.5, name: "true" }, { x: 0.5, y: 1, name: "false" }] },
    Elseif: { name: 'elseif', inputs: [{ x: 0, y: 0}], outputs: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
    Else: { name: 'else', inputs: [{ x: 0, y: 0}], outputs: [{ x: 0, y: 0 }] },
}