import { ServerConfig } from '../config/types';
import { BaasType } from '../enums/BaasType';
import { EM } from '../utils/types';
import { User } from './entities/user/mikro-orm';

// Userが見つかっても、entryしていなかったらnullを返す。
export const getUserIfEntry = async ({
    em,
    userUid,
    baasType,
    serverConfig,
    noFlush,
}: {
    em: EM;
    userUid: string;
    baasType: BaasType;
    serverConfig: ServerConfig;
    noFlush?: boolean;
}): Promise<User | null> => {
    const user = await em.findOne(User, { userUid, baasType });
    const requiresEntryPassword = serverConfig.entryPassword != null;

    if (user == null) {
        if (!requiresEntryPassword) {
            const newUser = new User({ userUid, baasType });
            newUser.isEntry = true;
            if (noFlush === true) {
                em.persist(newUser);
            } else {
                await em.persistAndFlush(newUser);
            }
            return newUser;
        }
        return null;
    }

    if (user.isEntry) {
        return user;
    }

    if (!requiresEntryPassword) {
        user.isEntry = true;
        if (noFlush !== true) {
            await em.flush();
        }
        return user;
    }

    return null;
};
