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
const promiseQueue_1 = require("../../utils/promiseQueue");
const messages_1 = require("./utils/messages");
const mikro_orm_1 = require("../entities/user/mikro-orm");
const graphql_1 = require("../entities/pong/graphql");
const Topics_1 = require("../utils/Topics");
const EntryToServerResult_1 = require("../results/EntryToServerResult");
const GetAvailableGameSystemsResult_1 = require("../results/GetAvailableGameSystemsResult");
const main_1 = require("../../messageAnalyzer/main");
const graphql_2 = require("../entities/serverInfo/graphql");
const VERSION_1 = __importDefault(require("../../VERSION"));
const PrereleaseType_1 = require("../../enums/PrereleaseType");
const util_1 = require("@kizahasi/util");
const BaasType_1 = require("../../enums/BaasType");
const GetFilesResult_1 = require("../results/GetFilesResult");
const roles_1 = require("../../roles");
const object_args_input_1 = require("./object+args+input");
const mikro_orm_2 = require("../entities/file/mikro-orm");
const core_1 = require("@mikro-orm/core");
const mikro_orm_3 = require("../entities/fileTag/mikro-orm");
let MainResolver = class MainResolver {
    async getAvailableGameSystems() {
        return {
            value: main_1.listAvailableGameSystems(),
        };
    }
    async getFiles(input, context) {
        const user = helpers_1.ensureAuthorizedUser(context);
        const files = await context.em.find(mikro_orm_2.File, { createdBy: { userUid: user.userUid } }, { orderBy: { screenname: core_1.QueryOrder.ASC } });
        return {
            files: files.map(file => {
                var _a;
                return (Object.assign(Object.assign({}, file), { createdBy: file.createdBy.userUid, createdAt: (_a = file.createdAt) === null || _a === void 0 ? void 0 : _a.getTime() }));
            }),
        };
    }
    async deleteFiles(filenames, context) {
        const result = [];
        const user = helpers_1.ensureAuthorizedUser(context);
        for (const filename in filenames) {
            const file = await context.em.findOne(mikro_orm_2.File, { createdBy: user, filename });
            if (file != null) {
                result.push(file.filename);
                user.files.remove(file);
                file.fileTags.removeAll();
                context.em.remove(file);
            }
        }
        await context.em.flush();
        return result;
    }
    async editFileTags(input, context) {
        const user = helpers_1.ensureAuthorizedUser(context);
        const map = new util_1.DualKeyMap();
        input.actions.forEach(action => {
            action.add.forEach(a => {
                const value = map.get({ first: action.filename, second: a });
                map.set({ first: action.filename, second: a }, (value !== null && value !== void 0 ? value : 0) + 1);
            });
            action.remove.forEach(r => {
                const value = map.get({ first: action.filename, second: r });
                map.set({ first: action.filename, second: r }, (value !== null && value !== void 0 ? value : 0) - 1);
            });
        });
        for (const [filename, actions] of map.toMap()) {
            let fileEntity = null;
            for (const [fileTagId, action] of actions) {
                if (action === 0 || !util_1.isStrIndex10(fileTagId)) {
                    continue;
                }
                if (fileEntity == null) {
                    fileEntity = await context.em.findOne(mikro_orm_2.File, {
                        filename,
                        createdBy: { userUid: user.userUid },
                    });
                }
                if (fileEntity == null) {
                    break;
                }
                const fileTag = await context.em.findOne(mikro_orm_3.FileTag, { id: fileTagId });
                if (fileTag == null) {
                    continue;
                }
                if (0 < action) {
                    fileEntity.fileTags.add(fileTag);
                    fileTag.files.add(fileEntity);
                }
                else {
                    fileEntity.fileTags.remove(fileTag);
                    fileTag.files.remove(fileEntity);
                }
            }
        }
        await context.em.flush();
        return true;
    }
    async createFileTag(context, tagName) {
        const maxTagsCount = 10;
        const user = helpers_1.ensureAuthorizedUser(context);
        const tagsCount = await context.em.count(mikro_orm_3.FileTag, { user });
        if (maxTagsCount <= tagsCount) {
            return null;
        }
        const newFileTag = new mikro_orm_3.FileTag({ name: tagName });
        newFileTag.name = tagName;
        newFileTag.user = core_1.Reference.create(user);
        return {
            id: newFileTag.id,
            name: newFileTag.name,
        };
    }
    async deleteFileTag(context, tagId) {
        const user = helpers_1.ensureAuthorizedUser(context);
        const fileTagToDelete = await context.em.findOne(mikro_orm_3.FileTag, { user, id: tagId });
        if (fileTagToDelete == null) {
            return false;
        }
        fileTagToDelete.files.getItems().forEach(x => context.em.remove(x));
        fileTagToDelete.files.removeAll();
        context.em.remove(fileTagToDelete);
        await context.em.flush();
        return true;
    }
    async isEntry(context) {
        const decodedIdToken = helpers_1.checkSignIn(context);
        if (decodedIdToken === helpers_1.NotSignIn) {
            return false;
        }
        return await helpers_1.checkEntry({
            em: context.em,
            userUid: decodedIdToken.uid,
            baasType: BaasType_1.BaasType.Firebase,
            serverConfig: context.serverConfig,
        });
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
            const em = context.em;
            const serverConfig = context.serverConfig;
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
            if (serverConfig.entryPassword == null) {
                user.isEntry = true;
                await em.flush();
                return {
                    type: phrase == null
                        ? EntryToServerResultType_1.EntryToServerResultType.Success
                        : EntryToServerResultType_1.EntryToServerResultType.NoPhraseRequired,
                };
            }
            if (phrase == null || !(await helpers_1.comparePassword(phrase, serverConfig.entryPassword))) {
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
        if (result.type === promiseQueue_1.queueLimitReached) {
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
        await pubSub.publish(Topics_1.PONG, payload);
        return payload;
    }
    pong(payload) {
        return payload;
    }
};
__decorate([
    type_graphql_1.Query(() => GetAvailableGameSystemsResult_1.GetAvailableGameSystemsResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "getAvailableGameSystems", null);
__decorate([
    type_graphql_1.Query(() => GetFilesResult_1.GetFilesResult),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.GetFilesInput, Object]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "getFiles", null);
__decorate([
    type_graphql_1.Mutation(() => [String]),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('filenames', () => [String])),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "deleteFiles", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [object_args_input_1.EditFileTagsInput, Object]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "editFileTags", null);
__decorate([
    type_graphql_1.Mutation(() => object_args_input_1.FileTag, { nullable: true }),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg('tagName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "createFileTag", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.Authorized(roles_1.ENTRY),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "deleteFileTag", null);
__decorate([
    type_graphql_1.Query(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MainResolver.prototype, "isEntry", null);
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
