import { print } from "./NodeFunctions"
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

export enum NodeCatagories {
    Control = 'control',
    Operators = 'operators',
    literals = 'literals',
    Events = 'events',
    debug = 'debug',
}

export interface NodeDefs {
  [key: string]: {
    name: string;
    inputs: IOPoint[];
    outputs: IOPoint[];
    literals: LiteralInput[];
    func?: Function;
    specialCase?: boolean;
    template?: Template;
    category: NodeCatagories;
  };
}

export interface NodeData {
  name: string;
  inputs: IOPoint[];
  outputs: IOPoint[];
  literals: LiteralInput[];
  func?: Function;
  specialCase?: boolean;
  template?: Template;
  category: NodeCatagories;
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
        category: NodeCatagories.Events,
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
        template: new Template("if({p1}){{b1}}else{{b2}}{b3}"),
        category: NodeCatagories.Control,
    },

    Log: {
        name: "print",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "message", type: FlowDataType.Any },
        ],
        outputs: [{ label: "out", type: FlowDataType.Flow }],
        literals: [],
        func: print,
        category: NodeCatagories.debug,
    },
    String: {
        name: "text",
        inputs: [],
        outputs: [{ label: "text", type: FlowDataType.String }],
        literals: [
            { label: "value", type: FlowLiteralType.String },
        ],
        specialCase: true,
        template: new Template("'{l1}'"),
        category: NodeCatagories.literals,
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
        category: NodeCatagories.literals,
    },
    Boolean: {
        name: "flag",
        inputs: [],
        outputs: [{ label: "flag", type: FlowDataType.Boolean }],
        literals: [
            { label: "value", type: FlowLiteralType.Boolean },
        ],
        specialCase: true,
        template: new Template("{l1}"),
        category: NodeCatagories.literals,
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
        template: new Template("{p1} == {p2}"),
        category: NodeCatagories.Operators,
    },
    Not: {
        name: "not",
        inputs: [
            { label: "value", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "not", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("!{p1}"),
        category: NodeCatagories.Operators,
    },
    And: {
        name: "and",
        inputs: [
            { label: "a", type: FlowDataType.Boolean },
            { label: "b", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "and", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} && {p2}"),
        category: NodeCatagories.Operators,
    },
    Or: {
        name: "or",
        inputs: [
            { label: "a", type: FlowDataType.Boolean },
            { label: "b", type: FlowDataType.Boolean },
        ],
        outputs: [{ label: "or", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} || {p2}"),
        category: NodeCatagories.Operators,
    },

    GreaterThan: {
        name: "greater than >",
        inputs: [
            { label: "a", type: FlowDataType.Number },
            { label: "b", type: FlowDataType.Number },
        ],
        outputs: [{ label: "greater than >", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} > {p2}"),
        category: NodeCatagories.Operators,
    },

    LessThan: {
        name: "less than <",
        inputs: [
            { label: "a", type: FlowDataType.Number },
            { label: "b", type: FlowDataType.Number },
        ],
        outputs: [{ label: "less than <", type: FlowDataType.Boolean }],
        literals: [],
        specialCase: true,
        template: new Template("{p1} < {p2}"),
        category: NodeCatagories.Operators,
    },

    Repeat: {
        name: "repeat",
        inputs: [
            { label: "in", type: FlowDataType.Flow },
            { label: "times", type: FlowDataType.Number },
        ],
        outputs: [
            { label: "repeated", type: FlowDataType.Flow },
            { label: "out", type: FlowDataType.Flow },
        ],
        literals: [],
        specialCase: true,
        template: new Template("for(let i = 0; i < {p1}; i++){{b1}}{b2}"),
        category: NodeCatagories.Control,
    }
};

