import { Result as $Result } from '@kizahasi/result';
import {
    ServerConfigForMigration,
    mysql,
    postgresql,
    sqlite,
} from '../../server-config/server-config.service';
import { AppConsole } from '../../utils/appConsole';

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
          sqlite: { dbName: string };
      };

// TODO: あくまで DATABASE_URL のデータベースの種類を特定するだけであり、その URL が mikro-orm でサポートされているかどうかはチェックしない。可能であれば、サポートされていない URL であればここで弾く機能を付ける。
export const determineDatabaseUrl = (DATABASE_URL: string): $Result<Result, AppConsole.Message> => {
    const [protocol, hierPart] = DATABASE_URL.trim().split('://');
    if (protocol == null || hierPart == null) {
        return $Result.error({ en: 'Could not determine database. URL is invalid.' });
    }
    switch (protocol) {
        case 'postgres':
        case 'postgresql':
            return $Result.ok({ type: postgresql, postgresql: { clientUrl: DATABASE_URL } });
        // https://www.sqlite.org/uri.html
        // sqlite: は非公式だが、使用例が見られる。
        case 'file':
        case 'sqlite':
            return $Result.ok({
                type: sqlite,
                sqlite: { dbName: hierPart },
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
