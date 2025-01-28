import { Reflector } from '@nestjs/core';

/** `@Auth` の代わりにこのデコレーターを使うことで、Authz の情報を取得できます。Authz の処理(データベースの更新など)は行われません。`@Auth` と併用することはできません。 */
export const AuthStatus = Reflector.createDecorator<boolean>();
