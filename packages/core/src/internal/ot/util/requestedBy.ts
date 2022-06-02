import { State } from '../generator';
import * as Room from '../flocon/room/types';

/** 全てのStateに完全にアクセスできる。*/
export const admin = 'admin';

/* userUidに基づき、一部のStateへのアクセスを制限する。*/
export const client = 'client';

/* アクセス制限のあるStateへのアクセスを全て制限する。*/
export const restrict = 'restrict';

export type RequestedBy =
    | {
          type: typeof admin;
      }
    | {
          type: typeof client;
          userUid: string;
      }
    | {
          type: typeof restrict;
      };

export const anyValue = { type: 'anyValue' } as const;
export const none = { type: 'none' } as const;

export const isOwner = ({
    requestedBy,
    ownerParticipantId,
}: {
    requestedBy: RequestedBy;
    ownerParticipantId: string | typeof anyValue | typeof none;
}): boolean => {
    if (typeof ownerParticipantId === 'string' || ownerParticipantId.type === 'none') {
        if (requestedBy.type === admin) {
            return true;
        }
        if (requestedBy.type === restrict) {
            return false;
        }
        return requestedBy.userUid === ownerParticipantId;
    }
    return true;
};

export const isBoardOwner = ({
    boardId,
    requestedBy,
    currentRoomState,
}: {
    boardId: string;
    requestedBy: RequestedBy;
    currentRoomState: State<typeof Room.template>;
}): boolean => {
    if (requestedBy.type === admin) {
        return true;
    }
    const userUid = requestedBy.type === client ? requestedBy.userUid : undefined;

    const board = (currentRoomState.boards ?? {})[boardId];
    if (board != null) {
        if (board.ownerParticipantId == null) {
            return true;
        }
        if (board.ownerParticipantId === userUid) {
            return true;
        }
        return false;
    }

    return false;
};

export const isBoardVisible = ({
    boardId,
    requestedBy,
    currentRoomState,
}: {
    boardId: string;
    requestedBy: RequestedBy;
    currentRoomState: State<typeof Room.template>;
}): boolean => {
    if (isBoardOwner({ boardId: boardId, requestedBy, currentRoomState }) !== false) {
        return true;
    }
    return currentRoomState.activeBoardId === boardId;
};

export const isCharacterOwner = ({
    requestedBy,
    characterId,
    currentRoomState,
}: {
    requestedBy: RequestedBy;
    characterId: string | typeof anyValue | typeof none;
    currentRoomState: State<typeof Room.template>;
}): boolean => {
    if (requestedBy.type === admin) {
        return true;
    }
    if (typeof characterId !== 'string') {
        return characterId.type === 'anyValue';
    }
    const userUid = requestedBy.type === client ? requestedBy.userUid : undefined;

    const character = (currentRoomState.characters ?? {})[characterId];
    if (character != null) {
        if (character.ownerParticipantId == null) {
            return true;
        }
        if (character.ownerParticipantId === userUid) {
            return true;
        }
        return false;
    }

    return false;
};

type CurrentOwnerParticipant =
    // ParticipantのIDで指定するパターン
    | string
    | undefined
    // currentStateを渡すパターン
    | {
          ownerParticipantId: string | undefined;
      };

export const canChangeOwnerParticipantId = ({
    requestedBy,
    currentOwnerParticipant,
}: {
    requestedBy: RequestedBy;
    currentOwnerParticipant: CurrentOwnerParticipant;
}): boolean => {
    if (requestedBy.type === admin) {
        return true;
    }
    let currentOwnerParticipantId: string | undefined;
    if (typeof currentOwnerParticipant === 'string') {
        currentOwnerParticipantId = currentOwnerParticipant;
    } else {
        currentOwnerParticipantId = currentOwnerParticipant?.ownerParticipantId;
    }
    return isOwner({ requestedBy, ownerParticipantId: currentOwnerParticipantId ?? anyValue });
};

type CurrentOwnerCharacter =
    // CharacterのIDで指定するパターン
    | string
    | undefined
    // currentStateを渡すパターン
    | {
          ownerCharacterId: string | undefined;
      };

export const canChangeOwnerCharacterId = ({
    requestedBy,
    currentOwnerCharacter,
    currentRoomState,
}: {
    requestedBy: RequestedBy;
    currentOwnerCharacter: CurrentOwnerCharacter;
    currentRoomState: State<typeof Room.template>;
}): boolean => {
    if (requestedBy.type === admin) {
        return true;
    }
    let currentOwnerCharacterId: string | undefined;
    if (typeof currentOwnerCharacter === 'string') {
        currentOwnerCharacterId = currentOwnerCharacter;
    } else {
        currentOwnerCharacterId = currentOwnerCharacter?.ownerCharacterId;
    }
    return isCharacterOwner({
        requestedBy,
        characterId: currentOwnerCharacterId ?? anyValue,
        currentRoomState,
    });
};
