'use strict';

var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var env = require('../env.js');
var types = require('./types.js');

env.loadDotenv();
const tryParseJSON = (json) => {
    try {
        return result.Result.ok(JSON.parse(json));
    }
    catch (e) {
        if (e instanceof Error) {
            return result.Result.error(e.message);
        }
        throw e;
    }
};
const ensureOk = (source) => {
    return source?.value;
};
class ServerConfigParser {
    get admins() {
        return this[env.FLOCON_ADMIN];
    }
    get accessControlAllowOrigin() {
        return this[env.ACCESS_CONTROL_ALLOW_ORIGIN];
    }
    get autoMigration() {
        return this[env.AUTO_MIGRATION];
    }
    get databaseUrl() {
        return this[env.DATABASE_URL];
    }
    get uploaderCountQuota() {
        return this[env.EMBUPLOADER_COUNT_QUOTA];
    }
    get uploaderEnabled() {
        return this[env.EMBUPLOADER_ENABLED];
    }
    get uploaderMaxSize() {
        return this[env.EMBUPLOADER_MAX_SIZE];
    }
    get uploaderSizeQuota() {
        return this[env.EMBUPLOADER_SIZE_QUOTA];
    }
    get uploaderPath() {
        return this[env.EMBUPLOADER_PATH];
    }
    get entryPassword() {
        return this[env.ENTRY_PASSWORD];
    }
    get firebaseAdminSecret() {
        return this[env.FIREBASE_ADMIN_SECRET];
    }
    get firebaseProjectId() {
        return this[env.FIREBASE_PROJECT_ID];
    }
    get disableRateLimit() {
        return this[env.FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL];
    }
    get heroku() {
        return this[env.HEROKU];
    }
    get mysql() {
        return this[env.MYSQL];
    }
    get roomHistCount() {
        return this[env.ROOMHIST_COUNT];
    }
    get postgresql() {
        return this[env.POSTGRESQL];
    }
    get sqlite() {
        return this[env.SQLITE];
    }
    constructor(env$1) {
        const simpleProps = [env.ACCESS_CONTROL_ALLOW_ORIGIN, env.DATABASE_URL, env.EMBUPLOADER_PATH];
        for (const prop of simpleProps) {
            this[prop] = env$1[prop];
        }
        const intProps = [
            env.EMBUPLOADER_COUNT_QUOTA,
            env.EMBUPLOADER_MAX_SIZE,
            env.EMBUPLOADER_SIZE_QUOTA,
            env.ROOMHIST_COUNT,
        ];
        for (const prop of intProps) {
            const value = env$1[prop];
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const intValue = utils.filterInt(value.trim());
            if (intValue == null) {
                this[prop] = result.Result.error(undefined);
            }
            else {
                this[prop] = result.Result.ok(intValue);
            }
        }
        const booleanProps = [
            env.AUTO_MIGRATION,
            env.EMBUPLOADER_ENABLED,
            env.FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
            env.HEROKU,
        ];
        for (const prop of booleanProps) {
            const value = env$1[prop];
            if (value == null) {
                this[prop] = undefined;
                continue;
            }
            const propValue = utils.parseStringToBoolean(value);
            if (propValue.isError) {
                this[prop] = result.Result.error(undefined);
            }
            else {
                this[prop] = propValue;
            }
        }
        this[env.FLOCON_ADMIN] = ServerConfigParser.admin(env$1);
        this[env.FIREBASE_ADMIN_SECRET] = ServerConfigParser.firebaseAdminSecretProp(env$1);
        this[env.FIREBASE_PROJECT_ID] = ServerConfigParser.firebaseProjectId(env$1);
        this[env.ENTRY_PASSWORD] = ServerConfigParser.entryPasswordProp(env$1);
        this[env.MYSQL] = ServerConfigParser.mysqlProp(env$1);
        this[env.POSTGRESQL] = ServerConfigParser.postgresqlProp(env$1);
        this[env.SQLITE] = ServerConfigParser.sqliteProp(env$1);
    }
    static admin(env$1) {
        const adminValue = env$1[env.FLOCON_ADMIN];
        if (adminValue == null) {
            return result.Result.ok([]);
        }
        if (/[^a-zA-Z0-9 ,]/.test(adminValue)) {
            return result.Result.error(`${env.FLOCON_ADMIN} contains invalid characters. Valid characters are [^a-zA-Z0-9 ,]. Make sure firebase UIDs are set. To set multiple UIDs, separate them by commas.`);
        }
        return result.Result.ok(adminValue
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== ''));
    }
    static entryPasswordProp(env$1) {
        const entryPasswordObject = env$1[env.ENTRY_PASSWORD];
        if (entryPasswordObject == null) {
            return undefined;
        }
        const json = tryParseJSON(entryPasswordObject);
        if (json.isError) {
            return result.Result.error(undefined);
        }
        const j = types.entryPassword.safeParse(json.value);
        if (!j.success) {
            return result.Result.error(undefined);
        }
        if (j.data.type !== types.none) {
            return result.Result.ok(j.data);
        }
        return undefined;
    }
    static firebaseAdminSecretProp(env$1) {
        const firebaseAdminSecretObject = env$1[env.FIREBASE_ADMIN_SECRET];
        if (firebaseAdminSecretObject == null) {
            return undefined;
        }
        const json = tryParseJSON(firebaseAdminSecretObject);
        if (json.isError) {
            return result.Result.error(undefined);
        }
        const j = types.firebaseAdminSecret.safeParse(json.value);
        if (!j.success) {
            return result.Result.error(undefined);
        }
        return result.Result.ok(j.data);
    }
    static firebaseProjectId(env$1) {
        const project_id = env$1[env.FIREBASE_PROJECT_ID];
        const projectid = env$1[env.FIREBASE_PROJECTID];
        if (project_id != null && projectid != null) {
            utils.loggerRef.warn(`${env.FIREBASE_PROJECT_ID} と ${env.FIREBASE_PROJECTID} が両方ともセットされているため、${env.FIREBASE_PROJECT_ID} の値のみが参照されます。`);
        }
        return project_id ?? projectid;
    }
    static mysqlProp(env$1) {
        const mysqlObject = env$1[env.MYSQL];
        if (mysqlObject == null) {
            return undefined;
        }
        const json = tryParseJSON(mysqlObject);
        if (json.isError) {
            return result.Result.error(undefined);
        }
        const j = types.mysqlDatabase.safeParse(json.value);
        if (!j.success) {
            return result.Result.error(undefined);
        }
        return result.Result.ok(j.data);
    }
    static postgresqlProp(env$1) {
        const postgresqlObject = env$1[env.POSTGRESQL];
        if (postgresqlObject == null) {
            return undefined;
        }
        const json = tryParseJSON(postgresqlObject);
        if (json.isError) {
            return result.Result.error(undefined);
        }
        const j = types.postgresqlDatabase.safeParse(json.value);
        if (!j.success) {
            return result.Result.error(undefined);
        }
        return result.Result.ok(j.data);
    }
    static sqliteProp(env$1) {
        const sqliteObject = env$1[env.SQLITE];
        if (sqliteObject == null) {
            return undefined;
        }
        const json = tryParseJSON(sqliteObject);
        if (json.isError) {
            return result.Result.error(undefined);
        }
        const j = types.sqliteDatabase.safeParse(json.value);
        if (!j.success) {
            return result.Result.error(undefined);
        }
        return result.Result.ok(j.data);
    }
    parseError(envKey) {
        return result.Result.error(`${envKey} の値の記入方法が誤っています。`);
    }
    parseErrorFromBoolean(envKey) {
        return result.Result.error(`${envKey} で、次のエラーが発生しました: ` + utils.parseStringToBooleanError.ja);
    }
    parseErrorFromInteger(envKey) {
        return result.Result.error(`${envKey} の値を整数値に変換できませんでした。`);
    }
    createServerConfigForMigration() {
        if (this.heroku?.isError === true) {
            return this.parseErrorFromBoolean(env.HEROKU);
        }
        if (this.mysql?.isError === true) {
            return this.parseError(env.MYSQL);
        }
        if (this.sqlite?.isError === true) {
            return this.parseError(env.SQLITE);
        }
        if (this.postgresql?.isError === true) {
            return this.parseError(env.POSTGRESQL);
        }
        const result$1 = {
            databaseUrl: this.databaseUrl,
            heroku: ensureOk(this.heroku) ?? false,
            mysql: ensureOk(this.mysql),
            postgresql: ensureOk(this.postgresql),
            sqlite: ensureOk(this.sqlite),
        };
        return result.Result.ok(result$1);
    }
    get serverConfigForMigration() {
        if (this.serverConfigForMigrationCache == null) {
            this.serverConfigForMigrationCache = this.createServerConfigForMigration();
        }
        return this.serverConfigForMigrationCache;
    }
    createServerConfig() {
        if (this.admins?.isError === true) {
            return this.admins;
        }
        if (this.autoMigration?.isError === true) {
            return this.parseErrorFromBoolean(env.AUTO_MIGRATION);
        }
        if (this.disableRateLimit?.isError === true) {
            return this.parseErrorFromBoolean(env.FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL);
        }
        if (this.entryPassword?.isError === true) {
            return this.parseError(env.ENTRY_PASSWORD);
        }
        if (this.firebaseAdminSecret?.isError === true) {
            return this.parseError(env.FIREBASE_ADMIN_SECRET);
        }
        if (this.heroku?.isError === true) {
            return this.parseErrorFromBoolean(env.HEROKU);
        }
        if (this.mysql?.isError === true) {
            return this.parseError(env.MYSQL);
        }
        if (this.postgresql?.isError === true) {
            return this.parseError(env.POSTGRESQL);
        }
        if (this.roomHistCount?.isError === true) {
            return this.parseError(env.ROOMHIST_COUNT);
        }
        if (this.sqlite?.isError === true) {
            return this.parseError(env.SQLITE);
        }
        if (this.uploaderCountQuota?.isError === true) {
            return this.parseErrorFromInteger(env.EMBUPLOADER_COUNT_QUOTA);
        }
        if (this.uploaderEnabled?.isError === true) {
            return this.parseErrorFromBoolean(env.EMBUPLOADER_ENABLED);
        }
        if (this.uploaderSizeQuota?.isError === true) {
            return this.parseErrorFromInteger(env.EMBUPLOADER_SIZE_QUOTA);
        }
        if (this.uploaderMaxSize?.isError === true) {
            return this.parseErrorFromInteger(env.EMBUPLOADER_MAX_SIZE);
        }
        const uploaderConfig = {
            enabled: ensureOk(this.uploaderEnabled) ?? false,
            directory: this.uploaderPath,
            countQuota: ensureOk(this.uploaderCountQuota),
            sizeQuota: ensureOk(this.uploaderSizeQuota),
            maxFileSize: ensureOk(this.uploaderMaxSize),
        };
        const result$1 = {
            accessControlAllowOrigin: this.accessControlAllowOrigin,
            admins: ensureOk(this.admins) ?? [],
            autoMigration: ensureOk(this.autoMigration) ?? false,
            databaseUrl: this.databaseUrl,
            entryPassword: ensureOk(this.entryPassword),
            firebaseAdminSecret: ensureOk(this.firebaseAdminSecret),
            firebaseProjectId: this.firebaseProjectId,
            heroku: ensureOk(this.heroku) ?? false,
            mysql: ensureOk(this.mysql),
            roomHistCount: ensureOk(this.roomHistCount),
            postgresql: ensureOk(this.postgresql),
            sqlite: ensureOk(this.sqlite),
            uploader: uploaderConfig,
            disableRateLimitExperimental: ensureOk(this.disableRateLimit) ?? false,
        };
        return result.Result.ok(result$1);
    }
    get serverConfig() {
        if (this.serverConfigCache == null) {
            this.serverConfigCache = this.createServerConfig();
        }
        return this.serverConfigCache;
    }
}

exports.ServerConfigParser = ServerConfigParser;
//# sourceMappingURL=serverConfigParser.js.map
