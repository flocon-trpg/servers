import { Cascade, Collection, Entity, Enum, IdentifiedReference, Index, JsonType, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { EM } from '../../../utils/types';
import { AddBoardOp, Board, RemoveBoardOp, UpdateBoardOp } from '../board/mikro-orm';
import { AddCharaOp, Chara, RemoveCharaOp, UpdateCharaOp } from '../character/mikro-orm';
import { Participant } from '../participant/mikro-orm';
import { RoomPrvMsg, RoomPubCh, RoomSe as RoomSe } from '../roomMessage/mikro-orm';
import { RoomParameterNameType } from '../../../enums/RoomParameterNameType';
import { ReplaceFilePathArrayDownOperation, ReplaceNullableStringDownOperation } from '../../Operations';
import { FilePath } from '../filePath/global';
import { AddRoomBgmOp, RemoveRoomBgmOp, RoomBgm, UpdateRoomBgmOp } from './bgm/mikro-orm';
import { AddParamNameOp, ParamName, RemoveParamNameOp, UpdateParamNameOp } from './paramName/mikro-orm';

// Roomは最新の状況を反映するが、RoomOperationを用いて1つ前の状態に戻せるのは一部のプロパティのみ。
// 例えばrevisionやparticipantsはRoomOperationをいくらapplyしても最新のまま。
@Entity()
export class Room {
    public constructor({
        name,
    }: {
        name: string;
    }) {
        this.name = name;
    }

    @PrimaryKey()
    public id: string = v4();

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ version: true })
    public version: number = 1;


    @Property()
    public name: string;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property()
    public revision: number = 0;

    @Property({ type: Date, nullable: true, onUpdate: () => new Date() })
    public updatedAt?: Date;

    @Property({ nullable: true })
    public joinAsPlayerPhrase?: string;

    @Property({ nullable: true })
    public joinAsSpectatorPhrase?: string;

    @Property({ nullable: true })
    public deletePhrase?: string;

    @OneToMany(() => RoomOp, x => x.room, { orphanRemoval: true })
    public operations = new Collection<RoomOp>(this);

    @OneToMany(() => ParamName, x => x.room, { orphanRemoval: true })
    public paramNames = new Collection<ParamName>(this);

    @OneToMany(() => Board, x => x.room, { orphanRemoval: true })
    public boards = new Collection<Board>(this);

    @OneToMany(() => Chara, x => x.room, { orphanRemoval: true })
    public characters = new Collection<Chara>(this);

    @OneToMany(() => RoomBgm, x => x.room, { orphanRemoval: true })
    public roomBgms = new Collection<RoomBgm>(this);

    @OneToMany(() => Participant, x => x.room, { orphanRemoval: true })
    public participants = new Collection<Participant>(this);

    @OneToMany(() => RoomPubCh, x => x.room, { orphanRemoval: true })
    public roomChatChs = new Collection<RoomPubCh>(this);

    @OneToMany(() => RoomPrvMsg, x => x.room, { orphanRemoval: true })
    public roomPrvMsgs = new Collection<RoomPrvMsg>(this);

    @OneToMany(() => RoomSe, x => x.room, { orphanRemoval: true })
    public roomSes = new Collection<RoomSe>(this);
}

@Entity()
export class RoomOp {
    public constructor({
        prevRevision,
    }: {
        prevRevision: number;
    }) {
        this.prevRevision = prevRevision;
    }


    @PrimaryKey()
    public id: string = v4();


    @Property()
    public prevRevision: number;


    @Property({ nullable: true })
    public name?: string;


    @ManyToOne(() => Room, { wrappedReference: true })
    public room!: IdentifiedReference<Room>;


    @OneToMany(() => AddParamNameOp, x => x.roomOp, { orphanRemoval: true })
    public addParamNameOps = new Collection<AddParamNameOp>(this);

    @OneToMany(() => RemoveParamNameOp, x => x.roomOp, { orphanRemoval: true })
    public removeParamNameOps = new Collection<RemoveParamNameOp>(this);

    @OneToMany(() => UpdateParamNameOp, x => x.roomOp, { orphanRemoval: true })
    public updateParamNameOps = new Collection<UpdateParamNameOp>(this);


    @OneToMany(() => AddRoomBgmOp, x => x.roomOp, { orphanRemoval: true })
    public addRoomBgmOps = new Collection<AddRoomBgmOp>(this);

    @OneToMany(() => RemoveRoomBgmOp, x => x.roomOp, { orphanRemoval: true })
    public removeRoomBgmOps = new Collection<RemoveRoomBgmOp>(this);

