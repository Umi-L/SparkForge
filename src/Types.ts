export interface Point {
    x: number
    y: number
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
    If: { name: 'if', inputs: [{ x: 0, y: 0 }], outputs: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
    Elseif: { name: 'elseif', inputs: [{ x: 0, y: 0 }], outputs: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
    Else: { name: 'else', inputs: [{ x: 0, y: 0 }], outputs: [{ x: 0, y: 0 }] },
}