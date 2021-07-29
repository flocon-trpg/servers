"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestedBy = exports.server = exports.client = void 0;
exports.client = 'client';
exports.server = 'server';
var RequestedBy;
(function (RequestedBy) {
    RequestedBy.createdByMe = ({ requestedBy, userUid, }) => {
        if (requestedBy.type === exports.server) {
            return true;
        }
        return requestedBy.userUid === userUid;
    };
})(RequestedBy = exports.RequestedBy || (exports.RequestedBy = {}));
