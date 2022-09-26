import { Result as $Result } from '@kizahasi/result';
import { AppConsole } from '../utils/appConsole';
import { ServerConfigForMigration, mysql, postgresql, sqlite } from './types';

type Result =
    | {
          type: typeof mysql;
          mysql: NonNullable<ServerConfigForMigration['mysql']>;
      }
    | {
          type: typeof postgresql;
          postgresql: NonNullable<ServerConfigForMigration['postgresql']>;
      }
    | {
          type: typeof sqlite;
          sqlite: { clientUrl: string };
      };

// TODO: あくまで DATABASE_URL のデータベースの種類を特定するだけであり、その URL が mikro-orm でサポートされているかどうかはチェックしない。可能であれば、サポートされていない URL であればここで弾く機能を付ける。
export const determineDatabaseUrl = (DATABASE_URL: string): $Result<Result, AppConsole.Message> => {
    const protocol = DATABASE_URL.split('://')[0];
    switch (protocol) {
        case undefined:
            return $Result.error({ en: 'Could not determine database. URL is invalid.' });
        // https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
        case 'postgres':
        case 'postgresql':
            return $Result.ok({ type: postgresql, postgresql: { clientUrl: DATABASE_URL } });
        // https://www.sqlite.org/uri.html
        // sqlite: は非公式だが、使用例が見られる。
        case 'file':
        case 'sqlite':
            return $Result.ok({
                type: sqlite,
                sqlite: { clientUrl: DATABASE_URL },
            });
        default:
            break;
    }

    if (protocol.startsWith('mysql')) {
        return $Result.ok({ type: mysql, mysql: { clientUrl: DATABASE_URL } });
    }

    return $Result.error({
        en: 'Could not determine database. To use PostgreSQL, start with postgres:// or postgresql://. To use MySQL, start with mysql://. To use SQLite, start with file:// .',
    });
};
