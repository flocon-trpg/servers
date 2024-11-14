'use strict';

var dayjs = require('dayjs');
var timezone = require('dayjs/plugin/timezone');
var utc = require('dayjs/plugin/utc');
var _package = require('../../web-server/package.json.js');
var VERSION = require('./VERSION.js');

let isDayjsExtended = false;
const extendDayjs = () => {
    if (isDayjsExtended) {
        return;
    }
    dayjs.extend(utc);
    dayjs.extend(timezone);
    isDayjsExtended = true;
};
const getApiServerVersion = () => {
    return VERSION.VERSION.toString();
};
const getApiServerTag = () => {
    return `api/v${getApiServerVersion()}`;
};
const getWebServerVersion = () => {
    return _package.default.version;
};
const getWebServerTag = () => {
    return `web/v${getWebServerVersion()}`;
};
const getMainTag = () => {
    extendDayjs();
    const date = dayjs().tz('Asia/Tokyo').format('YY.M.D');
    return `v${date}.*`;
};

exports.getApiServerTag = getApiServerTag;
exports.getApiServerVersion = getApiServerVersion;
exports.getMainTag = getMainTag;
exports.getWebServerTag = getWebServerTag;
exports.getWebServerVersion = getWebServerVersion;
//# sourceMappingURL=gitTags.js.map
