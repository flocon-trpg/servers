import { z } from 'zod';
import { createReplaceValueTemplate } from '../../generator/types';

export const Default = 'Default';
export const Uploader = 'Uploader';
export const FirebaseStorage = 'FirebaseStorage';

const sourceType = z.union([z.literal(Default), z.literal(Uploader), z.literal(FirebaseStorage)]);

export const filePathValue = z.object({
    $v: z.literal(1),
    $r: z.literal(1),

    path: z.string(),
    sourceType,
});

export const filePathTemplate = createReplaceValueTemplate(filePathValue);
