import { Room } from './entity';

export const role = async ({ roomEntity, myUserUid }: { roomEntity: Room; myUserUid: string }) => {
    const me = (await roomEntity.participants.init({ where: { user: { userUid: myUserUid } } }))[0];
    return me?.role;
};
