import { replace } from './types';
import * as RoomConverter from '../../@shared/ot/room/converter';
import * as RoomModule from '../../@shared/ot/room/v1';
import { RoomGetStateFragment, RoomOperationFragment, RoomOperationInput } from '../../generated/graphql';
import * as ParticipantModule from '../../@shared/ot/room/participant/v1';
import * as BoardModule from '../../@shared/ot/room/participant/board/v1';
import * as CharacterModule from '../../@shared/ot/room/participant/character/v1';
import { RecordUpOperation } from '../../@shared/ot/room/util/recordOperation';
import { updateType } from '../../@shared/ot/room/participant/myNumberValue/log-v1';
import { recordForEach } from '../../@shared/utils';

export namespace Room {
    export const createState = (source: RoomGetStateFragment): RoomModule.State => {
        return RoomConverter.parseState(source.stateJson);
    };

    export const createGetOperation = (source: RoomOperationFragment): RoomModule.UpOperation => {
        return RoomConverter.parseUpOperation(source.valueJson);
    };

    export const createAddBoardsOperation = (source: Record<string, BoardModule.State>, userUid: string): RoomModule.UpOperation => {
        const boards: RecordUpOperation<BoardModule.State, BoardModule.UpOperation> = {};
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

        const participants: RecordUpOperation<ParticipantModule.State, ParticipantModule.UpOperation> = {
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

    export const createAddCharactersOperation = (source: Record<string, CharacterModule.State>, userUid: string): RoomModule.UpOperation => {
        const characters: RecordUpOperation<CharacterModule.State, CharacterModule.UpOperation> = {};
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

        const participants: RecordUpOperation<ParticipantModule.State, ParticipantModule.UpOperation> = {
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

    export const toGraphQLInput = (source: RoomModule.UpOperation, clientId: string): RoomOperationInput => {
        return {
            clientId,
            valueJson: RoomConverter.stringifyUpOperation(source),
        };
    };
}