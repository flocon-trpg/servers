import { maybe } from '@flocon-trpg/core';
import * as t from 'io-ts';

const url = t.type({
    http: maybe(t.string),
    ws: maybe(t.string),
});

const api = t.type({
    url: maybe(url),
});

const provider = t.type({
    facebook: maybe(t.boolean),
    email: maybe(t.boolean),
    google: maybe(t.boolean),
    github: maybe(t.boolean),
    phone: maybe(t.boolean),
    twitter: maybe(t.boolean),
});

const auth = t.type({
    provider,
});

const storage = t.type({
    enablePublic: t.boolean,
    enableUnlisted: t.boolean,
});

const firebase = t.type({
    auth,
    storage: maybe(storage),
});

export const webConfig = t.type({
    api: maybe(api),
    firebase,
});

export type WebConfig = t.TypeOf<typeof webConfig>;
