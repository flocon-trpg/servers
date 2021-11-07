import { alpha, beta, rc } from '@flocon-trpg/utils';

export type ClientVersion = {
    major: number;
    minor: number;
    prefix?: typeof alpha | typeof beta | typeof rc;
};

export const clientVersionToString = ({ major, minor, prefix }: ClientVersion): string => {
    if (prefix == null) {
        return `${major}.${minor}`;
    }
    return `${major}.${minor}-${prefix}`;
};
