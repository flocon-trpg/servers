'use strict';

var option = require('@kizahasi/option');
var result = require('@kizahasi/result');
var browserOrNode = require('browser-or-node');
var p = require('pino');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var p__default = /*#__PURE__*/_interopDefault(p);

function* groupJoinArray(left, right) {
    for (let i = 0;; i++) {
        const leftHasValue = i < left.length;
        const rightHasValue = i < right.length;
        if (leftHasValue) {
            if (rightHasValue) {
                yield { type: 'both', left: left[i], right: right[i] };
                continue;
            }
            yield { type: 'left', left: left[i] };
            continue;
        }
        if (rightHasValue) {
            yield { type: 'right', right: right[i] };
            continue;
        }
        return;
    }
}

const left = 'left';
const right = 'right';
const both = 'both';

const arrayEquals = (x, y) => {
    for (const elem of groupJoinArray(x, y)) {
        if (elem.type !== both) {
            return false;
        }
        if (elem.left !== elem.right) {
            return false;
        }
    }
    return true;
};

const compare = (left, operator, right) => {
    switch (operator) {
        case '=':
            return left === right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '>':
            return left > right;
        case '>=':
            return left >= right;
    }
};

const stringToCompositeKey = (source) => {
    const array = source.split('@');
    if (array.length !== 2) {
        return null;
    }
    return { id: array[0], createdBy: array[1] };
};
const compositeKeyToJsonString = (source) => {
    return `{ id: ${source.id}, createdBy: ${source.createdBy} }`;
};
const compositeKeyEquals = (x, y) => {
    return x.createdBy === y.createdBy && x.id === y.id;
};

const delay = async (ms) => {
    await new Promise(next => setTimeout(next, ms));
};

