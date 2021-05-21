"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exact = exports.parse = exports.decode = void 0;
const MyNumberValueLog = __importStar(require("./log-v1"));
const decode = (source) => {
    const result = MyNumberValueLog.exactMain.decode(source);
    if (result._tag === 'Left') {
        throw 'decode failure';
    }
    return result.right;
};
exports.decode = decode;
const parse = (source) => {
    return exports.decode(JSON.parse(source));
};
exports.parse = parse;
const exact = (source) => {
    return MyNumberValueLog.exactMain.encode(source);
};
exports.exact = exact;
