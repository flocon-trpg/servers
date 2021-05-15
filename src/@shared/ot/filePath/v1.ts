import * as t from 'io-ts';

export const Default = 'Default';
export const FirebaseStorage = 'FirebaseStorage';

export const filePath = t.type({
    path: t.string,
    sourceType: t.union([t.literal(Default), t.literal(FirebaseStorage)]),
});

export type FilePath = t.TypeOf<typeof filePath>