import { alpha, beta, rc } from '@flocon-trpg/utils';
import { Ctx, Query, Resolver } from 'type-graphql';
import { PrereleaseType } from '../../../../enums/PrereleaseType';
import { VERSION } from '../../../../VERSION';
import { ServerInfo } from '../../../entities/serverInfo/graphql';
import { ResolverContext } from '../../../utils/Contexts';

@Resolver()
export class GetServerInfoResolver {
    // CONSIDER: 内部情報に簡単にアクセスできるのはセキュリティリスクになりうる。@Authorized(ENTRY) を付けたほうがいいか？
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
}
