"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = void 0;
var get_value_1 = __importDefault(require("get-value"));
var compiler_1 = require("./compiler");
var token_1 = __importDefault(require("./token"));
var evaluate = function (context, ref, expr) {
    var yard = new ShuntingYard((0, token_1.default)(expr));
    return yard.parse(context, ref);
};
exports.evaluate = evaluate;
/**
 * Shunting-yard algorithm
 * @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
 */
var ShuntingYard = /** @class */ (function () {
    function ShuntingYard(token) {
        this.values = [];
        this.operations = [];
        this.token = token;
    }
    ShuntingYard.prototype.parse = function (context, ref) {
        for (var _i = 0, _a = this.token; _i < _a.length; _i++) {
            var tok = _a[_i];
            var level = compiler_1.OPERATION[tok];
            if (level || tok === '(') {
                this.pushOperationStask(tok);
                continue;
            }
            else if (tok === ')') {
                var lastOp = void 0;
                do {
                    lastOp = this.operations.pop();
                    if (lastOp !== '(') {
                        this.values.push(lastOp);
                    }
                } while (lastOp !== '(');
            }
            else {
                this.values.push(tok);
            }
        }
        var operator;
        do {
            operator = this.operations.pop();
            if (operator !== undefined) {
                this.values.push(operator);
            }
        } while (operator !== undefined);
        return this.calc(context, ref);
    };
    ShuntingYard.prototype.calc = function (context, ref) {
        var values = [];
        if (this.values.length === 1) {
            return this.getValue(this.values[0], context, ref);
        }
        for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
            var tok = _a[_i];
            if (!compiler_1.OPERATION[tok]) {
                values.push(tok);
            }
            else {
                values.push(this.evaluate(tok, this.getValue(values.pop(), context, ref), this.getValue(values.pop(), context, ref)));
            }
        }
        return values[0];
    };
    ShuntingYard.prototype.evaluate = function (expr, right, left) {
        switch (expr) {
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
                return (left !== null && left !== void 0 ? left : []).filter(function (v) { return (right !== null && right !== void 0 ? right : []).includes(v); }).length > 0;
            case '|-':
                return (left !== null && left !== void 0 ? left : []).filter(function (v) { return !(right !== null && right !== void 0 ? right : []).includes(v); }).length > 0;
        }
    };
    ShuntingYard.prototype.getValue = function (val, context, ref) {
        if (val === null || compiler_1.OPERATION[val] !== undefined) {
            throw new Error('unknow value ' + val);
        }
        if (typeof val !== 'string') {
            return val;
        }
        // 上下文查找
        if (val.indexOf('@') === 0) {
            return (0, get_value_1.default)(context, val.slice(1));
        }
        if (val.indexOf('$') === 0) {
            return (0, get_value_1.default)(ref, val.slice(1));
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
    };
    ShuntingYard.prototype.pushOperationStask = function (operation) {
        var lastOp = this.operations[this.operations.length - 1];
        // the first stack item, or push an high leval operation, for example
        // ['+'], and push *
        if (this.operations.length === 0 ||
            operation === '(' ||
            lastOp === '(' ||
            compiler_1.OPERATION[lastOp] < compiler_1.OPERATION[operation]) {
            this.operations.push(operation);
        }
        else {
            this.values.push(this.operations.pop());
            this.pushOperationStask(operation);
        }
    };
    return ShuntingYard;
}());
exports.default = ShuntingYard;
//# sourceMappingURL=shunting-yard.js.map