// Recordのkeyは、numberはstringとして解釈され、symbolはfor in文で列挙されないため、stringのみの対応としている。
const mapToRecord = (source) => {
    const result = {};
    source.forEach((value, key) => {
        if (result[key] !== undefined) {
            // プロトタイプ汚染などを防いでいる。ただ、これで十分なのだろうか？
            throw new Error(`${key} already exists`);
        }
        result[key] = value;
    });
    return result;
};
const chooseRecord = (source, chooser) => {
    const result = new Map();
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = chooser(element, key);
            if (newElement !== undefined) {
                result.set(key, newElement);
            }
        }
    }
    return mapToRecord(result);
};
const chooseDualKeyRecord = (source, chooser) => {
    return chooseRecord(source, (inner, key1) => inner === undefined
        ? undefined
        : chooseRecord(inner, (value, key2) => chooser(value, { first: key1, second: key2 })));
};
const mapRecord = (source, mapping) => {
    const result = new Map();
    for (const key in source) {
        const element = source[key];
        if (element !== undefined) {
            const newElement = mapping(element, key);
            result.set(key, newElement);
        }
    }
    return mapToRecord(result);
};
const mapDualKeyRecord = (source, mapping) => {
    return chooseRecord(source, (inner, key1) => inner === undefined
        ? undefined
        : mapRecord(inner, (value, key2) => mapping(value, { first: key1, second: key2 })));
};
function* recordToIterator(source) {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            yield { key, value };
        }
    }
}
const getExactlyOneKey = (record) => {
    let lastKey = null;
    for (const pair of recordToIterator(record)) {
        if (lastKey != null) {
            throw new Error('Expected length to be 1, but actually more than 1.');
        }
        lastKey = pair.key;
    }
    if (lastKey == null) {
        throw new Error('Expected length to be 1, but actually 0.');
    }
    return lastKey;
};
const recordToArray = (source) => {
    return [...recordToIterator(source)];
};
const recordToMap = (source) => {
    const result = new Map();
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            result.set(key, value);
        }
    }
    return result;
};
const dualKeyRecordToDualKeyMap = (source) => {
    const result = new DualKeyMap();
    for (const first in source) {
        const innerRecord = source[first];
        if (innerRecord !== undefined) {
            for (const second in innerRecord) {
                const value = innerRecord[second];
                if (value !== undefined) {
                    result.set({ first, second }, value);
                }
            }
        }
    }
    return result;
};
const recordForEach = (source, action) => {
    for (const pair of recordToIterator(source)) {
        action(pair.value, pair.key);
    }
};
const recordForEachAsync = async (source, action) => {
    for (const pair of recordToIterator(source)) {
        await action(pair.value, pair.key);
    }
};
const isRecordEmpty = (source) => {
    for (const key in source) {
        const value = source[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};
const dualKeyRecordForEach = (source, action) => {
    for (const first in source) {
        const inner = source[first];
        if (inner === undefined) {
            continue;
        }
        for (const second in inner) {
            const value = inner[second];
            if (value === undefined) {
                continue;
            }
            action(value, { first, second });
        }
    }
};

const toJsonString = (source) => {
    return `{ first: ${source.first}, second: ${source.second} }`;
};
class DualKeyMap {
    // Map<TKey2, TValue>は常に空でないMapとなる
    _core;
    constructor(sourceMap) {
        if (sourceMap != null) {
            this._core = DualKeyMap.chooseMap(sourceMap, x => option.Option.some(x));
            return;
        }
        this._core = new Map();
    }
    static chooseMap(source, chooser) {
        const result = new Map();
        for (const [firstKey, first] of source) {
            if (first.size === 0) {
                continue;
            }
            const toSet = new Map();
            for (const [secondKey, second] of first) {
                const chooserResult = chooser(second, { first: firstKey, second: secondKey });
                if (chooserResult.isNone) {
                    continue;
                }
                toSet.set(secondKey, chooserResult.value);
            }
            result.set(firstKey, toSet);
        }
        return result;
    }
    static create(source, chooser) {
        const result = new DualKeyMap();
        result._core = DualKeyMap.chooseMap(source instanceof DualKeyMap ? source._core : source, chooser);
        return result;
    }
    static ofRecord(source) {
        const result = new DualKeyMap();
        for (const key1 in source) {
            const inner = source[key1];
            if (inner === undefined) {
                continue;
            }
            for (const key2 in inner) {
                const value = inner[key2];
                if (value !== undefined) {
                    result.set({ first: key1, second: key2 }, value);
                }
            }
        }
        return result;
    }
    map(mapping) {
        return DualKeyMap.create(this, (source, key) => option.Option.some(mapping(source, key)));
    }
    choose(chooser) {
        return DualKeyMap.create(this, (source, key) => chooser(source, key));
    }
    clone() {
        return DualKeyMap.create(this, x => option.Option.some(x));
    }
    get({ first, second }) {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return undefined;
        }
        return inner.get(second);
    }
    // 戻り値のReadonlyMapをMapにするとDualKeyMapを操作できて一見便利そうだが、そうすると_coreの制約を満たせなくなる。また、ReadonlyMapであれば戻り値がundefinedのときは空のMapを作成して返せるため綺麗になる。
    getByFirst(first) {
        return this._core.get(first) ?? new Map();
    }
    set({ first, second }, value) {
        let inner = this._core.get(first);
        if (inner === undefined) {
            inner = new Map();
            this._core.set(first, inner);
        }
        inner.set(second, value);
        return this;
    }
    delete({ first, second }) {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return false;
        }
        const result = inner.delete(second);
        if (inner.size === 0) {
            this._core.delete(first);
        }
        return result;
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    *[Symbol.iterator]() {
        for (const [firstKey, first] of this._core) {
            for (const [secondKey, second] of first) {
                yield [{ first: firstKey, second: secondKey }, second];
            }
        }
    }
    toArray() {
        return Array.from(this);
    }
    toMap() {
        return DualKeyMap.chooseMap(this._core, x => option.Option.some(x));
    }
    toStringRecord(createStringKey1, createStringKey2) {
        const result = new Map();
        this._core.forEach((inner, first) => {
            const innerRecord = new Map();
            inner.forEach((value, second) => {
                innerRecord.set(createStringKey2(second), value);
            });
            result.set(createStringKey1(first), mapToRecord(innerRecord));
        });
        return mapToRecord(result);
    }
    get size() {
        return this.toArray().length;
    }
    get isEmpty() {
        return this.size === 0;
    }
    forEach(action) {
        for (const [key, value] of this) {
            action(value, key);
        }
    }
    reduce(reducer, seed) {
        let result = seed;
        this.forEach((element, key) => (result = reducer(result, element, key)));
        return result;
    }
    // 主な使用目的はデバッグ目的で文字列化させるため
    toJSON(valueToString) {
        return JSON.stringify([...this._core].map(([key1, value]) => [
            key1,
            [...value].map(([key2, value]) => [
                key2,
                valueToString === undefined ? value : valueToString(value),
            ]),
        ]));
    }
}
const groupJoinDualKeyMap = (left, right) => {
    const result = new DualKeyMap();
    const rightClone = right.clone();
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, {
            type: 'both',
            left: leftElement,
            right: rightElement,
        });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};
