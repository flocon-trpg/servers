import { RoomGetState, RoomOperationInput } from './graphql';
import { Room, RoomOp } from './mikro-orm';
import { EM } from '../../../utils/types';
import { Reference } from '@mikro-orm/core';
import { Result } from '@kizahasi/result';
import {
    composeDownOperation,
    decodeDbState,
    decodeDownOperation,
    DownOperation,
    exactDbState,
    parseUpOperation,
    State,
    stringifyState,
    toClientState,
    toDownOperation,
    TwoWayOperation,
    UpOperation,
    stringifyUpOperation,
    apply,
    diff,
    toUpOperation,
    RequestedBy,
    ParticipantState,
    update,
} from '@flocon-trpg/core';
import { Participant } from '../participant/mikro-orm';
import { recordForEachAsync } from '@flocon-trpg/utils';
import { User } from '../user/mikro-orm';
import { nullableStringToParticipantRoleType } from '../../../enums/ParticipantRoleType';
import { convertToMaxLength100String } from '../../../utils/convertToMaxLength100String';
import { isNonEmptyArray, ReadonlyNonEmptyArray } from '../../../utils/readonlyNonEmptyArray';

type IsSequentialResult<T> =
    | {
          type: 'DuplicateElement';
      }
    | {
          type: 'Sequential';
          minIndex: number;
          maxIndex: number;
          sortedResult: ReadonlyNonEmptyArray<{ index: number; value: T }>;
      }
    | {
          type: 'NotSequential';
          minIndex: number;
      };

const isSequential = <T>(
    array: ReadonlyNonEmptyArray<T>,
    getIndex: (elem: T) => number
): IsSequentialResult<T> => {
    const sorted = array
        .map(value => ({ index: getIndex(value), value }))
        .sort((x, y) => x.index - y.index);
    if (!isNonEmptyArray(sorted)) {
        throw new Error('this should not happen');
    }
    const minIndex = sorted[0].index;
    let maxIndex = minIndex;
    let previousElement: { index: number; value: T } | null = null;
    for (const elem of sorted) {
        if (previousElement != null) {
            if (elem.index === previousElement.index) {
                return { type: 'DuplicateElement' };
            }
            if (elem.index - previousElement.index !== 1) {
                return {
                    type: 'NotSequential',
                    minIndex,
                };
            }
        }
        maxIndex = elem.index;
        previousElement = elem;
    }
    return {
        type: 'Sequential',
        minIndex,
        maxIndex,
        sortedResult: sorted,
    };
};

export namespace GlobalRoom {
    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = async (roomEntity: Room, em: EM): Promise<State> => {
                const result = decodeDbState(roomEntity.value);
                const participants: Record<string, ParticipantState> = {};
                const participantEntities = await em.find(Participant, {
                    room: { id: roomEntity.id },
                });
                for (const participantEntity of participantEntities) {
                    const name = participantEntity?.name;
                    participants[participantEntity.user.userUid] = {
                        $v: 2,
                        $r: 1,
                        name: name == null ? undefined : convertToMaxLength100String(name),
                        role: participantEntity?.role,
                    };
                }
                return {
                    ...result,
                    createdBy: roomEntity.createdBy,
                    name: roomEntity.name,
                    participants,
                };
            };

            const downOperation = (entity: RoomOp) => {
                const result = decodeDownOperation(entity.value);
                return result;
            };

            export const downOperationMany = async ({
                em,
                roomId,
                revisionRange,
            }: {
                em: EM;
                roomId: string;
                revisionRange: { from: number; expectedTo?: number };
            }) => {
                if (revisionRange.expectedTo != null) {
                    if (revisionRange.from > revisionRange.expectedTo) {
                        throw new Error('Must be "revisionRange.from > revisionRange.expectedTo"');
                    }
                    if (revisionRange.from === revisionRange.expectedTo) {
                        return Result.ok(undefined);
                    }
                }
                const operationEntities = await em.find(RoomOp, {
                    room: { id: roomId },
                    prevRevision: { $gte: revisionRange.from },
                });
                if (!isNonEmptyArray(operationEntities)) {
                    if (revisionRange.expectedTo == null) {
                        return Result.ok(undefined);
                    }
                    return Result.error(
                        'Some operations are not found. Maybe your request is too old, or ROOMHIST_COUNT is too small?'
                    );
                }
                if (revisionRange.expectedTo != null) {
                    const expectedOperationEntitiesLength =
                        revisionRange.expectedTo - revisionRange.from;
                    if (expectedOperationEntitiesLength < operationEntities.length) {
                        return Result.error(
                            'There are duplicate operations. Multiple apps tried to update same database simultaneously?'
                        );
                    }
                    if (expectedOperationEntitiesLength > operationEntities.length) {
                        return Result.error(
                            'Some operations are not found. Maybe your request is too old, or ROOMHIST_COUNT is too small?'
                        );
                    }
                }
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return Result.error(
                        'There are missing operations. Multiple apps tried to update same database simultaneously?'
                    );
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return Result.error(
                        'There are duplicate operations. Multiple apps tried to update same database simultaneously?'
                    );
                }

                const sortedOperationEntities = operationEntities.sort(
                    (x, y) => x.prevRevision - y.prevRevision
                );
                let operation: DownOperation | undefined =
                    sortedOperationEntities.length === 0
                        ? undefined
                        : downOperation(sortedOperationEntities[0]);

