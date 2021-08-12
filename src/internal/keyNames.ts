import { DualKey } from './dualKeyMap';
import { CompositeKey } from './stateMap';

type Key = string | CompositeKey | DualKey<string, string>;

const isCompositeKey = (source: CompositeKey | DualKey<string, string>): source is CompositeKey => {
    if (source == null) {
        return false;
    }
    if (!('createdBy' in source)) {
        return false;
    }
    if (!('id' in source)) {
        return false;
    }
    return typeof source.createdBy === 'string' && typeof source.id === 'string';
};

function* keyToStrings(key: Key) {
    if (typeof key === 'string') {
        yield key;
    } else if (isCompositeKey(key)) {
        yield key.createdBy;
        yield key.id;
    } else {
        yield key.first;
        yield key.second;
    }
}

// classNamesを参考にした命名。keyNamesの代わりにkeysは名前が汎用的すぎて衝突しやすいと思うため不採用。
// clsxを参考にkeyxなどといった命名法も考えられるが、clsxはclassNamesとシグネチャが異なるようなので、もしかしたら適切ではないかもしれないと考え見送った。
export const keyNames = (key1: Key, ...keyRest: Key[]): string => {
    return [key1, ...keyRest]
        .map(key => [...keyToStrings(key)])
        .flat()
        .reduce((seed, elem, i) => (i === 0 ? elem : `${seed}@${elem}`), '');
};
