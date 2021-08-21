import { maybe } from '@kizahasi/flocon-core';
import * as t from 'io-ts';

const url = t.type({
    http: maybe(t.string),
    ws: maybe(t.string),
});

const api = t.type({
    url: maybe(url),
});

const storage = t.type({
    enablePublic: t.boolean,
    enableUnlisted: t.boolean,
});

const firebase = t.type({
    storage: maybe(storage),
});

export const webConfig = t.type({
    api: maybe(api),
    firebase: maybe(firebase),
});

export type WebConfig = t.TypeOf<typeof webConfig>;
