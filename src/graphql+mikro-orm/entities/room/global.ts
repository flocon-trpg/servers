import * as t from 'io-ts';
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
} from '@kizahasi/flocon-core';

type IsSequentialResult<T> =
    | {
          type: 'DuplicateElement';
      }
    | {
          type: 'EmptyArray';
      }
    | {
          type: 'Sequential';
          minIndex: number;
          maxIndex: number;
      }
    | {
          type: 'NotSequential';
          minIndex: number;
          maxIndex: number;
          takeUntilSequential: { index: number; value: T }[];
      };

const isSequential = <T>(array: T[], getIndex: (elem: T) => number): IsSequentialResult<T> => {
    const sorted = array
        .map(value => ({ index: getIndex(value), value }))
        .sort((x, y) => x.index - y.index);
    if (sorted.length === 0) {
        return { type: 'EmptyArray' };
    }
    const takeUntilSequential: { index: number; value: T }[] = [];
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
                    maxIndex,
                    takeUntilSequential,
                };
            }
        }
        maxIndex = elem.index;
        previousElement = elem;
        takeUntilSequential.push(elem);
    }
    return {
        type: 'Sequential',
        minIndex,
        maxIndex,
    };
};

export namespace GlobalRoom {
    export namespace MikroORM {
        export namespace ToGlobal {
            export const state = (entity: Room): State => {
                const result = decodeDbState(entity.value);
                return { ...result, createdBy: entity.createdBy, name: entity.name };
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
                const operationEntities = await em.find(RoomOp, {
                    room: { id: roomId },
                    prevRevision: { $gte: revisionRange.from },
                });
                const isSequentialResult = isSequential(operationEntities, o => o.prevRevision);
                if (isSequentialResult.type === 'NotSequential') {
                    return Result.error(
                        'Database error. There are missing operations. Multiple server apps edit same database simultaneously?'
                    );
                }
                if (isSequentialResult.type === 'DuplicateElement') {
                    return Result.error(
                        'Database error. There are duplicate operations. Multiple server apps edit same database simultaneously?'
                    );
                }
                if (isSequentialResult.type === 'EmptyArray') {
                    return Result.ok(undefined);
                }
                if (isSequentialResult.minIndex !== revisionRange.from) {
                    return Result.error('revision out of range(too small)');
                }
                if (revisionRange.expectedTo !== undefined) {
                    if (isSequentialResult.maxIndex !== revisionRange.expectedTo - 1) {
                        return Result.error(
                            'Database error. Revision of latest operation is not same as revision of state. Multiple server apps edit same database simultaneously?'
                        );
                    }
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
                return stringifyUpOperation(upOperation ?? { $version: 1 });
            };
        }

        // prevStateとtargetのJSONは等しい
        export const applyToEntity = ({
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
            target.name = nextState.value.name;
            target.value = exactDbState(nextState.value);
            const prevRevision = target.revision;
            target.revision += 1;
            const op = new RoomOp({
                prevRevision,
                value: toDownOperation(operation),
            });
            op.room = Reference.create<Room>(target);

            em.persist(op);
            return nextState.value;
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
