"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token = exports.Compiler = void 0;
var token_1 = __importDefault(require("./token"));
exports.token = token_1.default;
var compiler_1 = __importDefault(require("./compiler"));
exports.Compiler = compiler_1.default;
function evaluate(context, ref, expr, option) {
    var tokenList = (0, token_1.default)(expr);
    var compiler = new compiler_1.default(tokenList, option && option.getValue);
    var astTree = compiler.parse();
    return compiler.calc(astTree, context, ref);
}
exports.default = evaluate;
//# sourceMappingURL=simple-evaluate.js.map