"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainResolver = void 0;
const type_graphql_1 = require("type-graphql");
const EntryToServerResultType_1 = require("../../enums/EntryToServerResultType");
const helpers_1 = require("./utils/helpers");
const PromiseQueue_1 = require("../../utils/PromiseQueue");
const messages_1 = require("./utils/messages");
const mikro_orm_1 = require("../entities/user/mikro-orm");
const graphql_1 = require("../entities/pong/graphql");
const Topics_1 = require("../utils/Topics");
const config_1 = require("../../config");
const EntryToServerResult_1 = require("../results/EntryToServerResult");
const ListAvailableGameSystemsResult_1 = require("../results/ListAvailableGameSystemsResult");
const main_1 = require("../../messageAnalyzer/main");
const graphql_2 = require("../entities/serverInfo/graphql");
const VERSION_1 = __importDefault(require("../../VERSION"));
const PrereleaseType_1 = require("../../enums/PrereleaseType");
const util_1 = require("@kizahasi/util");
const BaasType_1 = require("../../enums/BaasType");
let MainResolver = class MainResolver {
    async listAvailableGameSystems() {
        return {
            value: main_1.listAvailableGameSystems(),
        };
    }
    async getServerInfo() {
        const prerelease = (() => {
            if (VERSION_1.default.prerelease == null) {
                return undefined;
            }
            switch (VERSION_1.default.prerelease.type) {
                case util_1.alpha:
                    return Object.assign(Object.assign({}, VERSION_1.default.prerelease), { type: PrereleaseType_1.PrereleaseType.Alpha });
                case util_1.beta:
                    return Object.assign(Object.assign({}, VERSION_1.default.prerelease), { type: PrereleaseType_1.PrereleaseType.Beta });
                case util_1.rc:
                    return Object.assign(Object.assign({}, VERSION_1.default.prerelease), { type: PrereleaseType_1.PrereleaseType.Rc });
            }
        })();
        return {
            version: Object.assign(Object.assign({}, VERSION_1.default), { prerelease }),
        };
    }
    async entryToServer(phrase, context) {
        const queue = async () => {
            const em = context.createEm();
            const globalEntryPhrase = (await config_1.loadServerConfigAsMain()).globalEntryPhrase;
            const decodedIdToken = helpers_1.checkSignIn(context);
            if (decodedIdToken === helpers_1.NotSignIn) {
                return {
                    type: EntryToServerResultType_1.EntryToServerResultType.NotSignIn,
                };
            }
            let user = await em.findOne(mikro_orm_1.User, { userUid: decodedIdToken.uid });
            if (user == null) {
                user = new mikro_orm_1.User({ userUid: decodedIdToken.uid, baasType: BaasType_1.BaasType.Firebase });
                user.isEntry = false;
                em.persist(user);
            }
            if (user.isEntry) {
                return {
                    type: EntryToServerResultType_1.EntryToServerResultType.AlreadyEntried,
                };
            }
            if (globalEntryPhrase == null) {
                user.isEntry = true;
                await em.flush();
                return {
                    type: phrase == null
                        ? EntryToServerResultType_1.EntryToServerResultType.Success
                        : EntryToServerResultType_1.EntryToServerResultType.NoPhraseRequired,
                };
            }
            if (phrase !== globalEntryPhrase) {
                return {
                    type: EntryToServerResultType_1.EntryToServerResultType.WrongPhrase,
                };
            }
            user.isEntry = true;
            await em.flush();
            return {
                type: EntryToServerResultType_1.EntryToServerResultType.Success,
            };
        };
        const result = await context.promiseQueue.next(queue);
        if (result.type === PromiseQueue_1.queueLimitReached) {
            throw messages_1.serverTooBusyMessage;
        }
        return result.value;
    }
    async ping(value, context, pubSub) {
        var _a;
        const createdBy = ((_a = context.decodedIdToken) === null || _a === void 0 ? void 0 : _a.isError) === false
            ? context.decodedIdToken.value.uid
            : undefined;
        const payload = { value, createdBy };
        pubSub.publish(Topics_1.PONG, payload);
        return payload;
    }
    pong(payload) {
        return payload;
    }
};
__decorate([
    type_graphql_1.Query(() => ListAvailableGameSystemsResult_1.ListAvailableGameSystemsResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "listAvailableGameSystems", null);
__decorate([
    type_graphql_1.Query(() => graphql_2.ServerInfo),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "getServerInfo", null);
__decorate([
    type_graphql_1.Mutation(() => EntryToServerResult_1.EntryToServerResult),
    __param(0, type_graphql_1.Arg('phrase', () => String, { nullable: true })),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "entryToServer", null);
__decorate([
    type_graphql_1.Mutation(() => graphql_1.Pong, { description: 'for test' }),
    __param(0, type_graphql_1.Arg('value')),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "ping", null);
__decorate([
    type_graphql_1.Subscription(() => graphql_1.Pong, { topics: Topics_1.PONG, description: 'for test' }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", graphql_1.Pong)
], MainResolver.prototype, "pong", null);
MainResolver = __decorate([
    type_graphql_1.Resolver()
], MainResolver);
exports.MainResolver = MainResolver;