// [undefined, undefined, undefined]が返されることはない
const groupJoin3DualKeyMap = (source1, source2, source3) => {
    const source = groupJoinDualKeyMap(source1, groupJoinDualKeyMap(source2, source3));
    return source.map(group => {
        switch (group.type) {
            case left:
                return [group.left, undefined, undefined];
            case right:
            case both: {
                const result1 = (() => {
                    if (group.type === both) {
                        return group.left;
                    }
                    return undefined;
                })();
                switch (group.right.type) {
                    case left:
                        return [result1, group.right.left, undefined];
                    case right:
                        return [result1, undefined, group.right.right];
                    case both:
                        return [result1, group.right.left, group.right.right];
                }
            }
        }
    });
};
// [undefined, undefined, undefined, undefined]が返されることはない
const groupJoin4DualKeyMap = (source1, source2, source3, source4) => {
    const source = groupJoinDualKeyMap(groupJoin3DualKeyMap(source1, source2, source3), source4);
    return source.map(group => {
        switch (group.type) {
            case left:
                return [...group.left, undefined];
            case right:
                return [undefined, undefined, undefined, group.right];
            case both: {
                return [...group.left, group.right];
            }
        }
    });
};

function* map(source, mapping) {
    for (const elem of source) {
        yield mapping(elem);
    }
}
function* choose(source, mapping) {
    for (const elem of source) {
        const newValue = mapping(elem);
        if (!newValue.isNone) {
            yield newValue.value;
        }
    }
}

/** ミュータブルな木構造を表します。nodeをdeleteする機能は現時点では未実装です。*/
class Tree {
    #currentNode;
    constructor(rootNodeValue) {
        this.#currentNode = {
            absolutePath: [],
            value: rootNodeValue,
            children: new Map(),
        };
    }
    static createTree(node) {
        const result = new Tree(undefined);
        result.#currentNode = node;
        return result;
    }
    #ensureNode(key, initValue) {
        let result = this.#currentNode;
        for (const dir of key) {
            let next = result.children.get(dir);
            if (next == null) {
                const absolutePath = [...result.absolutePath, dir];
                next = {
                    absolutePath,
                    value: initValue(absolutePath),
                    children: new Map(),
                };
                result.children.set(dir, next);
            }
            result = next;
        }
        return result;
    }
    #getNode(key) {
        let result = this.#currentNode;
        for (const keyElement of key) {
            const next = result.children.get(keyElement);
            if (next == null) {
                return null;
            }
            result = next;
        }
        return result;
    }
    get absolutePath() {
        return this.#currentNode.absolutePath;
    }
    get value() {
        return this.#currentNode.value;
    }
    /** 指定したkeyにあるnodeを基準とした新しいTreeオブジェクトを返します。nodeへの参照は共有されます。absolutePathは引き継がれます。 */
    createSubTree(key, initValue) {
        const node = this.#ensureNode(key, initValue);
        return Tree.createTree(node);
    }
    createSubTreeIfExists(key) {
        if (this.get(key).isNone) {
            return null;
        }
        return this.createSubTree(key, () => {
            throw new Error('This should not happen');
        });
    }
    /** 直接の子の要素を全て取得します。 */
    getChildren() {
        const result = new Map();
        for (const [childKey, childNode] of this.#currentNode.children) {
            result.set(childKey, Tree.createTree(childNode));
        }
        return result;
    }
    get(key) {
        const node = this.#getNode(key);
        if (node == null) {
            return option.Option.none();
        }
        return option.Option.some(node.value);
    }
    ensure(key, replacer, initValue) {
        const node = this.#ensureNode(key, initValue);
        const result = replacer(node.value);
        node.value = result;
        return result;
    }
    #traverseNodes() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        function* main() {
            yield self.#currentNode;
            for (const [, child] of self.getChildren()) {
                yield* child.#traverseNodes();
            }
        }
        return main();
    }
    traverse() {
        return map(this.#traverseNodes(), elem => ({
            absolutePath: elem.absolutePath,
            value: elem.value,
        }));
    }
    replaceAllValues(replacer) {
        for (const elem of this.#traverseNodes()) {
            elem.value = replacer({ absolutePath: elem.absolutePath, value: elem.value });
        }
    }
    get size() {
        return [...this.traverse()].length;
    }
    #mapNode(source, mapping) {
        const childrenClone = new Map();
        for (const [sourceChildKey, sourceChild] of source.children) {
            childrenClone.set(sourceChildKey, this.#mapNode(sourceChild, mapping));
        }
        return {
            absolutePath: source.absolutePath,
            value: mapping(source.value, source.absolutePath),
            children: childrenClone,
        };
    }
    map(mapping) {
        const newNode = this.#mapNode(this.#currentNode, (oldValue, absolutePath) => mapping({ value: oldValue, absolutePath }));
        return Tree.createTree(newNode);
    }
}

