"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const main_1 = __importDefault(require("./main"));
const commandLineArgs_1 = require("./utils/commandLineArgs");
(0, commandLineArgs_1.loadAsMain)().then(args => {
    (0, main_1.default)({ debug: args.debug }).catch(err => console.error(err));
});
