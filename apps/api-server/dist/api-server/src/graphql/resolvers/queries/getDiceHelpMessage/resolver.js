'use strict';

var tslib = require('tslib');
var typeGraphql = require('type-graphql');
var messageAnalyzer = require('../../utils/messageAnalyzer.js');

exports.GetDiceHelpMessageResolver = class GetDiceHelpMessageResolver {
    async getDiceHelpMessage(id) {
        return await messageAnalyzer.helpMessage(id).catch(err => {
            if (err instanceof Error) {
                if (err.message === 'GameSystem is not found') {
                    return null;
                }
            }
            throw err;
        });
    }
};
tslib.__decorate([
    typeGraphql.Query(() => String, { nullable: true }),
    tslib.__param(0, typeGraphql.Arg('id')),
    tslib.__metadata("design:type", Function),
    tslib.__metadata("design:paramtypes", [String]),
    tslib.__metadata("design:returntype", Promise)
], exports.GetDiceHelpMessageResolver.prototype, "getDiceHelpMessage", null);
exports.GetDiceHelpMessageResolver = tslib.__decorate([
    typeGraphql.Resolver()
], exports.GetDiceHelpMessageResolver);
//# sourceMappingURL=resolver.js.map
