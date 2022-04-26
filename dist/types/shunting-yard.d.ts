export declare const evaluate: (context: any, ref: any, expr: string) => any;
/**
 * Shunting-yard algorithm
 * @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
 */
export default class ShuntingYard {
    private values;
    private operations;
    private token;
    constructor(token: string[]);
    parse(context: object, ref: object): any;
    private calc;
    private evaluate;
    private getValue;
    private pushOperationStask;
}
