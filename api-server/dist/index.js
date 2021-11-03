"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const main_1 = require("./main");
const commandLineArgs_1 = require("./utils/commandLineArgs");
(0, commandLineArgs_1.loadAsMain)().then(args => {
    (0, main_1.main)({ debug: args.debug }).catch(err => console.error(err));
});
