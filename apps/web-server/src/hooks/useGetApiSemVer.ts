import { GetServerInfoDocument, PrereleaseType } from '@flocon-trpg/typed-document-node';
import { SemVer, alpha, beta, rc } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import React from 'react';
import { useQuery } from 'urql';

export const useGetApiSemVer = () => {
    const [{ data: serverInfo, error }] = useQuery({ query: GetServerInfoDocument });

    return React.useMemo(() => {
        if (error != null) {
            return Result.error(error);
        }
        if (serverInfo == null) {
            // loadingの場合はここに来る。
            return null;
        }
        const prerelease = (() => {
            if (serverInfo.result.version.prerelease == null) {
                return undefined;
            }
            switch (serverInfo.result.version.prerelease.type) {
                case PrereleaseType.Alpha:
                    return {
                        ...serverInfo.result.version.prerelease,
                        type: alpha,
                    } as const;
                case PrereleaseType.Beta:
                    return {
                        ...serverInfo.result.version.prerelease,
                        type: beta,
                    } as const;
                case PrereleaseType.Rc:
                    return {
                        ...serverInfo.result.version.prerelease,
                        type: rc,
                    } as const;
            }
        })();
        return Result.ok(
            new SemVer({
                ...serverInfo.result.version,
                prerelease,
            }),
        );
    }, [error, serverInfo]);
};
