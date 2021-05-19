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
exports.transformerFactory = exports.apply = exports.toClientOperation = exports.toServerOperation = exports.toClientState = exports.upOperation = exports.downOperation = exports.state = void 0;
const t = __importStar(require("io-ts"));
const Result_1 = require("../../../../Result");
const utils_1 = require("../../../../utils");
const io_ts_1 = require("../../../../io-ts");
const ReplaceValueOperation = __importStar(require("../../util/replaceOperation"));
const v1_1 = require("../../../filePath/v1");
const operation_1 = require("../../util/operation");
const stringDownOperation = t.type({ oldValue: t.string });
const stringUpOperation = t.type({ newValue: t.string });
const numberDownOperation = t.type({ oldValue: t.number });
const numberUpOperation = t.type({ newValue: t.number });
exports.state = t.type({
    version: t.literal(1),
    backgroundImage: io_ts_1.maybe(v1_1.filePath),
    backgroundImageZoom: t.number,
    cellColumnCount: t.number,
    cellHeight: t.number,
    cellOffsetX: t.number,
    cellOffsetY: t.number,
    cellRowCount: t.number,
    cellWidth: t.number,
    name: t.string,
});
exports.downOperation = operation_1.operation(1, {
    backgroundImage: t.type({ oldValue: io_ts_1.maybe(v1_1.filePath) }),
    backgroundImageZoom: numberDownOperation,
    cellColumnCount: numberDownOperation,
    cellHeight: numberDownOperation,
    cellOffsetX: numberDownOperation,
    cellOffsetY: numberDownOperation,
    cellRowCount: numberDownOperation,
    cellWidth: numberDownOperation,
    name: stringDownOperation,
});
exports.upOperation = operation_1.operation(1, {
    backgroundImage: t.type({ newValue: io_ts_1.maybe(v1_1.filePath) }),
    backgroundImageZoom: numberUpOperation,
    cellColumnCount: numberUpOperation,
    cellHeight: numberUpOperation,
    cellOffsetX: numberUpOperation,
    cellOffsetY: numberUpOperation,
    cellRowCount: numberUpOperation,
    cellWidth: numberUpOperation,
    name: stringUpOperation,
});
const toClientState = (source) => source;
exports.toClientState = toClientState;
const toServerOperation = (source) => {
    return source;
};
exports.toServerOperation = toServerOperation;
const toClientOperation = ({ diff }) => {
    return diff;
};
exports.toClientOperation = toClientOperation;
const apply = ({ state, operation }) => {
    const result = Object.assign({}, state);
    if (operation.backgroundImage != null) {
        result.backgroundImage = operation.backgroundImage.newValue;
    }
    if (operation.backgroundImageZoom != null) {
        result.backgroundImageZoom = operation.backgroundImageZoom.newValue;
    }
    if (operation.cellColumnCount != null) {
        result.cellColumnCount = operation.cellColumnCount.newValue;
    }
    if (operation.cellHeight != null) {
        result.cellHeight = operation.cellHeight.newValue;
    }
    if (operation.cellOffsetX != null) {
        result.cellOffsetX = operation.cellOffsetX.newValue;
    }
    if (operation.cellOffsetY != null) {
        result.cellOffsetY = operation.cellOffsetY.newValue;
    }
    if (operation.cellRowCount != null) {
        result.cellRowCount = operation.cellRowCount.newValue;
    }
    if (operation.cellWidth != null) {
        result.cellWidth = operation.cellWidth.newValue;
    }
    if (operation.name != null) {
        result.name = operation.name.newValue;
    }
    return Result_1.ResultModule.ok(result);
};
exports.apply = apply;
exports.transformerFactory = ({
    composeLoose: ({ first, second }) => {
        const valueProps = {
            version: 1,
            backgroundImage: ReplaceValueOperation.composeDownOperation(first.backgroundImage, second.backgroundImage),
            backgroundImageZoom: ReplaceValueOperation.composeDownOperation(first.backgroundImageZoom, second.backgroundImageZoom),
            cellColumnCount: ReplaceValueOperation.composeDownOperation(first.cellColumnCount, second.cellColumnCount),
            cellHeight: ReplaceValueOperation.composeDownOperation(first.cellHeight, second.cellHeight),
            cellOffsetX: ReplaceValueOperation.composeDownOperation(first.cellOffsetX, second.cellOffsetX),
            cellOffsetY: ReplaceValueOperation.composeDownOperation(first.cellOffsetY, second.cellOffsetY),
            cellRowCount: ReplaceValueOperation.composeDownOperation(first.cellRowCount, second.cellRowCount),
            cellWidth: ReplaceValueOperation.composeDownOperation(first.cellWidth, second.cellWidth),
            name: ReplaceValueOperation.composeDownOperation(first.name, second.name),
        };
        return Result_1.ResultModule.ok(valueProps);
    },
    restore: ({ nextState, downOperation }) => {
        var _a, _b, _c;
        if (downOperation === undefined) {
            return Result_1.ResultModule.ok({ prevState: nextState, twoWayOperation: undefined });
        }
        const prevState = Object.assign({}, nextState);
        const twoWayOperation = { version: 1 };
        if (downOperation.backgroundImage !== undefined) {
            prevState.backgroundImage = (_a = downOperation.backgroundImage.oldValue) !== null && _a !== void 0 ? _a : undefined;
            twoWayOperation.backgroundImage = { oldValue: (_b = downOperation.backgroundImage.oldValue) !== null && _b !== void 0 ? _b : undefined, newValue: (_c = nextState.backgroundImage) !== null && _c !== void 0 ? _c : undefined };
        }
        if (downOperation.backgroundImageZoom !== undefined) {
            prevState.backgroundImageZoom = downOperation.backgroundImageZoom.oldValue;
            twoWayOperation.backgroundImageZoom = Object.assign(Object.assign({}, downOperation.backgroundImageZoom), { newValue: nextState.backgroundImageZoom });
        }
        if (downOperation.cellColumnCount !== undefined) {
            prevState.cellColumnCount = downOperation.cellColumnCount.oldValue;
            twoWayOperation.cellColumnCount = Object.assign(Object.assign({}, downOperation.cellColumnCount), { newValue: nextState.cellColumnCount });
        }
        if (downOperation.cellHeight !== undefined) {
            prevState.cellHeight = downOperation.cellHeight.oldValue;
            twoWayOperation.cellHeight = Object.assign(Object.assign({}, downOperation.cellHeight), { newValue: nextState.cellHeight });
        }
        if (downOperation.cellOffsetX !== undefined) {
            prevState.cellOffsetX = downOperation.cellOffsetX.oldValue;
            twoWayOperation.cellOffsetX = Object.assign(Object.assign({}, downOperation.cellOffsetX), { newValue: nextState.cellOffsetX });
        }
        if (downOperation.cellOffsetY !== undefined) {
            prevState.cellOffsetY = downOperation.cellOffsetY.oldValue;
            twoWayOperation.cellOffsetY = Object.assign(Object.assign({}, downOperation.cellOffsetY), { newValue: nextState.cellOffsetY });
        }
        if (downOperation.cellRowCount !== undefined) {
            prevState.cellRowCount = downOperation.cellRowCount.oldValue;
            twoWayOperation.cellRowCount = Object.assign(Object.assign({}, downOperation.cellRowCount), { newValue: nextState.cellRowCount });
        }
        if (downOperation.cellWidth !== undefined) {
            prevState.cellWidth = downOperation.cellWidth.oldValue;
            twoWayOperation.cellWidth = Object.assign(Object.assign({}, downOperation.cellWidth), { newValue: nextState.cellWidth });
        }
        if (downOperation.name !== undefined) {
            prevState.name = downOperation.name.oldValue;
            twoWayOperation.name = Object.assign(Object.assign({}, downOperation.name), { newValue: nextState.name });
        }
        return Result_1.ResultModule.ok({ prevState, twoWayOperation });
    },
    transform: ({ prevState, clientOperation, serverOperation }) => {
        const twoWayOperation = { version: 1 };
        twoWayOperation.backgroundImage = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.backgroundImage,
            second: clientOperation.backgroundImage,
            prevState: prevState.backgroundImage,
        });
        twoWayOperation.backgroundImageZoom = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.backgroundImageZoom,
            second: clientOperation.backgroundImageZoom,
            prevState: prevState.backgroundImageZoom,
        });
        twoWayOperation.cellColumnCount = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellColumnCount,
            second: clientOperation.cellColumnCount,
            prevState: prevState.cellColumnCount,
        });
        twoWayOperation.cellHeight = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellHeight,
            second: clientOperation.cellHeight,
            prevState: prevState.cellHeight,
        });
        twoWayOperation.cellOffsetX = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellOffsetX,
            second: clientOperation.cellOffsetX,
            prevState: prevState.cellOffsetX,
        });
        twoWayOperation.cellOffsetY = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellOffsetY,
            second: clientOperation.cellOffsetY,
            prevState: prevState.cellOffsetY,
        });
        twoWayOperation.cellRowCount = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellRowCount,
            second: clientOperation.cellRowCount,
            prevState: prevState.cellRowCount,
        });
        twoWayOperation.cellWidth = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.cellWidth,
            second: clientOperation.cellWidth,
            prevState: prevState.cellWidth,
        });
        twoWayOperation.name = ReplaceValueOperation.transform({
            first: serverOperation === null || serverOperation === void 0 ? void 0 : serverOperation.name,
            second: clientOperation.name,
            prevState: prevState.name,
        });
        if (utils_1.undefinedForAll(twoWayOperation)) {
            return Result_1.ResultModule.ok(undefined);
        }
        return Result_1.ResultModule.ok(twoWayOperation);
    },
    diff: ({ prevState, nextState }) => {
        const resultType = { version: 1 };
        if (prevState.backgroundImage !== nextState.backgroundImage) {
            resultType.backgroundImage = { oldValue: prevState.backgroundImage, newValue: nextState.backgroundImage };
        }
        if (prevState.backgroundImageZoom !== nextState.backgroundImageZoom) {
            resultType.backgroundImageZoom = { oldValue: prevState.backgroundImageZoom, newValue: nextState.backgroundImageZoom };
        }
        if (prevState.cellColumnCount !== nextState.cellColumnCount) {
            resultType.cellColumnCount = { oldValue: prevState.cellColumnCount, newValue: nextState.cellColumnCount };
        }
        if (prevState.cellHeight !== nextState.cellHeight) {
            resultType.cellHeight = { oldValue: prevState.cellHeight, newValue: nextState.cellHeight };
        }
        if (prevState.cellOffsetX !== nextState.cellOffsetX) {
            resultType.cellOffsetX = { oldValue: prevState.cellOffsetX, newValue: nextState.cellOffsetX };
        }
        if (prevState.cellOffsetY !== nextState.cellOffsetY) {
            resultType.cellOffsetY = { oldValue: prevState.cellOffsetY, newValue: nextState.cellOffsetY };
        }
        if (prevState.cellRowCount !== nextState.cellRowCount) {
            resultType.cellRowCount = { oldValue: prevState.cellRowCount, newValue: nextState.cellRowCount };
        }
        if (prevState.cellWidth !== nextState.cellWidth) {
            resultType.cellWidth = { oldValue: prevState.cellWidth, newValue: nextState.cellWidth };
        }
        if (prevState.name !== nextState.name) {
            resultType.name = { oldValue: prevState.name, newValue: nextState.name };
        }
        if (utils_1.undefinedForAll(resultType)) {
            return undefined;
        }
        return resultType;
    },
    applyBack: ({ downOperation, nextState }) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const result = Object.assign({}, nextState);
        if (downOperation.backgroundImage !== undefined) {
            result.backgroundImage = (_a = downOperation.backgroundImage.oldValue) !== null && _a !== void 0 ? _a : undefined;
        }
        if (downOperation.backgroundImageZoom !== undefined) {
            result.backgroundImageZoom = (_b = downOperation.backgroundImageZoom.oldValue) !== null && _b !== void 0 ? _b : undefined;
        }
        if (downOperation.cellColumnCount !== undefined) {
            result.cellColumnCount = (_c = downOperation.cellColumnCount.oldValue) !== null && _c !== void 0 ? _c : undefined;
        }
        if (downOperation.cellHeight !== undefined) {
            result.cellHeight = (_d = downOperation.cellHeight.oldValue) !== null && _d !== void 0 ? _d : undefined;
        }
        if (downOperation.cellOffsetX !== undefined) {
            result.cellOffsetX = (_e = downOperation.cellOffsetX.oldValue) !== null && _e !== void 0 ? _e : undefined;
        }
        if (downOperation.cellOffsetY !== undefined) {
            result.cellOffsetY = (_f = downOperation.cellOffsetY.oldValue) !== null && _f !== void 0 ? _f : undefined;
        }
        if (downOperation.cellRowCount !== undefined) {
            result.cellRowCount = (_g = downOperation.cellRowCount.oldValue) !== null && _g !== void 0 ? _g : undefined;
        }
        if (downOperation.cellWidth !== undefined) {
            result.cellWidth = (_h = downOperation.cellWidth.oldValue) !== null && _h !== void 0 ? _h : undefined;
        }
        if (downOperation.name !== undefined) {
            result.name = downOperation.name.oldValue;
        }
        return Result_1.ResultModule.ok(result);
    },
    toServerState: ({ clientState }) => clientState,
    protectedValuePolicy: {}
});
