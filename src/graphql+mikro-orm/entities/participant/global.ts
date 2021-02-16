
import { ParticipantRole } from '../../../enums/ParticipantRole';
import * as $MikroORM from './mikro-orm';
import * as $GraphQL from './graphql';
import { ReplaceStringUpOperation } from '../../Operations';
import { Collection, Reference } from '@mikro-orm/core';
import * as MapOperations from '../../mapOperations';
import { User as MikroORMUser } from '../user/mikro-orm';
import { EM } from '../../../utils/types';
import { RoomOperation, RoomOperationValue } from '../room/graphql';
import { Room as MikroORMRoom } from '../room/mikro-orm';
import { ParticipantRoleOperation } from '../../../enums/ParticipantRoleOperation';
import { __ } from '../../../@shared/collection';

// Participantの変更は、operate(RoomOperationInput)ではなく、特別なmutationをユーザーが実行してそれを通してサーバーが直接更新してRoomOperationを返すことで行う。そのため、BoardやCharacterなどとは実装されているメソッドなどが異なっている（例えば、Participantの変更はサーバーが行うため必ず直列的になることが保証される。よって過去のOperationを参照してtransformする処理は必要ない）。

export type ParticipantStateType = {
    name: string;
    role: ParticipantRole;

}

export type ParticipantUpOperationType = {
    name?: ReplaceStringUpOperation;
    role?: $GraphQL.ReplaceNullableParticipantRoleUpOperation;
}

export const toGraphQL = async ({
    room,
}: {
    room: MikroORMRoom;
}): Promise<{ participants: $GraphQL.ParticipantState[]; revision: number }> => {
    const participants = __(await room.particis.loadItems()).compact(p => {
        if (p.user.userUid == null) {
            return null;
        }
        return {
            userUid: p.user.userUid,
            value: {
                name: p.name,
                role: p.role,
            }
        };
    }).toArray();
    return { participants, revision: room.particiRevision };
};

// このメソッドではflushは行われない。flushのし忘れに注意。
export const addAndCreateGraphQLOperation = async ({
    em,
    userUid,
    newValue,
    user,
    room,
}: {
    em: EM;
    userUid: string;
    newValue: ParticipantStateType;
    user: MikroORMUser;
    room: MikroORMRoom;
}): Promise<$GraphQL.ParticipantsOperation> => {
    const particiOp = new $MikroORM.ParticiOp({
        prevRevision: room.particiRevision,
    });

    const found = await em.findOne($MikroORM.Partici, { user: { userUid: userUid }, room: { id: room.id } });
    if (found != null) {
        throw 'Cannot add Participant because entity exists.';
    }
    const newEntity = new $MikroORM.Partici(newValue);
    const operationEntity = new $MikroORM.AddParticiOp();
    newEntity.room = Reference.create(room);
    newEntity.user = Reference.create(user);
    operationEntity.user = Reference.create(user);
    em.persist(newEntity);
    particiOp.addParticiOps.add(operationEntity);
    em.persist(particiOp);
    room.particiRevision += 1;
    return {
        __tstype: $GraphQL.participantsOperation,
        operatedBy: userUid,
        revisionTo: room.particiRevision + 1,
        update: [],
        replace: [{
            userUid: userUid,
            newValue: {
                name: newValue.name,
                role: newValue.role,
            },
        }],
    };
};

export const updateAndCreateGraphQLOperation = async ({
    em,
    userUid,
    operation,
    room,
}: {
    em: EM;
    userUid: string;
    operation: ParticipantUpOperationType;
    room: MikroORMRoom;
}): Promise<$GraphQL.ParticipantsOperation> => {
    const particiOp = new $MikroORM.ParticiOp({
        prevRevision: room.particiRevision,
    });

    const found = await em.findOne($MikroORM.Partici, { user: { userUid: userUid }, room: { id: room.id } });
    if (found == null) {
        throw 'Cannot update Participant because entity was not found.';
    }

    const graphQLOperation: $GraphQL.ParticipantOperation = {};
    const operationEntity = new $MikroORM.UpdateParticiOp();
    operationEntity.user = Reference.create(found.user);
    if (operation.name != null) {
        if (found.name !== operation.name.newValue) {
            operationEntity.name = found.name;
            found.name = operation.name.newValue;
            graphQLOperation.name = operation.name;
        }
    }
    if (operation.role != null) {
        if (found.role !== operation.role.newValue) {
            switch (found.role) {
                case ParticipantRole.Master:
                    operationEntity.role = ParticipantRoleOperation.Master;
                    break;
                case ParticipantRole.Player:
                    operationEntity.role = ParticipantRoleOperation.Player;
                    break;
                case ParticipantRole.Spectator:
                    operationEntity.role = ParticipantRoleOperation.Spectator;
                    break;
            }
            found.role = operation.role.newValue;
            graphQLOperation.role = operation.role;
        }
    }
    particiOp.updateParticiOps.add(operationEntity);
    em.persist(particiOp);
    room.particiRevision += 1;
    return {
        __tstype: $GraphQL.participantsOperation,
        operatedBy: userUid,
        revisionTo: room.particiRevision + 1,
        update: [{
            userUid: userUid,
            operation: operation,
        }],
        replace: [],
    };
};