                let isFirst = false;
                for (const model of sortedOperationEntities) {
                    if (isFirst) {
                        isFirst = true;
                        continue;
                    }
                    const second = downOperation(model);
                    if (operation === undefined) {
                        operation = second;
                        continue;
                    }
                    const composed = composeDownOperation({ first: operation, second });
                    if (composed.isError) {
                        return composed;
                    }
                    operation = composed.value;
                }
                return Result.ok(operation);
            };
        }
    }

    export namespace Global {
        export namespace ToGraphQL {
            export const state = ({
                source,
                requestedBy,
            }: {
                source: State;
                requestedBy: RequestedBy;
            }): Omit<RoomGetState, 'revision' | 'createdBy'> => {
                return {
                    stateJson: stringifyState(toClientState(requestedBy)(source)),
                };
            };

            export const operation = ({
                prevState,
                nextState,
                requestedBy,
            }: {
                prevState: State;
                nextState: State;
                requestedBy: RequestedBy;
            }): string => {
                const prevClientState = toClientState(requestedBy)(prevState);
                const nextClientState = toClientState(requestedBy)(nextState);
                const diffOperation = diff({
                    prevState: prevClientState,
                    nextState: nextClientState,
                });
                const upOperation =
                    diffOperation == null ? undefined : toUpOperation(diffOperation);
                return stringifyUpOperation(upOperation ?? { $v: 2, $r: 1 });
            };
        }

        class EnsureParticipantEntity {
            private participantEntity: Participant | null = null;

            public constructor(
                private readonly em: EM,
                private readonly room: Room,
                private readonly participantKey: string
            ) {}

            public async get(): Promise<Participant> {
                if (this.participantEntity == null) {
                    this.participantEntity = await this.em.findOne(Participant, {
                        room: { id: this.room.id },
                        user: { userUid: this.participantKey },
                    });
                    if (this.participantEntity == null) {
                        const user = await this.em.findOne(User, { userUid: this.participantKey });
                        if (user == null) {
                            throw new Error(
                                `Tried to apply a Participant entity, but User was not found. roomId: ${this.room.id}, participantKey:${this.participantKey}`
                            );
                        }
                        this.participantEntity = new Participant();
                        this.room.participants.add(this.participantEntity);
                        user.participants.add(this.participantEntity);
                        this.em.persist(this.participantEntity);
                    }
                }
                return this.participantEntity;
            }
        }

        const maxJsonLength = 1_000_000;

        // prevStateにおけるDbStateの部分とtargetのJSONは等しい
        export const applyToEntity = async ({
            em,
            target,
            prevState,
            operation,
        }: {
            em: EM;
            target: Room;
            prevState: State;
            operation: TwoWayOperation;
        }) => {
            const nextState = apply({
                state: prevState,
                operation: toUpOperation(operation),
            });
            if (nextState.isError) {
                throw nextState.error;
            }

            // CONSIDER: サイズの大きいオブジェクトに対してJSON.stringifyするのは重い可能性。そもそももしJSON.stringifyが重いのであればio-tsのdecodeはより重くなりそう。
            target.name = nextState.value.name;
            const newValue = exactDbState(nextState.value);
            const newValueJson = JSON.stringify(newValue);
            if (newValueJson.length > maxJsonLength) {
                const oldValue = target.value;
                const oldValueJson = JSON.stringify(oldValue);
                if (oldValueJson.length < maxJsonLength) {
                    throw new Error('value size limit exceeded');
                }
            }
            target.value = newValue;
            const prevRevision = target.revision;
            target.revision += 1;

            await recordForEachAsync(
                operation.participants ?? {},
                async (participant, participantKey) => {
                    const ensureEntity = new EnsureParticipantEntity(em, target, participantKey);
                    if (participant.type === update) {
                        if (participant.update.name != null) {
                            (await ensureEntity.get()).name =
                                participant.update.name.newValue ?? undefined;
                        }
                        if (participant.update.role != null) {
                            (await ensureEntity.get()).role =
                                nullableStringToParticipantRoleType(
                                    participant.update.role.newValue
                                ) ?? undefined;
                        }
                        return;
                    }
                    if (participant.replace.newValue == null) {
                        em.remove(await ensureEntity.get());
                        return;
                    }
                    const newParticipant = await ensureEntity.get();
                    newParticipant.name = participant.replace.newValue.name ?? undefined;
                    newParticipant.role =
                        nullableStringToParticipantRoleType(participant.replace.newValue.role) ??
                        undefined;
                }
            );

            const op = new RoomOp({
                prevRevision,
                value: toDownOperation(operation),
            });
            op.room = Reference.create<Room>(target);

            em.persist(op);
            return nextState.value;
        };

        export const autoRemoveOldRoomOp = async ({
            em,
            room,
            roomHistCount,
        }: {
            em: EM;
            room: Room;
            roomHistCount: number | undefined;
        }) => {
            if (roomHistCount == null || roomHistCount < 0) {
                return;
            }
            const toRemove = await em.find(RoomOp, {
                room: { id: room.id },
                prevRevision: { $lt: room.revision - roomHistCount },
            });
            if (toRemove.length === 0) {
                return;
            }
            await room.roomOperations.init();
            for (const tr of toRemove) {
                em.remove(tr);
                room.roomOperations.remove(tr);
            }
        };
    }

    export namespace GraphQL {
        export namespace ToGlobal {
            export const upOperation = (source: RoomOperationInput): UpOperation => {
                return parseUpOperation(source.valueJson);
            };
        }
    }
}