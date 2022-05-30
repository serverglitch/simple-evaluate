import get from 'get-value';
import { OPERATION } from './compiler';
import token from './token';

export const evaluate = (context: any, ref: any, expr: string) => {
  const yard = new ShuntingYard(token(expr));
  return yard.parse(context, ref);
}

/**
 * Shunting-yard algorithm
 * @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
 */
export default class ShuntingYard {
  private values: string[] = [];
  private operations: string[] = [];
  private token: string[];

  constructor(token: string[]) {
    this.token = token;
  }

  parse(context: object, ref: object) {
    for (let tok of this.token) {
      const level = OPERATION[tok];
      if (level || tok === '(') {
        this.pushOperationStask(tok);
        continue;
      } else if (tok === ')') {
        let lastOp;
        do {
          lastOp = this.operations.pop();
          if (lastOp !== '(') {
            this.values.push(lastOp as string);
          }
        } while (lastOp !== '(');
      } else {
        this.values.push(tok);
      }
    }

    let operator;
    do {
      operator = this.operations.pop();
      if (operator !== undefined) {
        this.values.push(operator);
      }
    } while (operator !== undefined)
    return this.calc(context, ref);
  }

  private calc(context: object, ref: object) {
    let values: string[] = [];
    if (this.values.length === 1) {
      return this.getValue(this.values[0], context, ref);
    }

    for (let tok of this.values) {
      if (!OPERATION[tok]) {
        values.push(tok);
      } else {
        values.push(this.evaluate(
          tok,
          this.getValue(values.pop() as string, context, ref),
          this.getValue(values.pop() as string, context, ref)
        ));
      }
    }

    return values[0];
  }

  private evaluate(expr: string, right: any, left: any) {
    const l_arr = left ?? [];
    const r_arr = right ?? [];

    switch(expr) {
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '>':
        return left > right;
      case '<':
        return left < right;
      case '>=':
        return left >= right;
      case '<=':
        return left <= right;
      case '==':
        // tslint:disable-next-line:triple-equals
        return left == right;
      case '!=':
        // tslint:disable-next-line:triple-equals
        return left != right;
      case '&&':
        return left && right;
      case '||':
        return left || right;
      case '|+':
        return l_arr.filter((v: string | number) => r_arr.includes(v)).length > 0;
      case '|-':
        return l_arr.filter((v: string | number) => !r_arr.includes(v)).length < l_arr.length;
      case '|=':
        return l_arr.filter((v: string | number) => r_arr.includes(v)).length === r_arr.length;
    }
  }

  private getValue(val: string | number, context: any, ref: any) {
    if (val === null || OPERATION[val] !== undefined) {
      throw new Error('unknow value ' + val);
    }

    if (typeof val !== 'string') {
      return val;
    }

    // 上下文查找
    if (val.indexOf('@') === 0) {
      return get(context, val.slice(1));
    }

    if (val.indexOf('$') === 0) {
      return get(ref, val.slice(1));
    }

    // 字符串
    if (val[0] === '\'' || val[0] === '"') {
      return val.slice(1, -1);
    }

    // 布尔
    if (val === 'true') {
      return true;
    }

    if (val === 'false') {
      return false;
    }

    // 其他都算数字
    return parseFloat(val);
  }

  private pushOperationStask(operation: string) {
    const lastOp = this.operations[this.operations.length - 1];
    // the first stack item, or push an high leval operation, for example
    // ['+'], and push *
    if (this.operations.length === 0 ||
      operation === '(' ||
      lastOp === '(' ||
      OPERATION[lastOp] < OPERATION[operation]) {
      this.operations.push(operation);
    } else {
      this.values.push(this.operations.pop() as string);
      this.pushOperationStask(operation);
    }
  }
}
