import {
    Arg,
    Authorized,
    Ctx,
    Mutation,
    PubSub,
    PubSubEngine,
    Query,
    Resolver,
    Root,
    Subscription,
    UseMiddleware,
} from 'type-graphql';
import { ResolverContext } from '../utils/Contexts';
import { EntryToServerResultType } from '../../enums/EntryToServerResultType';
import {
    checkEntry,
    checkSignIn,
    comparePassword,
    ensureAuthorizedUser,
    ensureUserUid,
    NotSignIn,
} from './utils/helpers';
import { queueLimitReached } from '../../utils/promiseQueue';
import { serverTooBusyMessage } from './utils/messages';
import { User } from '../entities/user/mikro-orm';
import { Pong } from '../entities/pong/graphql';
import { PONG } from '../utils/Topics';
import { EntryToServerResult } from '../results/EntryToServerResult';
import { GetAvailableGameSystemsResult } from '../results/GetAvailableGameSystemsResult';
import { helpMessage, listAvailableGameSystems } from '../../messageAnalyzer/main';
import { ServerInfo } from '../entities/serverInfo/graphql';
import { VERSION } from '../../VERSION';
import { PrereleaseType } from '../../enums/PrereleaseType';
import { alpha, beta, DualKeyMap, rc } from '@flocon-trpg/utils';
import { BaasType } from '../../enums/BaasType';
import { GetFilesResult } from '../results/GetFilesResult';
import { ENTRY } from '../../roles';
import { EditFileTagsInput, FileTag as FileTagGraphQL, GetFilesInput } from './object+args+input';
import { File } from '../entities/file/mikro-orm';
import { QueryOrder, Reference } from '@mikro-orm/core';
import { FileTag as FileTagEntity } from '../entities/fileTag/mikro-orm';
import { remove, stat } from 'fs-extra';
import path from 'path';
import { thumbsDir } from '../../utils/thumbsDir';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';
import { FilePermissionType } from '../../enums/FilePermissionType';

export type PongPayload = {
    value: number;
    createdBy?: string;
};

@Resolver()
export class MainResolver {
    @Query(() => GetAvailableGameSystemsResult)
    public async getAvailableGameSystems(): Promise<GetAvailableGameSystemsResult> {
        return {
            value: listAvailableGameSystems(),
        };
    }

    @Query(() => String, { nullable: true })
    public async getDiceHelpMessage(@Arg('id') id: string): Promise<string | null> {
        return await helpMessage(id).catch(err => {
            if (err instanceof Error) {
                if (err.message === 'GameSystem is not found') {
                    return null;
                }
            }
            throw err;
        });
    }

    @Query(() => GetFilesResult)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async getFiles(
        @Arg('input') input: GetFilesInput,
        @Ctx() context: ResolverContext
    ): Promise<GetFilesResult> {
        const user = ensureAuthorizedUser(context);
        const fileTagsFilter = input.fileTagIds.map(
            id =>
                ({
                    fileTags: {
                        id,
                    },
                } as const)
        );
        const files = await context.em.find(
            File,
            {
                $and: [
                    ...fileTagsFilter,
                    {
                        $or: [
                            { listPermission: FilePermissionType.Entry },
                            { createdBy: { userUid: user.userUid } },
                        ],
                    },
                ],
            },
            { orderBy: { screenname: QueryOrder.ASC } }
        );
        return {
            files: files.map(file => ({
                ...file,
                createdBy: file.createdBy.userUid,
                createdAt: file.createdAt?.getTime(),
            })),
        };
    }

