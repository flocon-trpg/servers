import faker from 'faker';
import { User } from '../../entities/user/mikro-orm';
import { Room } from '../../entities/room/mikro-orm';
import { Reference } from '@mikro-orm/core';
import { RoomPrvMsg, RoomPubCh, RoomPubMsg } from '../../entities/roomMessage/mikro-orm';
import { EM } from '../../../utils/types';
import { $free } from '../../../@shared/Constants';

function* createPrivateMessagesCore(room: Room, createdBy: User, visibleTo: ReadonlyArray<User>) {
    for (let i = 0; i < 100; i++) {
        const result = new RoomPrvMsg();
        result.text = faker.lorem.words();
        result.createdAt = faker.date.recent();
        result.room = Reference.create(room);
        result.createdBy = Reference.create(createdBy);
        visibleTo.forEach(user => {
            user.visibleRoomPrvMsgs.add(result);
            result.visibleTo.add(user);
        });
        yield result;
    }
};

export const createPrivateMessages = (room: Room, createdBy: User, visibleTo: ReadonlyArray<User>): RoomPrvMsg[] => {
    return [...createPrivateMessagesCore(room, createdBy, visibleTo)];
};

function* createPublicMessagesCore(em: EM,room: Room, createdBy: User) {
    const freeCh = new RoomPubCh({ key: $free });
    freeCh.room = Reference.create(room);
    em.persist(freeCh);
    const ch0 = new RoomPubCh({ key: '1' });
    ch0.room = Reference.create(room);
    ch0.name = 'hoge';
    em.persist(ch0);
    for (let i = 0; i < 100; i++) {
        const result = new RoomPubMsg();
        result.text = faker.lorem.words();
        result.createdAt = faker.date.recent();
        result.createdBy = Reference.create(createdBy);
        result.roomPubCh = Reference.create(freeCh);
        yield result;
    }
    for (let j = 0; j < 100; j++) {
        const result = new RoomPubMsg();
        result.text = faker.lorem.words();
        result.createdAt = faker.date.recent();
        result.createdBy = Reference.create(createdBy);
        result.roomPubCh = Reference.create(ch0);
        yield result;
    }
};

export const createPublicMessages = (em: EM, room: Room, createdBy: User): RoomPubMsg[] => {
    return [...createPublicMessagesCore(em, room, createdBy)];
};