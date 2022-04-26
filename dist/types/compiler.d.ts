export declare const OPERATION: {
    [key: string]: number;
};
export interface Node {
    left: Node | string | null;
    right: Node | string | null;
    operation: string;
    grouped?: boolean;
}
export declare type GetValueFunction<T = object> = (context: T, path: string) => any;
export default class Compiler {
    blockLevel: number;
    private index;
    private getValueFn;
    private token;
    constructor(token: string[], getValue?: GetValueFunction);
    parse(): Node | string;
    calc(node: Node | string, context: any, ref: any): any;
    private nextToken;
    private prevToken;
    private addNode;
    private compare;
    private getValue;
    private parseStatement;
}