    @Mutation(() => [String])
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteFiles(
        @Arg('filenames', () => [String]) filenames: string[],
        @Ctx() context: ResolverContext
    ): Promise<string[]> {
        const directory = context.serverConfig.uploader?.directory;
        if (directory == null) {
            return [];
        }

        const filenamesToDelete: string[] = [];
        const thumbFilenamesToDelete: string[] = [];
        const user = ensureAuthorizedUser(context);
        for (const filename of filenames) {
            const file = await context.em.findOne(File, {
                createdBy: user,
                filename,
            });
            if (file != null) {
                if (file.thumbFilename != null) {
                    thumbFilenamesToDelete.push(file.thumbFilename);
                }
                filenamesToDelete.push(file.filename);
                await user.files.init();
                user.files.remove(file);
                await file.fileTags.init();
                file.fileTags.removeAll();
                context.em.remove(file);
            }
        }
        await context.em.flush();
        for (const filename of filenamesToDelete) {
            const filePath = path.resolve(directory, filename);
            const statResult = await stat(filePath).catch(err => {
                console.warn(
                    'stat(%s) threw an error. Maybe the file was not found?: %o',
                    filePath,
                    err
                );
                return false as const;
            });
            if (statResult === false) {
                continue;
            }
            // バグなどで想定外のディレクトリが指定されてしまったときの保険的対策として、fileかどうかチェックしている
            if (statResult.isFile()) {
                await remove(filePath);
            } else {
                console.warn('%s is not a file', filePath);
            }
        }
        for (const filename of thumbFilenamesToDelete) {
            const filePath = path.resolve(directory, thumbsDir, filename);
            const statResult = await stat(filePath).catch(err => {
                console.warn(
                    'stat(%s) threw an error. Maybe the file was not found?: %o',
                    filePath,
                    err
                );
                return false as const;
            });
            if (statResult === false) {
                continue;
            }
            // バグなどで想定外のディレクトリが指定されてしまったときの保険的対策として、fileかどうかチェックしている
            if (statResult.isFile()) {
                await remove(filePath);
            } else {
                console.warn('%s is not a file', filePath);
            }
        }
        return filenamesToDelete;
    }

    @Mutation(() => Boolean)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async editFileTags(
        @Arg('input') input: EditFileTagsInput,
        @Ctx() context: ResolverContext
    ): Promise<boolean> {
        const user = ensureAuthorizedUser(context);
        const map = new DualKeyMap<string, string, number>();
        input.actions.forEach(action => {
            action.add.forEach(a => {
                const value = map.get({ first: action.filename, second: a });
                map.set({ first: action.filename, second: a }, (value ?? 0) + 1);
            });
            action.remove.forEach(r => {
                const value = map.get({ first: action.filename, second: r });
                map.set({ first: action.filename, second: r }, (value ?? 0) - 1);
            });
        });
        for (const [filename, actions] of map.toMap()) {
            let fileEntity: File | null = null;
            for (const [fileTagId, action] of actions) {
                if (action === 0) {
                    continue;
                }
                if (fileEntity == null) {
                    fileEntity = await context.em.findOne(File, {
                        filename,
                        createdBy: { userUid: user.userUid },
                    });
                }
                if (fileEntity == null) {
                    break;
                }
                const fileTag = await context.em.findOne(FileTagEntity, { id: fileTagId });
                if (fileTag == null) {
                    continue;
                }
                if (0 < action) {
                    fileEntity.fileTags.add(fileTag);
                    fileTag.files.add(fileEntity);
                } else {
                    fileEntity.fileTags.remove(fileTag);
                    fileTag.files.remove(fileEntity);
                }
            }
        }
        await context.em.flush();
        return true;
    }

    @Mutation(() => FileTagGraphQL, { nullable: true })
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async createFileTag(
        @Ctx() context: ResolverContext,
        @Arg('tagName') tagName: string
    ): Promise<FileTagGraphQL | null> {
        const maxTagsCount = 10;

        const user = ensureAuthorizedUser(context);
        const tagsCount = await context.em.count(FileTagEntity, { user });
        if (maxTagsCount <= tagsCount) {
            return null;
        }
        const newFileTag = new FileTagEntity({ name: tagName });
        newFileTag.name = tagName;
        newFileTag.user = Reference.create<User, 'userUid'>(user);
        await context.em.persistAndFlush(newFileTag);
        return {
            id: newFileTag.id,
            name: newFileTag.name,
        };
    }

