// configでadminに指定されているユーザー。現状ではentryも必要としているが、これはまだ未確定。
export const ADMIN = 'ADMIN';

// entryしているユーザー。
export const ENTRY = 'ENTRY';

// @Authorizedに何も指定しなかった場合は、Firebase Authenticationでログインしているユーザー全員がアクセス可能となる。
