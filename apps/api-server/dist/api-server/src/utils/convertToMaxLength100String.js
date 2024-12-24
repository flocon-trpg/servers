'use strict';

var FilePathModule = require('@flocon-trpg/core');

const convertToMaxLength100String = (source) => {
    const parsed = FilePathModule.maxLength100String.safeParse(source);
    if (parsed.success) {
        return parsed.data;
    }
    const sourceLengthIs100 = source.slice(0, 100);
    return FilePathModule.maxLength100String.parse(sourceLengthIs100);
};

exports.convertToMaxLength100String = convertToMaxLength100String;
//# sourceMappingURL=convertToMaxLength100String.js.map