/** 仮想的にnodeをdeleteできる機能を持ったTreeを表します。内部でnodeにdeleteフラグを立てることでdeleteされたことを表すため、deleteしてもメモリの空き容量は増えません。 */
class DeletableTree {
    #source;
    constructor(rootValue = option.Option.none()) {
        this.#source = new Tree(rootValue);
    }
    get absolutePath() {
        return this.#source.absolutePath;
    }
    get value() {
        // 常に this.get([]) と等しい
        return this.#source.value;
    }
    /** 指定したkeyにあるnodeを基準とした新しいTreeオブジェクトを返します。nodeへの参照は共有されます。absolutePathは引き継がれます。 */
    createSubTree(key, initValue) {
        const result = new DeletableTree();
        const newTree = this.#source.createSubTree(key, absolutePath => option.Option.some(initValue(absolutePath)));
        result.#source = newTree;
        return result;
    }
    createSubTreeIfExists(key) {
        if (this.get(key).isNone) {
            return null;
        }
        return this.createSubTree(key, () => {
            throw new Error('this should not happen');
        });
    }
    /** 直接の子の要素を全て取得します。 */
    getChildren() {
        const result = new Map();
        for (const [childKey] of this.#source.getChildren()) {
            if (this.get([childKey]).isNone) {
                continue;
            }
            result.set(childKey, this.createSubTree([childKey], () => {
                throw new Error('This should not happen');
            }));
        }
        return result;
    }
    get(key) {
        const node = this.#source.get(key);
        if (node.isNone) {
            return option.Option.none();
        }
        if (node.value.isNone) {
            return option.Option.none();
        }
        return option.Option.some(node.value.value);
    }
    ensure(key, replacer, initValue) {
        const result = this.#source.ensure(key, oldValue => option.Option.some(replacer(oldValue)), () => option.Option.none());
        const absolutePath = [];
        const ensure = () => {
            this.#source.ensure(absolutePath, oldValue => {
                if (oldValue.isNone) {
                    return option.Option.some(initValue(absolutePath));
                }
                return oldValue;
            }, () => option.Option.none());
        };
        ensure();
        for (const k of key) {
            absolutePath.push(k);
            ensure();
        }
        return result.value;
    }
    delete(key) {
        if (this.get(key).isNone) {
            return;
        }
        const subTree = this.#source.createSubTree(key, () => {
            throw new Error('This should not happen');
        });
        // keyのNodeとその子孫すべてをNoneに置き換えている。
        subTree.replaceAllValues(() => option.Option.none());
    }
    traverse() {
        return choose(this.#source.traverse(), elem => {
            if (elem.value.isNone) {
                return option.Option.none();
            }
            return option.Option.some({ absolutePath: elem.absolutePath, value: elem.value.value });
        });
    }
    get size() {
        return [...this.traverse()].length;
    }
    map(mapping) {
        const newTree = this.#source.map(oldValue => {
            if (oldValue.value.isNone) {
                return oldValue.value;
            }
            return option.Option.some(mapping({ absolutePath: oldValue.absolutePath, value: oldValue.value.value }));
        });
        const result = new DeletableTree();
        result.#source = newTree;
        return result;
    }
    clone() {
        return this.map(({ value }) => value);
    }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt#a_stricter_parse_function
