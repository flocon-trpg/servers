import { replace } from './types';
import { RoomGetStateFragment, RoomOperationFragment, RoomOperationInput } from '../../generated/graphql';
import { BoardState, BoardUpOperation, CharacterState, CharacterUpOperation, parseState, parseUpOperation, ParticipantState, ParticipantUpOperation, RecordUpOperation, State, stringifyUpOperation, updateType, UpOperation } from '@kizahasi/flocon-core';
import { recordForEach } from '@kizahasi/util';

export namespace Room {
    export const createState = (source: RoomGetStateFragment): State => {
        return parseState(source.stateJson);
    };

    export const createGetOperation = (source: RoomOperationFragment): UpOperation => {
        return parseUpOperation(source.valueJson);
    };

    export const createAddBoardsOperation = (source: Record<string, BoardState>, userUid: string): UpOperation => {
        const boards: RecordUpOperation<BoardState, BoardUpOperation> = {};
        recordForEach(source, (value, key) => {
            if (value == null) {
                return;
            }
            boards[key] = {
                type: replace,
                replace: {
                    newValue: value,
                },
            };
        });

        const participants: RecordUpOperation<ParticipantState, ParticipantUpOperation> = {
            [userUid]: {
                type: updateType,
                update: {
                    $version: 1,
                    boards,
                },
            }
        };

        return {
            $version: 1,
            participants,
        };
    };

    export const createAddCharactersOperation = (source: Record<string, CharacterState>, userUid: string): UpOperation => {
        const characters: RecordUpOperation<CharacterState, CharacterUpOperation> = {};
        recordForEach(source, (value, key) => {
            if (value == null) {
                return;
            }
            characters[key] = {
                type: replace,
                replace: {
                    newValue: value,
                },
            };
        });

        const participants: RecordUpOperation<ParticipantState, ParticipantUpOperation> = {
            [userUid]: {
                type: updateType,
                update: {
                    $version: 1,
                    characters,
                },
            }
        };

        return {
            $version: 1,
            participants,
        };
    };

    export const toGraphQLInput = (source: UpOperation, clientId: string): RoomOperationInput => {
        return {
            clientId,
            valueJson: stringifyUpOperation(source),
        };
    };
}