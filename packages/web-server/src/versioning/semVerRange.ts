import { SemVer } from '@flocon-trpg/utils';

export type SemVerRange = {
    min: SemVer;
    range: {
        type: '^' | '~';
    };
};

export const semVerRangeToString = (source: SemVerRange): string => {
    if (source.range.type === '^') {
        return `>=${source.min.toString()} <${source.min.major + 1}.0.0-0`;
    }
    return `>=${source.min.toString()} <${source.min.major}.${source.min.minor + 1}.0-0`;
};
