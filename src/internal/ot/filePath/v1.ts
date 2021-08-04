import * as t from 'io-ts';

export const Default = 'Default';
export const FirebaseStorage = 'FirebaseStorage';

export const sourceType = t.union([t.literal(Default), t.literal(FirebaseStorage)]);

export const filePath = t.type({
    $version: t.literal(1),

    path: t.string,
    sourceType,
});

export type FilePath = t.TypeOf<typeof filePath>;
