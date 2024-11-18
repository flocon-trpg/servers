import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { loggerRef } from '@flocon-trpg/utils';
import {
    BadRequestException,
    Controller,
    ForbiddenException,
    Get,
    Header,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
    Param,
    Post,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ensureDir } from 'fs-extra';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';
import { AccessControlAllowHeadersInterceptor } from '../access-control-allow-headers/access-control-allow-headers.interceptor';
import { AccessControlAllowOriginInterceptor } from '../access-control-allow-origin/access-control-allow-origin.interceptor';
import { Auth, ENTRY } from '../auth/auth.decorator';
import { AuthData, AuthDataType, AuthGuard } from '../auth/auth.guard';
import { FilePermissionType } from '../enums/FilePermissionType';
import { File } from '../mikro-orm/entities/file/entity';
import { User } from '../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../mikro-orm/mikro-orm.service';
import { ServerConfigService } from '../server-config/server-config.service';
import { UploaderEnabledPipe } from '../uploader-enabled/uploader-enabled.pipe';
import { easyFlake } from '../utils/easyFlake';

export const thumbsDir = 'thumbs';

const permissions = {
    unlisted: 'unlisted',
    public: 'public',
};

@Controller('uploader')
@UseInterceptors(AccessControlAllowOriginInterceptor, AccessControlAllowHeadersInterceptor)
export class ApiUploaderController implements OnModuleInit {
    constructor(
        private readonly mikroOrmService: MikroOrmService,
        private readonly serverConfigService: ServerConfigService,
    ) {}

    onModuleInit() {
        // 画像がアップロードされた際にsharpでサムネイル画像を生成する処理があるが、Windowsだとsharpによって生成元の画像がロックされてしまい、その後に削除できないことがある(https://github.com/lovell/sharp/issues/415#issuecomment-212817987)。それを防ぐため、ここでsharpのcacheを無効化している。
        // 現時点ではsharpのcacheを有効化するコードがないため、このコードは他の場所に移動してもいい。
        sharp.cache(false);
    }

    // TODO: rate limit を設定する
    @Get('/:type/:file_name')
    @Auth(ENTRY)
    // 現在は内蔵アップローダーのファイルを直接開く手段はクライアントには実装されていないが、念のためCSPを設定している
    @Header('Content-Security-Policy', "default-src 'self'; img-src *; media-src *")
    async getFile(@Param('type') typeParam: string, @Param('file_name') filenameParam: string) {
        const filename = sanitize(filenameParam);
        if (filename !== filenameParam) {
            throw new BadRequestException('file_name is invalid');
        }

        const serverConfig = this.serverConfigService.getValueForce();
        if (serverConfig.uploader?.enabled !== true) {
            throw new ForbiddenException('Flocon uploader is disabled by server config');
        }
        const nonResolvedDirectory = serverConfig.uploader.directory;
        if (nonResolvedDirectory == null) {
            throw new InternalServerErrorException(
                'set serverConfig.uploader.directory to use uploader',
            );
        }
        const directory = path.resolve(nonResolvedDirectory);

        let type: 'files' | 'thumbs';
        switch (typeParam) {
            case 'files':
                type = 'files';
                break;
            case 'thumbs':
                type = 'thumbs';
                break;
            default:
                throw new NotFoundException();
        }

        const forkedEm = await this.mikroOrmService.forkEmForMain();

        let filepath: string;
        if (type === 'files') {
            const fileCount = await forkedEm.count(File, { filename });
            if (fileCount === 0) {
                throw new NotFoundException();
            }
            filepath = path.join(directory, filename);
        } else {
            const fileCount = await forkedEm.count(File, { thumbFilename: filename });
            if (fileCount === 0) {
                throw new NotFoundException();
            }
            filepath = path.join(directory, 'thumbs', filename);
        }

        const file = createReadStream(filepath);
        return new StreamableFile(file);
    }

    // TODO: rate limit を設定する
    // TODO: UploaderEnabledPipe が false を返したときに返されるステータスコードが設定されていない
    @Post('/upload/:permission')
    @Auth(ENTRY)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('permission') permissionParam: string,
        @UploadedFile(UploaderEnabledPipe) file: Express.Multer.File,
        @AuthData() auth: AuthDataType,
    ) {
        const serverConfig = this.serverConfigService.getValueForce();
        const nonResolvedDirectory = serverConfig.uploader?.directory;
        if (nonResolvedDirectory == null) {
            // Pipe で弾かれているので、ここには来ないはず
            throw new InternalServerErrorException(
                'serverConfig.uploader.directory is nullish. This is a bug.',
            );
        }
        const directory = path.resolve(nonResolvedDirectory);

        let permission: 'unlisted' | 'public';
        switch (permissionParam) {
            case permissions.unlisted:
                permission = 'unlisted';
                break;
            case permissions.public:
                permission = 'public';
                break;
            default:
                throw new NotFoundException();
        }

        const em = await this.mikroOrmService.forkEmForMain();
        const user = await em.findOneOrFail(User, { userUid: auth.user.userUid });
        const [files, filesCount] = await em.findAndCount(File, {
            createdBy: { userUid: auth.user.userUid },
        });
        if (
            serverConfig.uploader?.countQuota != null &&
            serverConfig.uploader.countQuota <= filesCount
        ) {
            throw new BadRequestException('File count quota exceeded');
        }

        const totalSize = files.reduce((seed, elem) => seed + elem.size, 0);

        if (
            serverConfig.uploader?.sizeQuota != null &&
            serverConfig.uploader.sizeQuota <= totalSize
        ) {
            throw new BadRequestException('File size quota exceeded');
        }

        const fileId = easyFlake();
        const filename = fileId + path.extname(file.originalname);
        // 例えば元のファイル名が FILENAME.png に対して FILENAME.webp というファイル名にするとファイル名が同じで拡張子が異なる2つのファイル名が衝突してしまうことがあるので、FILENAME.png.webp というファイル名になるようにしている
        const thumbFilename = `${filename}.webp`;

        await ensureDir(directory);
        const filepath = path.join(directory, filename);
        const thumbDirectorypath = path.join(directory, thumbsDir);
        await ensureDir(thumbDirectorypath);
        const thumbFilepath = path.join(thumbDirectorypath, thumbFilename);
        await writeFile(filepath, file.buffer);
        const thumbnailSaved = await sharp(filepath)
            .resize(80)
            .webp()
            .toFile(thumbFilepath)
            .then(() => true)
            .catch((err: Error) => {
                // 画像かどうかに関わらず全てのファイルをsharpに渡すため、mp3などといった画像でないファイルの場合はほぼ確実にここに来る。そのため、warnなどではなくそれよりlevelの低いdebugを使っている。
                loggerRef.debug(err, 'This file is not an image thus thumbnail was not generated.');
                return false;
            });

        const permissionType =
            permission === permissions.public
                ? FilePermissionType.Entry
                : FilePermissionType.Private;
        em.create(File, {
            ...file,
            filename,
            screenname: file.originalname,
            createdBy: user,
            thumbFilename: thumbnailSaved ? thumbFilename : undefined,
            filesize: file.size,
            deletePermission: permissionType,
            listPermission: permissionType,
            renamePermission: permissionType,
        });
        // `em.create` calls `em.persist` automatically, so flush is enough - https://mikro-orm.io/docs/guide/relationships#creating-entity-graph
        await em.flush();
    }
}
