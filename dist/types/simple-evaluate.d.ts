import token from "./token";
import Compiler, { GetValueFunction, Node } from "./compiler";
import { evaluate } from "./shunting-yard";
export default function (context: any, ref: any, expr: string, option?: {
    getValue: GetValueFunction;
}): any;
export { Compiler, token, Node, evaluate };
