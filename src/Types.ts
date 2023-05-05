import { log } from "./NodeFunctions"
import { Template } from "./Templates"

export interface Point {
    x: number
    y: number

    name?: string
}

export enum TestPropTypes {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Choice = 'choice',
}

export interface NodeInterface {
    name: string
    inputs: Point[]
    outputs: Point[]
}

export enum ToastType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Warning = 'warning',
}

export enum ToastPosition {
    TopLeft = 'top-left',
    TopRight = 'top-right',
    BottomLeft = 'bottom-left',
    BottomRight = 'bottom-right',
}

export enum FlowDataType {
    Flow = 'flow',
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Object = 'object',
    Array = 'array',
    Any = 'any',
}
export enum FlowLiteralType {
    String = 'text',
    Number = 'number',
    Boolean = 'checkbox',
}

// export enum NodeType {
//     Start = 'start',
//     If = 'if',
//     Log = 'log',
// }

export interface NodeDefs {
    [key: string]: { name: string, inputs: IOPoint[], outputs: IOPoint[], literals: LiteralInput[], func?: Function, specialCase?: boolean, template?: Template }
}

export interface NodeData {
  name: string, inputs: IOPoint[], outputs: IOPoint[], literals: LiteralInput[], func?: Function, specialCase?: boolean, template?: Template
}

export interface IOPoint {
    label: string
    type: FlowDataType
}

export interface LiteralInput {
    label: string,
    type: FlowLiteralType,
}

export const NodeTypes: NodeDefs = {
  Start: {
    name: "start",
    inputs: [],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
    literals: [],
  },

  If: {
    name: "if",
    inputs: [
      { label: "in", type: FlowDataType.Flow },
      { label: "condition", type: FlowDataType.Boolean },
    ],
    outputs: [
      { label: "true", type: FlowDataType.Flow },
      { label: "false", type: FlowDataType.Flow },
      { label: "out", type: FlowDataType.Flow },
    ],
    literals: [],
    specialCase: true,
    template: new Template("if({p1}){{b1}}else{{b2}}{b3}")
  },

  Log: {
    name: "log",
    inputs: [
      { label: "in", type: FlowDataType.Flow },
      { label: "message", type: FlowDataType.Any },
    ],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
    literals: [],
    func: log
  },
  String: {
    name: "string",
    inputs: [],
    outputs: [{ label: "string", type: FlowDataType.String }],
    literals: [
        { label: "value", type: FlowLiteralType.String },
    ],
    specialCase: true,
    template: new Template("'{l1}'"),
  },
    Number: {
        name: "number",
        inputs: [],
        outputs: [{ label: "number", type: FlowDataType.Number }],
        literals: [
            { label: "value", type: FlowLiteralType.Number },
        ],
        specialCase: true,
        template: new Template("{l1}"),
    },
    Boolean: {
        name: "boolean",
        inputs: [],
        outputs: [{ label: "boolean", type: FlowDataType.Boolean }],
        literals: [
            { label: "value", type: FlowLiteralType.Boolean },
        ],
        specialCase: true,
        template: new Template("{l1}"),
    },
    Equals: {
        name: "equals",
        inputs: [
            { label: "a", type: FlowDataType.Any },
            { label: "b", type: FlowDataType.Any },
        ],
        outputs: [{ label: "equals", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} == {p2}")
    },
    Not: {
        name: "not",
        inputs: [
            { label: "value", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "not", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("!{p1}")
        
    }
};

