import { NodeTypes, TestPropTypes } from "../Types";

export const possibleProps = {
    type: {
        type: TestPropTypes.Choice,
        options: [...Object.values(NodeTypes)],
    },
    factory: {
        type: TestPropTypes.Boolean,
    }
};