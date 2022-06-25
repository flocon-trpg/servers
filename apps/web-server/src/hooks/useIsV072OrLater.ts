import { SemVer, alpha } from '@flocon-trpg/utils';
import { useGetApiSemVer } from './useGetApiSemVer';

export const useIsV072OrLater = () => {
    const apiSemVer = useGetApiSemVer();

    let isV072OrLater: boolean | null;
    if (apiSemVer == null || apiSemVer.isError) {
        isV072OrLater = null;
    } else {
        isV072OrLater = SemVer.compare(
            new SemVer({ major: 0, minor: 7, patch: 2, prerelease: { type: alpha, version: 1 } }),
            '<=',
            apiSemVer.value
        );
    }
    return isV072OrLater;
};
