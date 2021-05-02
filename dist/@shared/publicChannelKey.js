"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicChannelKey = void 0;
const Constants_1 = require("./Constants");
const strIndex10Array = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
];
var PublicChannelKey;
(function (PublicChannelKey) {
    let StrIndex10;
    (function (StrIndex10) {
        StrIndex10.publicChannelKeys = [
            ...strIndex10Array,
        ];
        StrIndex10.isPublicChannelKey = (source) => {
            return StrIndex10.publicChannelKeys.find(key => key === source) !== undefined;
        };
    })(StrIndex10 = PublicChannelKey.StrIndex10 || (PublicChannelKey.StrIndex10 = {}));
    let Without$System;
    (function (Without$System) {
        Without$System.publicChannelKeys = [
            ...strIndex10Array,
            Constants_1.$free,
        ];
        Without$System.isPublicChannelKey = (source) => {
            return Without$System.publicChannelKeys.find(key => key === source) !== undefined;
        };
    })(Without$System = PublicChannelKey.Without$System || (PublicChannelKey.Without$System = {}));
    let With$System;
    (function (With$System) {
        With$System.publicChannelKeys = [
            ...strIndex10Array,
            Constants_1.$free,
            Constants_1.$system,
        ];
        With$System.isPublicChannelKey = (source) => {
            return With$System.publicChannelKeys.find(key => key === source) !== undefined;
        };
    })(With$System = PublicChannelKey.With$System || (PublicChannelKey.With$System = {}));
})(PublicChannelKey = exports.PublicChannelKey || (exports.PublicChannelKey = {}));
