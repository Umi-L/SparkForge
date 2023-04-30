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
    [key: string]: { name: string, inputs: IOPoint[], outputs: IOPoint[], literals: LiteralInput[] }
}

export interface NodeData {
  name: string, inputs: IOPoint[], outputs: IOPoint[], literals: LiteralInput[]
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
    ],
    literals: [],
  },

  Log: {
    name: "log",
    inputs: [
      { label: "in", type: FlowDataType.Flow },
      { label: "message", type: FlowDataType.Any },
    ],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
    literals: [],
  },
  String: {
    name: "string",
    inputs: [],
    outputs: [{ label: "string", type: FlowDataType.String }],
    literals: [
        { label: "value", type: FlowLiteralType.String },
    ],
  },
    Number: {
        name: "number",
        inputs: [],
        outputs: [{ label: "number", type: FlowDataType.Number }],
        literals: [
            { label: "value", type: FlowLiteralType.Number },
        ],
    },
    Boolean: {
        name: "boolean",
        inputs: [],
        outputs: [{ label: "boolean", type: FlowDataType.Boolean }],
        literals: [
            { label: "value", type: FlowLiteralType.Boolean },
        ],
    },
};

