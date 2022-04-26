import token from './token';
import Compiler, { GetValueFunction, Node } from './compiler';
export default function evaluate(context: any, ref: any, expr: string, option?: {
    getValue: GetValueFunction;
}): any;
export { Compiler, token, Node };
