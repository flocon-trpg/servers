import { Reflector } from '@nestjs/core';

// configでadminに指定されているユーザー。現状ではentryも必要としているが、しなくてもOKという仕様に変更するかもしれない。
export const ADMIN = 'ADMIN';

// entryしているユーザー。LOGIN の条件も満たす必要がある。
export const ENTRY = 'ENTRY';

// Firebase Authentication でのログインが必要。
export const LOGIN = 'LOGIN';

// 何も指定されていない。ログインも必要ない。
export const NONE = 'NONE';

export type RoleType = typeof ADMIN | typeof ENTRY | typeof LOGIN | typeof NONE;

export const Auth = Reflector.createDecorator<RoleType>();
