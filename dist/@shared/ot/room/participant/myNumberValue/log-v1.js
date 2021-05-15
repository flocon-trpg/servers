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
exports.ofOperation = exports.exactMain = exports.main = exports.deleteType = exports.createType = exports.updateType = void 0;
const t = __importStar(require("io-ts"));
const recordOperationElement_1 = require("../../util/recordOperationElement");
const Piece = __importStar(require("../../../piece/v1"));
exports.updateType = 'update';
exports.createType = 'create';
exports.deleteType = 'delete';
const update = t.intersection([t.type({
        type: t.literal(exports.updateType),
        value: t.boolean,
        isValuePrivate: t.boolean,
    }), t.partial({
        pieces: t.record(t.string, t.record(t.string, recordOperationElement_1.recordUpOperationElementFactory(Piece.state, Piece.upOperation))),
    })]);
exports.main = t.union([
    t.type({ type: t.literal(exports.createType) }),
    t.type({ type: t.literal(exports.deleteType) }),
    update,
]);
exports.exactMain = t.union([
    t.strict({ type: t.literal(exports.createType) }),
    t.strict({ type: t.literal(exports.deleteType) }),
    t.exact(update),
]);
const ofOperation = (source) => {
    return {
        type: exports.updateType,
        value: source.value != null && source.value.oldValue !== source.value.newValue,
        isValuePrivate: source.isValuePrivate != null && source.isValuePrivate.oldValue !== source.isValuePrivate.newValue,
        pieces: source.pieces,
    };
};
exports.ofOperation = ofOperation;
