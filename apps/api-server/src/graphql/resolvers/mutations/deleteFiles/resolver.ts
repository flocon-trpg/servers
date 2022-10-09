import { Arg, Authorized, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { ENTRY } from '../../../../utils/roles';
import { RateLimitMiddleware } from '../../../middlewares/RateLimitMiddleware';
import { File } from '../../../../entities/file/entity';
import path from 'path';
import { remove, stat } from 'fs-extra';
import { thumbsDir } from '../../../../utils/thumbsDir';
import { ensureAuthorizedUser } from '../../utils/utils';
import { ResolverContext } from '../../../../types';
import { QueueMiddleware } from '../../../middlewares/QueueMiddleware';

@Resolver()
export class DeleteFilesResolver {
    @Mutation(() => [String], { description: 'since v0.7.8' })
    @Authorized(ENTRY)
    @UseMiddleware(QueueMiddleware, RateLimitMiddleware(2))
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
}
