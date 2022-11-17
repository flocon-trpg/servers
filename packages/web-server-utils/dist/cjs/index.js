'use strict';

var produce = require('immer');
var rxjs = require('rxjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var produce__default = /*#__PURE__*/_interopDefault(produce);

const visibleToToString = (visibleTo) => {
    return [...visibleTo]
        .sort()
        .reduce((seed, elem) => (seed === '' ? elem : `${seed};${elem}`), '');
};

class PrivateChannelSet {
    #source;
    constructor(userUid) {
        if (typeof userUid === 'string') {
            this.#source = new Set(userUid.split(';').filter(x => x !== ''));
            return;
        }
        if (userUid instanceof Array) {
            this.#source = new Set(userUid);
            return;
        }
        this.#source = userUid;
    }
    toString() {
        return visibleToToString(this.#source);
    }
    // participantsのkeyはUserUid
    toChannelNameBase(participants, skipMe) {
        const result = [];
        this.#source.forEach(userUid => {
            if (userUid === skipMe?.userUid) {
                return;
            }
            const participant = participants.get(userUid);
            if (participant === undefined) {
                result.push(userUid);
                return;
            }
            result.push(participant.name ?? `不明なユーザー(${userUid})`);
        });
        result.sort();
        return result;
    }
    toStringArray() {
        return [...this.#source].sort();
    }
    toStringSet() {
        return this.#source;
    }
}

class PrivateChannelSets {
    #core = new Map();
    constructor(source) {
        if (source != null) {
            source
                .split(',')
                .filter(x => x !== '')
                .forEach(set => {
                const newValue = new PrivateChannelSet(set);
                this.add(newValue);
            });
        }
    }
    add(visibleTo) {
        const castedVisibleTo = visibleTo;
        if (Array.isArray(castedVisibleTo)) {
            const set = new Set(castedVisibleTo);
            this.#core.set(visibleToToString(set), new PrivateChannelSet(set));
            return;
        }
        this.#core.set(visibleTo.toString(), castedVisibleTo);
    }
    clone() {
        const result = new PrivateChannelSets();
        result.#core = new Map(this.#core);
        return result;
    }
    toArray() {
        return [...this.#core.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, elem]) => elem);
    }
    toString() {
        return [...this.#core.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .reduce((seed, [, elem], i) => (i === 0 ? elem.toString() : `${seed},${elem.toString()}`), '');
    }
}

class RoomChannels {
    #publicChannels = new Map();
    #privateChannels = new PrivateChannelSets();
    get publicChannels() {
        return this.#publicChannels;
    }
    get privateChannels() {
        return this.#privateChannels;
    }
    onEvent(action) {
        switch (action.__typename) {
            case 'RoomPrivateMessage': {
                const privateChannels = this.#privateChannels.clone();
                privateChannels.add(action.visibleTo);
                this.#privateChannels = privateChannels;
                return true;
            }
            case 'RoomPublicChannel':
            case 'RoomPublicChannelUpdate': {
                const publicChannels = new Map(this.#publicChannels);
                publicChannels.set(action.key, { name: action.name ?? null });
                this.#publicChannels = publicChannels;
                return true;
            }
            case 'RoomPublicMessage':
            case 'RoomPrivateMessageUpdate':
            case 'RoomPublicMessageUpdate':
            case 'PieceLog':
            case 'RoomSoundEffect':
            case 'RoomMessagesReset':
            case undefined: {
                return false;
            }
        }
    }
    onQuery(roomMessages) {
        const events = [];
        // CONSIDER: __typenameをnon-undefinedにしてgraphql.tsを生成し、Spread構文を不要にするほうが綺麗なコードになりそう
        roomMessages.publicMessages.forEach(msg => {
            events.push({ ...msg, __typename: 'RoomPublicMessage' });
        });
        roomMessages.publicChannels.forEach(ch => {
            events.push({ ...ch, __typename: 'RoomPublicChannel' });
        });
        roomMessages.privateMessages.forEach(msg => {
            events.push({ ...msg, __typename: 'RoomPrivateMessage' });
        });
        roomMessages.pieceLogs.forEach(msg => {
            events.push({ ...msg, __typename: 'PieceLog' });
        });
        roomMessages.soundEffects.forEach(se => {
            events.push({ ...se, __typename: 'RoomSoundEffect' });
        });
        events.forEach(event => this.onEvent(event));
    }
}

// 自動的に昇順にソートされる配列。
class SortedArray {
    createSortKey;
    #core;
    constructor(createSortKey, init) {
        this.createSortKey = createSortKey;
        if (init == null) {
            this.#core = [];
            return;
        }
        this.#core = init.map(value => ({ value, sortKey: createSortKey(value) }));
        this.#core.sort((x, y) => x.sortKey - y.sortKey);
    }
    clone() {
        const result = new SortedArray(this.createSortKey);
        result.#core = [...this.#core];
        return result;
    }
    // 挿入先が末尾に近いほど高速で、先頭に近いほど低速。
    // CONSIDER: バイナリサーチなどで高速化できる。
    add(newValue) {
        const sortKeyOfNewValue = this.createSortKey(newValue);
        for (let i = this.#core.length - 1; i >= 0; i--) {
            const element = this.#core[i];
            if (element == null) {
                throw new Error('This should not happen');
            }
            if (element.sortKey <= sortKeyOfNewValue) {
                const index = i + 1;
                this.#core.splice(index, 0, { value: newValue, sortKey: sortKeyOfNewValue });
                return;
            }
        }
        const index = 0;
        this.#core.splice(index, 0, { value: newValue, sortKey: sortKeyOfNewValue });
    }
    // 該当する要素の位置が末尾に近いほど高速で、先頭に近いほど低速。ただし見つからなかった場合は最も遅い。
    // CONSIDER: バイナリサーチなどで高速化できる。
    #findIndexFromEnd(predicate) {
        for (let i = this.#core.length - 1; i >= 0; i--) {
            const element = this.#core[i];
            if (element == null) {
                throw new Error('This should not happen');
            }
            if (predicate(element.value)) {
                return i;
            }
        }
        return -1;
    }
    #removeLast(predicate) {
        const index = this.#findIndexFromEnd(predicate);
        if (index < 0) {
            return undefined;
        }
        const found = this.#core[index];
        if (found == null) {
            throw new Error('This should not happen');
        }
        this.#core.splice(index, 1);
        return found.value;
    }
    updateLast(update) {
        let newValue = undefined;
        const found = this.#removeLast(elem => {
            const result = update(elem);
            if (result === undefined) {
                return false;
            }
            newValue = result;
            return true;
        });
        if (found === undefined || newValue === undefined) {
            return undefined;
        }
        this.add(newValue);
        return { oldValue: found, newValue };
    }
    toArray(mapFilter) {
        return this.#core.flatMap(elem => {
            const newValue = mapFilter(elem.value);
            if (newValue === undefined) {
                return [];
            }
            return [newValue];
        });
    }
    clear() {
        this.#core = [];
    }
    createFiltered(filter) {
        return FilteredSortedArray.ofSortedKey(this, filter);
    }
}
class FilteredSortedArray {
    filter;
    base;
    constructor(filter, base) {
        this.filter = filter;
        this.base = base;
    }
    clone() {
        const result = new FilteredSortedArray(this.filter, this.base.clone());
        return result;
    }
    static ofArray(base, filter, createSortKey) {
        const b = new SortedArray(x => createSortKey(x.value), base.map(x => ({ value: x, exists: filter(x) })));
        return new FilteredSortedArray(filter, b);
    }
    static ofSortedKey(base, filter) {
        const b = new SortedArray(x => base.createSortKey(x.value), base.toArray(x => ({ value: x, exists: filter(x) })));
        return new FilteredSortedArray(filter, b);
    }
    toArray(mapFilter) {
        return this.base.toArray(elem => {
            if (!elem.exists) {
                return undefined;
            }
            return mapFilter(elem.value);
        });
    }
    clear() {
        this.base.clear();
    }
    add(newValue) {
        const exists = this.filter(newValue);
        this.base.add({ value: newValue, exists });
        return exists;
    }
    updateLast(update) {
        const found = this.base.updateLast(elem => {
            const newValue = update(elem.value);
            if (newValue === undefined) {
                return undefined;
            }
            return {
                value: newValue,
                exists: this.filter(newValue),
            };
        });
        if (found == null) {
            return undefined;
        }
        return {
            oldValue: found.oldValue.exists ? found.oldValue.value : undefined,
            newValue: found.newValue.exists ? found.newValue.value : undefined,
        };
    }
}

