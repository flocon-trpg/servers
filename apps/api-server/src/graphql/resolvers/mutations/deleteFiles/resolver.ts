import path from 'path';
import { loggerRef } from '@flocon-trpg/utils';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { remove, stat } from 'fs-extra';
import { Auth, ENTRY } from '../../../../auth/auth.decorator';
import { AuthData, AuthDataType } from '../../../../auth/auth.guard';
import { File } from '../../../../mikro-orm/entities/file/entity';
import { User } from '../../../../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../../../../mikro-orm/mikro-orm.service';
import { ServerConfigService } from '../../../../server-config/server-config.service';
import { thumbsDir } from '../../../../utils/thumbsDir';

@Resolver(() => [String])
export class DeleteFilesResolver {
    public constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly serverConfigService: ServerConfigService,
    ) {}

    @Mutation(() => [String], { description: 'since v0.7.8' })
    @Auth(ENTRY)
    public async deleteFiles(
        @Args('filenames', { type: () => [String] }) filenames: string[],
        @AuthData() auth: AuthDataType,
    ): Promise<string[]> {
        const directory = this.serverConfigService.getValueForce().uploader?.directory;
        if (directory == null) {
            return [];
        }

        const em = await this.mikroOrmService.forkEmForMain();
        const filenamesToDelete: string[] = [];
        const thumbFilenamesToDelete: string[] = [];
        const user = await em.findOneOrFail(User, { userUid: auth.user.userUid });
        for (const filename of filenames) {
            const file = await em.findOne(File, {
                createdBy: { userUid: user.userUid },
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
                em.remove(file);
            }
        }
        await em.flush();
        for (const filename of filenamesToDelete) {
            const filePath = path.resolve(directory, filename);
            const statResult = await stat(filePath).catch((err: Error) => {
                loggerRef.warn(
                    err,
                    `stat(${filePath}) threw an error. Maybe the file was not found?`,
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
                loggerRef.warn(`${filePath} is not a file`);
            }
        }
        for (const filename of thumbFilenamesToDelete) {
            const filePath = path.resolve(directory, thumbsDir, filename);
            const statResult = await stat(filePath).catch((err: Error) => {
                loggerRef.warn(
                    err,
                    `stat(${filePath}) threw an error. Maybe the file was not found?`,
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
                loggerRef.warn(`${filePath} is not a file`);
            }
        }
        return filenamesToDelete;
    }
}
