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
exports.FileSourceType = void 0;
const FilePathModule = __importStar(require("../@shared/ot/filePath/v1"));
var FileSourceType;
(function (FileSourceType) {
    FileSourceType["Default"] = "Default";
    FileSourceType["FirebaseStorage"] = "FirebaseStorage";
})(FileSourceType = exports.FileSourceType || (exports.FileSourceType = {}));
(function (FileSourceType) {
    FileSourceType.ofString = (source) => {
        switch (source) {
            case FilePathModule.Default:
                return FileSourceType.Default;
            case FilePathModule.FirebaseStorage:
                return FileSourceType.FirebaseStorage;
        }
    };
    FileSourceType.ofNullishString = (source) => {
        switch (source) {
            case null:
            case undefined:
                return undefined;
            default:
                return FileSourceType.ofString(source);
        }
    };
})(FileSourceType = exports.FileSourceType || (exports.FileSourceType = {}));
