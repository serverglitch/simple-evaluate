import token from './token';
import Compiler, { GetValueFunction, Node } from './compiler';

export default function evaluate(context: any, ref: any, expr: string, option?: {
  getValue: GetValueFunction;
}) {
  const tokenList = token(expr);
  const compiler = new Compiler(tokenList, option && option.getValue);
  const astTree = compiler.parse();
  return compiler.calc(astTree, context, ref);
}
export { Compiler, token, Node };