const filterInt = (value) => {
    if (/^[-+]?\d+$/.test(value)) {
        return Number(value);
    }
    else {
        return null;
    }
};

const parseStringToBooleanError = {
    ja: `真偽値に変換できませんでした。真として使用できる値は true, 1, yes, on で、偽として使用できる値は false, 0, no, off です。`,
};
const parseStringToBooleanCore = (source) => {
    switch (source.trim().toLowerCase()) {
        case 'true':
        case '1':
        case 'yes':
        case 'on':
            return result.Result.ok(true);
        case 'false':
        case '0':
        case 'no':
        case 'off':
            return result.Result.ok(false);
        default:
            return result.Result.error(parseStringToBooleanError);
    }
};
const parseStringToBoolean = (source) => {
    if (source == null) {
        return result.Result.ok(source);
    }
    return parseStringToBooleanCore(source);
};

const isCompositeKey = (source) => {
    if (!('createdBy' in source)) {
        return false;
    }
    if (!('id' in source)) {
        return false;
    }
    return typeof source.createdBy === 'string' && typeof source.id === 'string';
};
function* keyToStrings(key) {
    if (typeof key === 'string') {
        yield key;
    }
    else if (typeof key === 'number') {
        yield key.toString();
    }
    else if (isCompositeKey(key)) {
        yield key.createdBy;
        yield key.id;
    }
    else {
        yield key.first;
        yield key.second;
    }
}
/** React の key に用いる文字列を生成します。 */
// classNamesを参考にした命名。keyNamesの代わりにkeysは名前が汎用的すぎて衝突しやすいと思うため不採用。
// clsxを参考にkeyxなどといった命名法も考えられるが、clsxはclassNamesとは引数が異なるようなので、もしかしたら適切ではないかもしれないと考え見送った。
const keyNames = (...keys) => {
    return keys
        .map(key => [...keyToStrings(key)])
        .flat()
        .reduce((seed, elem, i) => (i === 0 ? elem : `${seed}@${elem}`), '');
};

const defaultLogLevel = 'info';
// ブラウザの場合はほぼ変更なし（ログレベルを変更するくらい）でも構わない。
// ブラウザ以外の場合は、このままだと JSON がそのまま出力されて見づらいので、pino-pretty などを使わない場合は変更するほうがいいかも。
/** pino のロガーを取得もしくは変更できます。 */
const loggerRef = {
    value: browserOrNode.isBrowser ? p__default.default({ level: defaultLogLevel, browser: {} }) : p__default.default({ level: defaultLogLevel }),
};

/** 複数のkeyを使用できるMap */
// valueがNoneであり、なおかつchildrenを再帰的にたどってもSomeであるvalueがないようなNodeは不必要である。だが、現時点ではそれをgarbage collectする機能はない。
class MultiKeyMap {
    #source;
    constructor() {
        this.#source = new Tree(option.Option.none());
    }
    get absolutePath() {
        return this.#source.absolutePath;
    }
    createSubMap(key) {
        const result = new MultiKeyMap();
        result.#source = this.#source.createSubTree(key, () => option.Option.none());
        return result;
    }
    /** 直接の子の要素を全て取得します。 */
    getChildren() {
        const result = new Map();
        for (const [childKey, childValue] of this.#source.getChildren()) {
            const newValue = new MultiKeyMap();
            newValue.#source = childValue;
            result.set(childKey, newValue);
        }
        return result;
    }
    get(key) {
        const resultAsOption = this.#source.get(key);
        if (resultAsOption === undefined) {
            return undefined;
        }
        if (resultAsOption.isNone) {
            return undefined;
        }
        return resultAsOption.value.value;
    }
    replace(key, replacer) {
        const result = this.#source.ensure(key, oldValue => {
            const newValue = replacer(oldValue.value);
            if (newValue === undefined) {
                return option.Option.none();
            }
            return option.Option.some(newValue);
        }, () => option.Option.none());
        return (result.isNone ? undefined : result.value);
    }
    ensure(key, onCreate) {
        return this.replace(key, oldValue => (oldValue === undefined ? onCreate() : oldValue));
    }
    set(key, newValue) {
        this.replace(key, () => newValue);
    }
    delete(key) {
        this.replace(key, () => undefined);
    }
    traverse() {
        return choose(this.#source.traverse(), element => {
            if (element.value.isNone) {
                return option.Option.none();
            }
            return option.Option.some({
                absolutePath: element.absolutePath,
                value: element.value.value,
            });
        });
    }
    get size() {
        return [...this.traverse()].length;
    }
    map(mapping) {
        const newSource = this.#source.map(oldValue => {
            if (oldValue.value.isNone) {
                return oldValue.value;
            }
            const newValue = mapping({
                absolutePath: oldValue.absolutePath,
                value: oldValue.value.value,
            });
            if (newValue === undefined) {
                return option.Option.none();
            }
            return option.Option.some(newValue);
        });
        const result = new MultiKeyMap();
        result.#source = newSource;
        return result;
    }
}

