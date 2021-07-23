import { $system } from '@kizahasi/util';
import { Reference } from '@mikro-orm/core';
import { EM } from '../../../utils/types';
import { Room } from '../../entities/room/mikro-orm';
import { RoomPubCh, RoomPubMsg } from '../../entities/roomMessage/mikro-orm';

// flushはこのメソッドでは行われないため、flushのし忘れに注意。
export const writeSystemMessage = async ({
    em,
    text,
    room,
}: {
    em: EM;
    text: string;
    room: Room;
}) => {
    const entity = new RoomPubMsg({ initText: text, initTextSource: undefined });
    entity.initText = text;
    let ch = await em.findOne(RoomPubCh, { key: $system, room: room.id });
    if (ch == null) {
        ch = new RoomPubCh({ key: $system });
        ch.room = Reference.create(room);
        em.persist(ch);
    }
    entity.roomPubCh = Reference.create(ch);
    em.persist(entity);
    return entity;
};
