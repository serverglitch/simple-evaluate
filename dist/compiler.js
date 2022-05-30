"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATION = void 0;
var get_value_1 = __importDefault(require("get-value"));
exports.OPERATION = {
    "!": 5,
    "*": 4,
    "/": 4,
    "%": 4,
    "+": 3,
    "-": 3,
    "|+": 2,
    "|-": 2,
    "|=": 2,
    ">": 2,
    "<": 2,
    ">=": 2,
    "<=": 2,
    "===": 2,
    "!==": 2,
    "==": 2,
    "!=": 2,
    "&&": 1,
    "||": 1,
    "?": 1,
    ":": 1,
};
var Compiler = /** @class */ (function () {
    function Compiler(token, getValue) {
        this.blockLevel = 0;
        this.index = -1;
        this.token = token;
        this.getValueFn = getValue || get_value_1.default;
    }
    Compiler.prototype.parse = function () {
        var tok;
        var root = {
            left: null,
            right: null,
            operation: null,
        };
        do {
            tok = this.parseStatement();
            // 括号结束
            if (tok === null || tok === undefined) {
                break;
            }
            if (root.left === null) {
                root.left = tok;
                root.operation = this.nextToken();
                // 只有一个左节点 !!$foo
                if (!root.operation) {
                    return tok;
                }
                root.right = this.parseStatement();
            }
            else {
                if (typeof tok !== "string") {
                    throw new Error("operation must be string, but get " + JSON.stringify(tok));
                }
                root = this.addNode(tok, this.parseStatement(), root);
            }
        } while (tok);
        return root;
    };
    Compiler.prototype.calc = function (node, context, ref) {
        if (typeof node === "string") {
            return this.getValue(node, context, ref);
        }
        // 不支持的运算符号
        if (exports.OPERATION[node.operation] === undefined) {
            throw new Error("unknow expression " + node.operation);
        }
        if (node.operation === "!" && node.right) {
            return !this.getValue(node.right, context, ref);
        }
        var left = this.getValue(node.left, context, ref);
        if (node.operation === undefined) {
            return left;
        }
        var right = this.getValue(node.right, context, ref);
        switch (node.operation) {
            case "*":
                return left * right;
            case "/":
                return left / right;
            case "+":
                return left + right;
            case "-":
                return left - right;
            case ">":
                return left > right;
            case "%":
                return left % right;
            case "<":
                return left < right;
            case ">=":
                return left >= right;
            case "<=":
                return left <= right;
            case "==":
                // tslint:disable-next-line:triple-equals
                return left == right;
            case "===":
                // tslint:disable-next-line:triple-equals
                return left === right;
            case "!==":
                // tslint:disable-next-line:triple-equals
                return left !== right;
            case "!=":
                // tslint:disable-next-line:triple-equals
                return left != right;
            case "&&":
            case "?":
                return left && right;
            case "||":
            case ":":
                return left || right;
        }
    };
    Compiler.prototype.nextToken = function () {
        this.index += 1;
        return this.token[this.index];
    };
    Compiler.prototype.prevToken = function () {
        return this.token[this.index - 1];
    };
    Compiler.prototype.addNode = function (operation, right, root) {
        var pre = root;
        // 增加右节点
        if (this.compare(pre.operation, operation) < 0 && !pre.grouped) {
            // 依次找到最右一个节点
            while (pre.right !== null &&
                typeof pre.right !== "string" &&
                this.compare(pre.right.operation, operation) < 0 &&
                !pre.right.grouped) {
                pre = pre.right;
            }
            pre.right = {
                operation: operation,
                left: pre.right,
                right: right,
            };
            return root;
        }
        // 增加一个左节点
        return {
            left: pre,
            right: right,
            operation: operation,
        };
    };
    Compiler.prototype.compare = function (a, b) {
        if (!exports.OPERATION.hasOwnProperty(a) || !exports.OPERATION.hasOwnProperty(b)) {
            throw new Error("unknow operation ".concat(a, " or ").concat(b));
        }
        return exports.OPERATION[a] - exports.OPERATION[b];
    };
    Compiler.prototype.getValue = function (val, context, ref) {
        if (typeof val !== "string" && val !== null) {
            return this.calc(val, context, ref);
        }
        if (val === null || exports.OPERATION[val] !== undefined) {
            throw new Error("unknow value " + val);
        }
        if (val.indexOf("@") !== -1) {
            return this.getValueFn(context, val.slice(1));
        }
        // 上下文查找
        if (val.indexOf("$") !== -1) {
            return this.getValueFn(ref, val.slice(1));
        }
        // 字符串
        if (val[0] === "'" || val[0] === '"') {
            return val.slice(1, -1);
        }
        // 布尔
        if (val === "true") {
            return true;
        }
        if (val === "false") {
            return false;
        }
        // is number
        var value = parseFloat(val);
        if (!isNaN(value)) {
            return value;
        }
        // all other lookup from context
        return this.getValueFn(context, val);
    };
    Compiler.prototype.parseStatement = function () {
        var token = this.nextToken();
        if (token === "(") {
            this.blockLevel += 1;
            var node = this.parse();
            this.blockLevel -= 1;
            if (typeof node !== "string") {
                node.grouped = true;
            }
            return node;
        }
        if (token === ")") {
            return null;
        }
        if (token === "!") {
            return { left: null, operation: token, right: this.parseStatement() };
        }
        // 3 > -12 or -12 + 10
        if (token === "-" && (exports.OPERATION[this.prevToken()] > 0 || this.prevToken() === undefined)) {
            return { left: "0", operation: token, right: this.parseStatement(), grouped: true };
        }
        return token;
    };
    return Compiler;
}());
exports.default = Compiler;
//# sourceMappingURL=compiler.js.map