    @Mutation(() => Boolean)
    @Authorized(ENTRY)
    @UseMiddleware(RateLimitMiddleware(2))
    public async deleteFileTag(
        @Ctx() context: ResolverContext,
        @Arg('tagId') tagId: string
    ): Promise<boolean> {
        const user = ensureAuthorizedUser(context);
        // 他人のFileTagならば、IDが一致していても取得していない
        const fileTagToDelete = await context.em.findOne(FileTagEntity, { user, id: tagId });
        if (fileTagToDelete == null) {
            return false;
        }
        fileTagToDelete.files.getItems().forEach(x => context.em.remove(x));
        fileTagToDelete.files.removeAll();
        context.em.remove(fileTagToDelete);
        await context.em.flush();
        return true;
    }

    @Query(() => Boolean)
    @Authorized()
    @UseMiddleware(RateLimitMiddleware(1))
    public async isEntry(@Ctx() context: ResolverContext): Promise<boolean> {
        const userUid = ensureUserUid(context);
        return await checkEntry({
            em: context.em,
            userUid,
            baasType: BaasType.Firebase,
            serverConfig: context.serverConfig,
        });
    }

    // CONSIDER: 内部情報に簡単にアクセスできるのはセキュリティリスクになりうる。
    @Query(() => ServerInfo)
    public async getServerInfo(@Ctx() context: ResolverContext): Promise<ServerInfo> {
        const prerelease = (() => {
            if (VERSION.prerelease == null) {
                return undefined;
            }
            switch (VERSION.prerelease.type) {
                case alpha:
                    return {
                        ...VERSION.prerelease,
                        type: PrereleaseType.Alpha,
                    };
                case beta:
                    return {
                        ...VERSION.prerelease,
                        type: PrereleaseType.Beta,
                    };
                case rc:
                    return {
                        ...VERSION.prerelease,
                        type: PrereleaseType.Rc,
                    };
            }
        })();
        return {
            version: {
                ...VERSION,
                prerelease,
            },
            uploaderEnabled: context.serverConfig.uploader != null,
        };
    }

    @Mutation(() => EntryToServerResult)
    public async entryToServer(
        // TODO: 現状ではphraseよりはpasswordという名前のほうが適切なのでリネームするほうが良い
        @Arg('phrase', () => String, { nullable: true }) phrase: string | null | undefined,
        @Ctx() context: ResolverContext
    ): Promise<EntryToServerResult> {
        const queue = async () => {
            const em = context.em;

            const serverConfig = context.serverConfig;
            const decodedIdToken = checkSignIn(context);
            if (decodedIdToken === NotSignIn) {
                return {
                    type: EntryToServerResultType.NotSignIn,
                };
            }

            let user = await em.findOne(User, { userUid: decodedIdToken.uid });
            if (user == null) {
                user = new User({ userUid: decodedIdToken.uid, baasType: BaasType.Firebase });
                user.isEntry = false;
                em.persist(user);
            }
            if (user.isEntry) {
                return {
                    type: EntryToServerResultType.AlreadyEntried,
                };
            }
            if (serverConfig.entryPassword == null) {
                user.isEntry = true;
                await em.flush();
                return {
                    type:
                        phrase == null
                            ? EntryToServerResultType.Success
                            : EntryToServerResultType.NoPhraseRequired,
                };
            }

            if (phrase == null || !(await comparePassword(phrase, serverConfig.entryPassword))) {
                return {
                    type: EntryToServerResultType.WrongPhrase,
                };
            }

            user.isEntry = true;
            await em.flush();
            return {
                type: EntryToServerResultType.Success,
            };
        };

        const result = await context.promiseQueue.next(queue);
        if (result.type === queueLimitReached) {
            throw serverTooBusyMessage;
        }
        return result.value;
    }

    @Mutation(() => Pong, { description: 'for test' })
    public async ping(
        @Arg('value') value: number,
        @Ctx() context: ResolverContext,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Pong> {
        const createdBy =
            context.decodedIdToken?.isError === false
                ? context.decodedIdToken.value.uid
                : undefined;
        const payload: PongPayload = { value, createdBy };
        await pubSub.publish(PONG, payload);
        return payload;
    }

    @Subscription(() => Pong, { topics: PONG, description: 'for test' })
    public pong(@Root() payload: PongPayload): Pong {
        return payload;
    }
}
