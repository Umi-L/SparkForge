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

export enum NodeType {
    Start = 'start',
    If = 'if',
    Log = 'log',
}

export interface NodeDefs {
    [key: string]: { name: string, inputs: IOPoint[], outputs: IOPoint[] }
}

export interface NodeData {
  name: string, inputs: IOPoint[], outputs: IOPoint[]
}

export interface IOPoint {
    label: string
    type: FlowDataType
}

export const NodeTypes: NodeDefs = {
  Start: {
    name: "start",
    inputs: [],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
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
  },

  Log: {
    name: "log",
    inputs: [
      { label: "in", type: FlowDataType.Flow },
      { label: "message", type: FlowDataType.String },
    ],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
  },
  Test: {
    name: "test",
    inputs: [
      { label: "STUFFF", type: FlowDataType.Flow },
      { label: "STUFFF", type: FlowDataType.Flow },
      { label: "STUFFF", type: FlowDataType.Flow },
      { label: "STUFFF", type: FlowDataType.Flow },
      { label: "STUFFF", type: FlowDataType.Flow },
      { label: "STUFFF", type: FlowDataType.Flow },
      { label: "message", type: FlowDataType.String },
    ],
    outputs: [{ label: "out", type: FlowDataType.Flow }],
  },
};

