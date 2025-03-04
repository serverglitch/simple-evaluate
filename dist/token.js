"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperationType;
(function (OperationType) {
    // = & |
    OperationType[OperationType["LOGIC"] = 1] = "LOGIC";
    // > < !
    OperationType[OperationType["COMPARISON"] = 2] = "COMPARISON";
    // ' "
    OperationType[OperationType["STRING"] = 3] = "STRING";
    // + - * /
    OperationType[OperationType["MATH"] = 4] = "MATH";
})(OperationType || (OperationType = {}));
var Lexer = /** @class */ (function () {
    function Lexer(expression) {
        // current postion
        this.currentIndex = 0;
        // result token list
        this.tokenList = [];
        // input string
        this.input = '';
        // operation table
        this.optable = {
            '=': OperationType.LOGIC,
            '&': OperationType.LOGIC,
            '|': OperationType.LOGIC,
            '?': OperationType.LOGIC,
            ':': OperationType.LOGIC,
            '\'': OperationType.STRING,
            '"': OperationType.STRING,
            '!': OperationType.COMPARISON,
            '>': OperationType.COMPARISON,
            '<': OperationType.COMPARISON,
            '(': OperationType.MATH,
            ')': OperationType.MATH,
            '+': OperationType.MATH,
            '-': OperationType.MATH,
            '*': OperationType.MATH,
            '/': OperationType.MATH,
            '%': OperationType.MATH,
        };
        this.input = expression;
    }
    Lexer.prototype.getTokens = function () {
        var tok;
        do {
            // read current token, so step should be -1
            tok = this.pickNext(-1);
            var pos = this.currentIndex;
            switch (this.optable[tok]) {
                case OperationType.LOGIC:
                    // == && || ===
                    this.readLogicOpt(tok);
                    break;
                case OperationType.STRING:
                    this.readString(tok);
                    break;
                case OperationType.COMPARISON:
                    this.readCompare(tok);
                    break;
                case OperationType.MATH:
                    this.receiveToken();
                    break;
                default:
                    this.readValue(tok);
            }
            // if the pos not changed, this loop will go into a infinite loop, every step of while loop,
            // we must move the pos forward
            // so here we should throw error, for example `1 & 2`
            if (pos === this.currentIndex && tok !== undefined) {
                var err = new Error("unknown token ".concat(tok, " from input string ").concat(this.input));
                err.name = 'UnknowToken';
                throw err;
            }
        } while (tok !== undefined);
        return this.tokenList;
    };
    /**
     * read next token, the index param can set next step, default go foward 1 step
     *
     * @param index next postion
     */
    Lexer.prototype.pickNext = function (index) {
        if (index === void 0) { index = 0; }
        return this.input[index + this.currentIndex + 1];
    };
    /**
     * Store token into result tokenList, and move the pos index
     *
     * @param index
     */
    Lexer.prototype.receiveToken = function (index) {
        if (index === void 0) { index = 1; }
        var tok = this.input.slice(this.currentIndex, this.currentIndex + index).trim();
        // skip empty string
        if (tok) {
            this.tokenList.push(tok);
        }
        this.currentIndex += index;
    };
    // ' or "
    Lexer.prototype.readString = function (tok) {
        // 字符处理中间遇到其他特殊符号，一直找到后面一个引号或者单引号结束
        // 不支持转义
        var next;
        var index = 0;
        do {
            next = this.pickNext(index);
            index += 1;
        } while (next !== tok && next !== undefined);
        this.receiveToken(index + 1);
    };
    // > or < or >= or <= or !==
    // tok in (>, <, !)
    Lexer.prototype.readCompare = function (tok) {
        if (this.pickNext() !== '=') {
            this.receiveToken(1);
            return;
        }
        // !==
        if (tok === '!' && this.pickNext(1) === '=') {
            this.receiveToken(3);
            return;
        }
        this.receiveToken(2);
    };
    // === or ==
    // && ||
    Lexer.prototype.readLogicOpt = function (tok) {
        if (this.pickNext() === tok) {
            // ===
            if (tok === '=' && this.pickNext(1) === tok) {
                return this.receiveToken(3);
            }
            // == && ||
            return this.receiveToken(2);
        }
        if (this.pickNext() === '+' || this.pickNext() === '-' || this.pickNext() === '=') {
            // |+ |-
            return this.receiveToken(2);
        }
        // handle as &&
        // a ? b : c is equal to a && b || c
        if (tok === '?' || tok === ':') {
            return this.receiveToken(1);
        }
    };
    Lexer.prototype.readValue = function (tok) {
        if (!tok) {
            return;
        }
        var index = 0;
        while (!this.optable[tok] && tok !== undefined) {
            tok = this.pickNext(index);
            index += 1;
        }
        this.receiveToken(index);
    };
    return Lexer;
}());
function token(expression) {
    var lexer = new Lexer(expression);
    return lexer.getTokens();
}
exports.default = token;
//# sourceMappingURL=token.js.map