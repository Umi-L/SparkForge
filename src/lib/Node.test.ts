import { NodeTypes, TestPropTypes } from "../Types";
import type Node from "./Node.svelte";

export const possibleProps = {
    type: {
        type: TestPropTypes.Choice,
        options: [...Object.values(NodeTypes)],
    },
    factory: {
        type: TestPropTypes.Boolean,
    }
};

export const testFunctions = [
    
]