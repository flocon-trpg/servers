"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSystemMessage = void 0;
const util_1 = require("@kizahasi/util");
const core_1 = require("@mikro-orm/core");
const mikro_orm_1 = require("../../entities/roomMessage/mikro-orm");
const writeSystemMessage = async ({ em, text, room }) => {
    const entity = new mikro_orm_1.RoomPubMsg({ initText: text, initTextSource: undefined });
    entity.initText = text;
    let ch = await em.findOne(mikro_orm_1.RoomPubCh, { key: util_1.$system, room: room.id });
    if (ch == null) {
        ch = new mikro_orm_1.RoomPubCh({ key: util_1.$system });
        ch.room = core_1.Reference.create(room);
        em.persist(ch);
    }
    entity.roomPubCh = core_1.Reference.create(ch);
    em.persist(entity);
    return entity;
};
exports.writeSystemMessage = writeSystemMessage;
