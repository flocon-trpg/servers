import { SemVer } from '@flocon-trpg/utils';
import { SemVerRange } from './semVerRange';

export const apiServerSatisfies = ({
    expected,
    actual,
}: {
    expected: ReadonlyArray<SemVerRange>;
    actual: SemVer;
}): boolean => {
    for (const expectedElement of expected) {
        if (expectedElement.min.major !== actual.major) {
            continue;
        }
        if (expectedElement.range.type === '~') {
            if (expectedElement.min.minor !== actual.minor) {
                continue;
            }
        }
        if (SemVer.compare(expectedElement.min, '<=', actual)) {
            return true;
        }
    }
    return false;
};
