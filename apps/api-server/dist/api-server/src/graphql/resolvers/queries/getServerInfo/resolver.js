'use strict';

var tslib = require('tslib');
var utils = require('@flocon-trpg/utils');
var typeGraphql = require('type-graphql');
var VERSION = require('../../../../VERSION.js');
var PrereleaseType = require('../../../../enums/PrereleaseType.js');
var serverInfo = require('../../../objects/serverInfo.js');

exports.GetServerInfoResolver = class GetServerInfoResolver {
    async getServerInfo(context) {
        const prerelease = (() => {
            if (VERSION.VERSION.prerelease == null) {
                return undefined;
            }
            switch (VERSION.VERSION.prerelease.type) {
                case utils.alpha:
                    return {
                        ...VERSION.VERSION.prerelease,
                        type: PrereleaseType.PrereleaseType.Alpha,
                    };
                case utils.beta:
                    return {
                        ...VERSION.VERSION.prerelease,
                        type: PrereleaseType.PrereleaseType.Beta,
                    };
                case utils.rc:
                    return {
                        ...VERSION.VERSION.prerelease,
                        type: PrereleaseType.PrereleaseType.Rc,
                    };
            }
        })();
        return {
            version: {
                ...VERSION.VERSION,
                prerelease,
            },
            uploaderEnabled: context.serverConfig.uploader != null,
        };
    }
};
tslib.__decorate([
    typeGraphql.Query(() => serverInfo.ServerInfo),
    tslib.__param(0, typeGraphql.Ctx()),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [Object]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetServerInfoResolver.prototype, "getServerInfo", null);
exports.GetServerInfoResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetServerInfoResolver);
//# sourceMappingURL=resolver.js.map
