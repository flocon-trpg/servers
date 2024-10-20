'use strict';

var FilePathModule = require('@flocon-trpg/core');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var FilePathModule__namespace = /*#__PURE__*/_interopNamespaceDefault(FilePathModule);

exports.FileSourceType = void 0;
(function (FileSourceType) {
    FileSourceType["Default"] = "Default";
    FileSourceType["Uploader"] = "Uploader";
    FileSourceType["FirebaseStorage"] = "FirebaseStorage";
})(exports.FileSourceType || (exports.FileSourceType = {}));
exports.FileSourceTypeModule = void 0;
(function (FileSourceTypeModule) {
    FileSourceTypeModule.ofString = (source) => {
        switch (source) {
            case FilePathModule__namespace.Default:
                return exports.FileSourceType.Default;
            case FilePathModule__namespace.FirebaseStorage:
                return exports.FileSourceType.FirebaseStorage;
            case FilePathModule__namespace.Uploader:
                return exports.FileSourceType.Uploader;
        }
    };
    FileSourceTypeModule.ofNullishString = (source) => {
        switch (source) {
            case null:
            case undefined:
                return undefined;
            default:
                return FileSourceTypeModule.ofString(source);
        }
    };
})(exports.FileSourceTypeModule || (exports.FileSourceTypeModule = {}));
//# sourceMappingURL=FileSourceType.js.map
