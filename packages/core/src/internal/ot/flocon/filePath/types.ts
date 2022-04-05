import * as t from 'io-ts';
import { createReplaceValueTemplate } from '../../generator';

export const Default = 'Default';
export const Uploader = 'Uploader';
export const FirebaseStorage = 'FirebaseStorage';

const sourceType = t.union([t.literal(Default), t.literal(Uploader), t.literal(FirebaseStorage)]);

export const filePathValue = t.type({
    $v: t.literal(1),
    $r: t.literal(1),

    path: t.string,
    sourceType,
});

export const filePathTemplate = createReplaceValueTemplate(filePathValue);
