import { alpha, beta, rc } from '@flocon-trpg/utils';
import { Query, Resolver } from '@nestjs/graphql';
import { VERSION } from '../../../../VERSION';
import { PrereleaseType } from '../../../../enums/PrereleaseType';
import { ServerConfigService } from '../../../../server-config/server-config.service';
import { ServerInfo } from '../../../objects/serverInfo';

@Resolver()
export class GetServerInfoResolver {
    public constructor(private readonly serverConfigService: ServerConfigService) {}

    // CONSIDER: 内部情報に簡単にアクセスできるのはセキュリティリスクになりうる。@Auth(ENTRY) を付けたほうがいいか？
    @Query(() => ServerInfo)
    public async getServerInfo(): Promise<ServerInfo> {
        const serverConfig = this.serverConfigService.getValueForce();
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
            uploaderEnabled: serverConfig.uploader != null,
        };
    }
}