const privateMessage = 'privateMessage';
const publicMessage = 'publicMessage';
const pieceLog = 'pieceLog';
const publicChannel = 'publicChannel';
const soundEffect = 'soundEffect';
const custom = 'custom';
const reset = 'reset';

class MessageSet {
    #customMessages = [];
    #publicMessages = new Map();
    #privateMessages = new Map();
    #pieceLogs = new Map();
    #soundEffects = new Map();
    add(message) {
        switch (message.type) {
            case custom:
                this.#customMessages.push(message);
                break;
            case pieceLog:
                this.#pieceLogs.set(message.value.messageId, message.value);
                break;
            case privateMessage:
                this.#privateMessages.set(message.value.messageId, message.value);
                break;
            case publicMessage:
                this.#publicMessages.set(message.value.messageId, message.value);
                break;
            case soundEffect:
                this.#soundEffects.set(message.value.messageId, message.value);
                break;
        }
    }
    // clear() {
    //     this.#customMessages.clear();
    //     this.#pieceLogs.clear();
    //     this.#privateMessages.clear();
    //     this.#publicMessages.clear();
    //     this.#soundEffects.clear();
    // }
    getPrivateMessage(messageId) {
        return this.#privateMessages.get(messageId);
    }
    getPublicMessage(messageId) {
        return this.#publicMessages.get(messageId);
    }
    get(message) {
        switch (message.type) {
            case pieceLog: {
                const value = this.#pieceLogs.get(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: pieceLog,
                    value,
                };
            }
            case privateMessage: {
                const value = this.getPrivateMessage(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: privateMessage,
                    value,
                };
            }
            case publicMessage: {
                const value = this.getPublicMessage(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: publicMessage,
                    value,
                };
            }
            case soundEffect: {
                const value = this.#soundEffects.get(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: soundEffect,
                    value,
                };
            }
        }
    }
    values() {
        function* main(self) {
            for (const value of self.#customMessages.values()) {
                yield value;
            }
            for (const value of self.#pieceLogs.values()) {
                yield {
                    type: pieceLog,
                    value,
                };
            }
            for (const value of self.#privateMessages.values()) {
                yield {
                    type: privateMessage,
                    value,
                };
            }
            for (const value of self.#publicMessages.values()) {
                yield {
                    type: publicMessage,
                    value,
                };
            }
            for (const value of self.#soundEffects.values()) {
                yield {
                    type: soundEffect,
                    value,
                };
            }
        }
        return main(this);
    }
}

