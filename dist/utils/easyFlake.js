"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyFlake = void 0;
const uuid_1 = require("uuid");
const easyFlake = () => {
    return `${new Date().getTime()}_${(0, uuid_1.v4)()}`;
};
exports.easyFlake = easyFlake;