/** 複数の値を使用できるSet */
class MultiValueSet {
    #core = new MultiKeyMap();
    add(key) {
        return this.#core.set(key, true);
    }
    has(key) {
        return this.#core.get(key) ?? false;
    }
    delete(key) {
        this.#core.delete(key);
    }
    get size() {
        return [...this.#core.traverse()].filter(({ value }) => value).length;
    }
    toIterator() {
        return map(this.#core.traverse(), elem => elem.absolutePath);
    }
    clone() {
        const result = new MultiValueSet();
        result.#core = this.#core.map(x => x.value);
        return result;
    }
}

const isReadonlyNonEmptyArray = (source) => source.length > 0;

const groupJoinMap = (left, right) => {
    const result = new Map();
    const rightClone = new Map(right);
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, {
            type: 'both',
            left: leftElement,
            right: rightElement,
        });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};

const groupJoinSet = (left, right) => {
    const result = new Map();
    const rightClone = new Set(right);
    left.forEach(leftElement => {
        const existsInRight = rightClone.has(leftElement);
        rightClone.delete(leftElement);
        if (existsInRight) {
            result.set(leftElement, 'both');
            return;
        }
        result.set(leftElement, 'left');
    });
    rightClone.forEach(rightElement => {
        result.set(rightElement, 'right');
    });
    return result;
};

const parseEnvListValue = (source) => {
    if (source == null) {
        return source;
    }
    return source.split(',').map(x => x.trim());
};

const parsePinoLogLevel = (source, envName) => {
    const value = source.toLowerCase().trim();
    switch (value) {
        case 'fatal':
        case 'error':
        case 'warn':
        case 'info':
        case 'debug':
        case 'trace':
        case 'silent': {
            return result.Result.ok(value);
        }
    }
    return result.Result.error(`${envName} value is invalid. Supported values: "fatal", "error", "warn", "info", "debug", "trace", "silent".`);
};

// # alpha
// minor=patch=0にすることを推奨。ただし、コードの変更量が非常に多い場合などは従わなくてもよい。
const alpha = 'alpha';
const beta = 'beta';
const rc = 'rc';
class SemVer {
    major;
    minor;
    patch;
    prerelease;
    static requireToBePositiveInteger(source, propName) {
        if (!Number.isInteger(source)) {
            throw new Error(`Semver error: ${propName} must be integer. Actual value is "${source}"`);
        }
        if (source <= 0) {
            throw new Error(`Semver error: ${propName} must be positive. Actual value is "${source}"`);
        }
    }
    static requireToBeNonNegativeInteger(source, propName) {
        if (!Number.isInteger(source)) {
            throw new Error(`Semver error: ${propName} must be integer. Actual value is "${source}"`);
        }
        if (source < 0) {
            throw new Error(`Semver error: ${propName} must not be negative. Actual value is "${source}"`);
        }
    }
    constructor(option) {
        SemVer.requireToBeNonNegativeInteger(option.major, 'major');
        SemVer.requireToBeNonNegativeInteger(option.minor, 'minor');
        SemVer.requireToBeNonNegativeInteger(option.patch, 'patch');
        if (option.prerelease != null) {
            SemVer.requireToBePositiveInteger(option.prerelease.version, 'prerelease version');
        }
        this.major = option.major;
        this.minor = option.minor;
        this.patch = option.patch;
        this.prerelease = option.prerelease ?? null;
    }
    toString() {
        if (this.prerelease == null) {
            return `${this.major}.${this.minor}.${this.patch}`;
        }
        return `${this.major}.${this.minor}.${this.patch}-${this.prerelease.type}.${this.prerelease.version}`;
    }
    static prereleaseTypeToNumber(type) {
        if (type == null) {
            return 0;
        }
        switch (type) {
            case rc:
                return -1;
            case beta:
                return -2;
            case alpha:
                return -3;
        }
    }
    static compareCore(left, operator, right) {
        // majorが異なるなら値を即座に返し、同じなら次の判定処理に進むという戦略。他も同様。
        if (left.major !== right.major) {
            return compare(left.major, operator, right.major);
        }
        if (left.minor !== right.minor) {
            return compare(left.minor, operator, right.minor);
        }
        if (left.patch !== right.patch) {
            return compare(left.patch, operator, right.patch);
        }
        const leftPreleaseTypeAsNumber = SemVer.prereleaseTypeToNumber(left.prerelease?.type);
        const rightPreleaseTypeAsNumber = SemVer.prereleaseTypeToNumber(right.prerelease?.type);
        if (leftPreleaseTypeAsNumber !== rightPreleaseTypeAsNumber) {
            return compare(leftPreleaseTypeAsNumber, operator, rightPreleaseTypeAsNumber);
        }
        // ?? の右側の-1は、実際は使われることはない
        return compare(left.prerelease?.version ?? -1, operator, right.prerelease?.version ?? -1);
    }
    /**
    npmのsemverとは異なり、例えば 1.0.0 < 1.0.1-alpha.1 はtrueを返す。注意！
    */
    static compare(left, operator, right) {
        switch (operator) {
            case '=':
            case '<':
            case '>':
                return SemVer.compareCore(left, operator, right);
            case '<=':
                return !SemVer.compareCore(left, '>', right);
            case '>=':
                return !SemVer.compareCore(left, '<', right);
        }
    }
}

exports.DeletableTree = DeletableTree;
exports.DualKeyMap = DualKeyMap;
exports.MultiKeyMap = MultiKeyMap;
exports.MultiValueSet = MultiValueSet;
exports.SemVer = SemVer;
exports.Tree = Tree;
exports.alpha = alpha;
exports.arrayEquals = arrayEquals;
exports.beta = beta;
exports.both = both;
exports.chooseDualKeyRecord = chooseDualKeyRecord;
exports.chooseRecord = chooseRecord;
exports.compare = compare;
exports.compositeKeyEquals = compositeKeyEquals;
exports.compositeKeyToJsonString = compositeKeyToJsonString;
exports.delay = delay;
exports.dualKeyRecordForEach = dualKeyRecordForEach;
exports.dualKeyRecordToDualKeyMap = dualKeyRecordToDualKeyMap;
exports.dualKeyToJsonString = toJsonString;
exports.filterInt = filterInt;
exports.getExactlyOneKey = getExactlyOneKey;
exports.groupJoin3DualKeyMap = groupJoin3DualKeyMap;
exports.groupJoin4DualKeyMap = groupJoin4DualKeyMap;
exports.groupJoinArray = groupJoinArray;
exports.groupJoinDualKeyMap = groupJoinDualKeyMap;
exports.groupJoinMap = groupJoinMap;
exports.groupJoinSet = groupJoinSet;
exports.isReadonlyNonEmptyArray = isReadonlyNonEmptyArray;
exports.isRecordEmpty = isRecordEmpty;
exports.keyNames = keyNames;
exports.left = left;
exports.loggerRef = loggerRef;
exports.mapDualKeyRecord = mapDualKeyRecord;
exports.mapRecord = mapRecord;
exports.mapToRecord = mapToRecord;
exports.parseEnvListValue = parseEnvListValue;
exports.parsePinoLogLevel = parsePinoLogLevel;
exports.parseStringToBoolean = parseStringToBoolean;
exports.parseStringToBooleanError = parseStringToBooleanError;
exports.rc = rc;
exports.recordForEach = recordForEach;
exports.recordForEachAsync = recordForEachAsync;
exports.recordToArray = recordToArray;
exports.recordToIterator = recordToIterator;
exports.recordToMap = recordToMap;
exports.right = right;
exports.stringToCompositeKey = stringToCompositeKey;
