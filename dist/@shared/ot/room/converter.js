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
exports.exactDownOperation = exports.decodeDownOperation = exports.stringifyUpOperation = exports.parseUpOperation = exports.exactDbState = exports.decodeDbState = exports.stringifyState = exports.parseState = void 0;
const t = __importStar(require("io-ts"));
const Room = __importStar(require("./v1"));
const parseState = (source) => {
    const result = t.exact(Room.state).decode(JSON.parse(source));
    if (result._tag === 'Left') {
        throw 'parseState failure';
    }
    return result.right;
};
exports.parseState = parseState;
const stringifyState = (source) => {
    const result = t.exact(Room.state).encode(source);
    return JSON.stringify(result);
};
exports.stringifyState = stringifyState;
const decodeDbState = (source) => {
    const result = t.exact(Room.dbState).decode(source);
    if (result._tag === 'Left') {
        throw 'decodeDbState failure';
    }
    return result.right;
};
exports.decodeDbState = decodeDbState;
const exactDbState = (source) => {
    return t.exact(Room.dbState).encode(source);
};
exports.exactDbState = exactDbState;
const parseUpOperation = (source) => {
    const result = t.exact(Room.upOperation).decode(JSON.parse(source));
    if (result._tag === 'Left') {
        throw 'parseUpOperation failure';
    }
    return result.right;
};
exports.parseUpOperation = parseUpOperation;
const stringifyUpOperation = (source) => {
    const result = t.exact(Room.upOperation).encode(source);
    return JSON.stringify(result);
};
exports.stringifyUpOperation = stringifyUpOperation;
const decodeDownOperation = (source) => {
    const result = t.exact(Room.downOperation).decode(source);
    if (result._tag === 'Left') {
        throw 'decodeRoomDownOperation failure';
    }
    return result.right;
};
exports.decodeDownOperation = decodeDownOperation;
const exactDownOperation = (source) => {
    return t.exact(Room.downOperation).encode(source);
};
exports.exactDownOperation = exactDownOperation;