    @OneToMany(() => UpdateRoomBgmOp, x => x.roomOp, { orphanRemoval: true })
    public updateRoomBgmOps = new Collection<UpdateRoomBgmOp>(this);


    @OneToMany(() => AddBoardOp, x => x.roomOp, { orphanRemoval: true })
    public addBoardOps = new Collection<AddBoardOp>(this);

    @OneToMany(() => RemoveBoardOp, x => x.roomOp, { orphanRemoval: true })
    public removeBoardOps = new Collection<RemoveBoardOp>(this);

    @OneToMany(() => UpdateBoardOp, x => x.roomOp, { orphanRemoval: true })
    public updateBoardOps = new Collection<UpdateBoardOp>(this);


    @OneToMany(() => AddCharaOp, x => x.roomOp, { orphanRemoval: true })
    public addCharacterOps = new Collection<AddCharaOp>(this);

    @OneToMany(() => RemoveCharaOp, x => x.roomOp, { orphanRemoval: true })
    public removeCharacterOps = new Collection<RemoveCharaOp>(this);

    @OneToMany(() => UpdateCharaOp, x => x.roomOp, { orphanRemoval: true })
    public updateCharacterOps = new Collection<UpdateCharaOp>(this);
}

export const removeRoom = async (em: EM, room: Room): Promise<void> => {
    await room.boards.init();
    room.boards.removeAll();

    for (const character of await room.characters.loadItems()) {
        await character.boolParams.init();
        character.boolParams.removeAll();

        await character.numParams.init();
        character.numParams.removeAll();

        await character.strParams.init();
        character.strParams.removeAll();
        
        await character.pieceLocs.init();
        character.pieceLocs.removeAll();
    }
    room.characters.removeAll();

    await room.paramNames.init();
    room.paramNames.removeAll();

    for (const operation of await room.operations.loadItems()) {
        await operation.addBoardOps.init();
        operation.addBoardOps.removeAll();

        await operation.addCharacterOps.init();
        operation.addCharacterOps.removeAll();

        await operation.removeBoardOps.init();
        operation.removeBoardOps.removeAll();

        for (const removeCharacterOp of await operation.removeCharacterOps.loadItems()) {
            await removeCharacterOp.removedBoolParam.init();
            removeCharacterOp.removedBoolParam.removeAll();

            await removeCharacterOp.removedNumParam.init();
            removeCharacterOp.removedNumParam.removeAll();

            await removeCharacterOp.removedStrParam.init();
            removeCharacterOp.removedStrParam.removeAll();

            await removeCharacterOp.removedPieceLoc.init();
            removeCharacterOp.removedPieceLoc.removeAll();
        }
        operation.removeCharacterOps.removeAll();

        await operation.updateBoardOps.init();
        operation.updateBoardOps.removeAll();

        for (const updateCharacterOp of await operation.updateCharacterOps.loadItems()) {
            await updateCharacterOp.updateBoolParamOps.init();
            updateCharacterOp.updateBoolParamOps.removeAll();

            await updateCharacterOp.addNumParamOps.init();
            updateCharacterOp.addNumParamOps.removeAll();
            await updateCharacterOp.updateNumParamOps.init();
            updateCharacterOp.updateNumParamOps.removeAll();

            await updateCharacterOp.updateNumMaxParamOps.init();
            updateCharacterOp.updateNumMaxParamOps.removeAll();

            await updateCharacterOp.updateStrParamOps.init();
            updateCharacterOp.updateStrParamOps.removeAll();

            await updateCharacterOp.addPieceLocOps.init();
            updateCharacterOp.addPieceLocOps.removeAll();
            await updateCharacterOp.updatePieceLocOps.init();
            updateCharacterOp.updatePieceLocOps.removeAll();
            await updateCharacterOp.removePieceLocOps.init();
            updateCharacterOp.removePieceLocOps.removeAll();
        }
        operation.updateCharacterOps.removeAll();
    }
    room.operations.removeAll();

    await room.participants.init();
    room.participants.removeAll();

    for (const roomChatCh of await room.roomChatChs.loadItems()) {
        await roomChatCh.roomPubMsgs.init();
        roomChatCh.roomPubMsgs.removeAll();
    }
    room.roomChatChs.removeAll();

    await room.roomPrvMsgs.init();
    room.roomPrvMsgs.removeAll();

    await room.roomSes.init();
    room.roomSes.removeAll();

    em.remove(room);
};