const createRoomMessage = (source) => {
    switch (source.__typename) {
        case 'RoomPrivateMessage':
            return {
                type: privateMessage,
                value: source,
            };
        case 'RoomPublicMessage':
            return {
                type: publicMessage,
                value: source,
            };
        case 'PieceLog':
            return {
                type: pieceLog,
                value: source,
            };
        case 'RoomSoundEffect':
            return {
                type: soundEffect,
                value: source,
            };
        case undefined:
            return undefined;
    }
};
const compareUpdatedAt = (left, operator, right) => {
    if (left == null) {
        return right != null;
    }
    if (right == null) {
        return false;
    }
    return left < right;
};
const noChange = 'noChange';
// 引数のmessagesには変更は加えられない
const reduceEvent = ({ messages: messagesSource, event, }) => {
    const messages = messagesSource.clone();
    switch (event.__typename) {
        case custom: {
            const added = messages.add(event.value);
            if (added === false) {
                return { messages, diff: null };
            }
            return {
                messages,
                diff: {
                    prevValue: undefined,
                    nextValue: event.value,
                },
            };
        }
        case 'RoomPrivateMessage':
        case 'RoomPublicMessage':
        case 'PieceLog':
        case 'RoomSoundEffect': {
            const newValue = createRoomMessage(event);
            if (newValue == null) {
                return noChange;
            }
            const added = messages.add(newValue);
            if (added === false) {
                return { messages, diff: null };
            }
            return {
                messages,
                diff: {
                    prevValue: undefined,
                    nextValue: newValue,
                },
            };
        }
        case 'RoomPublicChannel':
        case 'RoomPublicChannelUpdate':
            return noChange;
        case 'RoomPrivateMessageUpdate':
        case 'RoomPublicMessageUpdate': {
            const updateResult = messages.updateLast(msg => {
                if (msg.type === custom || msg.type === pieceLog || msg.type === soundEffect) {
                    return undefined;
                }
                if (msg.value.messageId !== event.messageId) {
                    return undefined;
                }
                if (!compareUpdatedAt(msg.value.updatedAt, '<', event.updatedAt)) {
                    return undefined;
                }
                return produce__default.default(msg, msg => {
                    msg.value.altTextToSecret = event.altTextToSecret;
                    msg.value.commandResult = event.commandResult;
                    msg.value.isSecret = event.isSecret;
                    msg.value.initText = event.initText;
                    msg.value.initTextSource = event.initTextSource;
                    msg.value.updatedText = event.updatedText;
                    msg.value.updatedAt = event.updatedAt;
                });
            });
            if (updateResult == null) {
                return noChange;
            }
            return {
                messages,
                diff: {
                    prevValue: updateResult.oldValue,
                    nextValue: updateResult.newValue,
                },
            };
        }
        case 'RoomMessagesReset': {
            const prevValue = messages.toArray(x => x);
            messages.clear();
            return {
                messages,
                diff: {
                    prevValue: { type: reset, value: prevValue },
                    nextValue: { type: reset, value: [] },
                },
            };
        }
        case undefined:
            return noChange;
    }
};
const event = 'event';
const query = 'query';
const clear = 'clear';
const createSortKey = (message) => message.type === custom ? message.createdAt : message.value.createdAt;
class RoomMessagesClient {
    #messagesState = {
        isQueryFetched: false,
        eventsQueue: [],
    };
    #messagesChanged = new rxjs.Subject();
    #messages = new SortedArray(createSortKey);
    messages;
    constructor() {
        this.messages = {
            getCurrent: () => this.#messages.toArray(x => x),
            changed: this.#messagesChanged.pipe(rxjs.map(changeEvent => {
                switch (changeEvent.type) {
                    case event: {
                        return {
                            type: event,
                            current: changeEvent.current.toArray(x => x),
                            diff: changeEvent.diff,
                        };
                    }
                    case query: {
                        return {
                            type: query,
                            current: changeEvent.current.toArray(x => x),
                        };
                    }
                    default:
                        return {
                            type: clear,
                            current: changeEvent.current.toArray(x => x),
                        };
                }
            })),
            filter: filter => {
                return {
                    getCurrent: () => this.#messages.toArray(x => (filter(x) ? x : undefined)),
                    changed: new rxjs.Observable(observer => {
                        let messages = this.#messages.createFiltered(filter);
                        return this.#messagesChanged.subscribe(changeEvent => {
                            if (changeEvent.type !== event) {
                                messages = changeEvent.current.createFiltered(filter);
                                observer.next({
                                    type: changeEvent.type,
                                    current: messages.toArray(x => x),
                                });
                                return;
                            }
                            if (!this.#messagesState.isQueryFetched &&
                                changeEvent.event.__typename !== custom) {
                                observer.next({
                                    type: changeEvent.type,
                                    current: changeEvent.current.toArray(x => x).filter(filter),
                                    diff: null,
                                });
                                return;
                            }
                            const reduced = reduceEvent({
                                messages,
                                event: changeEvent.event,
                            });
                            if (reduced === noChange) {
                                observer.next({
                                    type: event,
                                    current: messages.toArray(x => x),
                                    diff: null,
                                });
                                return;
                            }
                            messages = reduced.messages;
                            observer.next({
                                type: event,
                                current: reduced.messages.toArray(x => x),
                                diff: reduced.diff,
                            });
                        });
                    }),
                };
            },
        };
    }
    // 'onEvent' と比べて、重複したメッセージは取り除かれるが、そのぶん処理は重め。
    static #reduceOnQuery({ state, messages, events, }) {
        const messagesSet = new MessageSet();
        state.forEach(msg => {
            messagesSet.add(msg);
        });
        const setMessage = (action) => {
            const newValue = createRoomMessage(action);
            if (newValue == null) {
                return;
            }
            const exists = messagesSet.get(newValue);
            if (exists === undefined) {
                messagesSet.add(newValue);
                return;
            }
            let existsUpdatedAt;
            switch (exists.type) {
                case publicMessage:
                case privateMessage:
                    existsUpdatedAt = exists.value.updatedAt;
                    break;
                default:
                    existsUpdatedAt = null;
                    break;
            }
            let actionUpdatedAt;
            switch (action.__typename) {
                case 'RoomPublicMessage':
                case 'RoomPrivateMessage':
                    actionUpdatedAt = action.updatedAt;
                    break;
                default:
                    actionUpdatedAt = null;
                    break;
            }
            if (compareUpdatedAt(existsUpdatedAt, '<', actionUpdatedAt)) {
                messagesSet.add(newValue);
            }
        };
        messages.pieceLogs.forEach(setMessage);
        messages.privateMessages.forEach(setMessage);
        messages.publicMessages.forEach(setMessage);
        messages.soundEffects.forEach(setMessage);
        for (const event of events) {
            switch (event.__typename) {
                case 'RoomPrivateMessage':
                    setMessage({ ...event, __typename: 'RoomPrivateMessage' });
                    break;
                case 'RoomPublicMessage':
                    setMessage({ ...event, __typename: 'RoomPublicMessage' });
                    break;
                case 'PieceLog':
                    setMessage({ ...event, __typename: 'PieceLog' });
                    break;
                case 'RoomSoundEffect':
                    setMessage({ ...event, __typename: 'RoomSoundEffect' });
                    break;
                case 'RoomPublicChannel':
                    break;
                case 'RoomPrivateMessageUpdate': {
                    const found = messagesSet.getPrivateMessage(event.messageId);
                    if (found == null) {
                        break;
                    }
                    if (compareUpdatedAt(found.updatedAt, '<', event.updatedAt)) {
                        const newValue = produce__default.default(found, found => {
                            found.altTextToSecret = event.altTextToSecret;
                            found.commandResult = event.commandResult;
                            found.initText = event.initText;
                            found.initTextSource = event.initTextSource;
                            found.isSecret = event.isSecret;
                            found.updatedAt = event.updatedAt;
                            found.updatedText = event.updatedText;
                        });
                        messagesSet.add({ type: privateMessage, value: newValue });
                    }
                    break;
                }
                case 'RoomPublicMessageUpdate': {
                    const found = messagesSet.getPublicMessage(event.messageId);
                    if (found == null) {
                        break;
                    }
                    if (compareUpdatedAt(found.updatedAt, '<', event.updatedAt)) {
                        const newValue = produce__default.default(found, found => {
                            found.altTextToSecret = event.altTextToSecret;
                            found.commandResult = event.commandResult;
                            found.initText = event.initText;
                            found.initTextSource = event.initTextSource;
                            found.isSecret = event.isSecret;
                            found.updatedAt = event.updatedAt;
                            found.updatedText = event.updatedText;
                        });
                        messagesSet.add({ type: publicMessage, value: newValue });
                    }
                    break;
                }
                case 'RoomPublicChannelUpdate':
                case 'RoomMessagesReset': {
                    console.warn(`${event.__typename} is deprecated.`);
                    break;
                }
            }
        }
        return [...messagesSet.values()].sort((x, y) => createSortKey(x) - createSortKey(y));
    }
    onQuery(messages) {
        const newMessages = RoomMessagesClient.#reduceOnQuery({
            state: this.#messages.toArray(x => x),
            messages,
            events: this.#messagesState.isQueryFetched ? [] : this.#messagesState.eventsQueue,
        });
        this.#messages = new SortedArray(createSortKey, newMessages);
        this.#messagesState = {
            isQueryFetched: true,
        };
        this.#messagesChanged.next({
            type: query,
            isQueryFetched: true,
            current: new SortedArray(createSortKey, newMessages),
        });
    }
    // `#reduceOnQuery` と比べて、重複したメッセージは取り除かれないが、そのぶん処理は軽め。
    onEvent(event) {
        const messages = this.#messages;
        if (!this.#messagesState.isQueryFetched) {
            this.#messagesState = {
                ...this.#messagesState,
                eventsQueue: [...this.#messagesState.eventsQueue, event],
            };
            this.#messagesChanged.next({
                type: 'event',
                isQueryFetched: false,
                event,
                current: messages.clone(),
                diff: null,
            });
            return;
        }
        const reduced = reduceEvent({
            messages: this.#messages,
            event,
        });
        if (reduced === noChange) {
            return;
        }
        this.#messages = reduced.messages;
        this.#messagesState = {
            isQueryFetched: true,
        };
        this.#messagesChanged.next({
            type: 'event',
            isQueryFetched: true,
            current: reduced.messages,
            diff: reduced.diff,
            event,
        });
    }
    addCustomMessage(message) {
        const customMessage = { ...message, type: custom };
        const messagesClone = this.#messages.clone();
        messagesClone.add(customMessage);
        this.#messages = messagesClone;
        this.#messagesChanged.next({
            type: event,
            isQueryFetched: false,
            event: { __typename: custom, value: customMessage },
            current: this.#messages.clone(),
            diff: {
                prevValue: undefined,
                nextValue: customMessage,
            },
        });
    }
    clear() {
        this.#messagesState = {
            isQueryFetched: false,
            eventsQueue: [],
        };
        this.#messages = new SortedArray(createSortKey);
        this.#messagesChanged.next({
            type: clear,
            isQueryFetched: false,
            current: this.#messages.clone(),
        });
    }
}

exports.PrivateChannelSet = PrivateChannelSet;
exports.PrivateChannelSets = PrivateChannelSets;
exports.RoomChannels = RoomChannels;
exports.RoomMessagesClient = RoomMessagesClient;
exports.clear = clear;
exports.custom = custom;
exports.event = event;
exports.pieceLog = pieceLog;
exports.privateMessage = privateMessage;
exports.publicChannel = publicChannel;
exports.publicMessage = publicMessage;
exports.query = query;
exports.reset = reset;
exports.soundEffect = soundEffect;
