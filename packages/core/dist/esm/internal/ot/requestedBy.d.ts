import * as Room from './flocon/room/types';
import { State } from './generator';
/** 全てのStateに完全にアクセスできる。*/
export declare const admin = "admin";
export declare const client = "client";
export declare const restrict = "restrict";
export type RequestedBy = {
    type: typeof admin;
} | {
    type: typeof client;
    userUid: string;
} | {
    type: typeof restrict;
};
export declare const anyValue: {
    readonly type: "anyValue";
};
export declare const none: {
    readonly type: "none";
};
export declare const isAuthorized: ({ requestedBy, participantId, }: {
    requestedBy: RequestedBy;
    participantId: string | typeof anyValue | typeof none;
}) => boolean;
export declare const isOwner: ({ requestedBy, ownerParticipantId, }: {
    requestedBy: RequestedBy;
    ownerParticipantId: string | typeof anyValue | typeof none;
}) => boolean;
export declare const isBoardOwner: ({ boardId, requestedBy, currentRoomState, }: {
    boardId: string;
    requestedBy: RequestedBy;
    currentRoomState: State<typeof Room.template>;
}) => boolean;
export declare const isBoardVisible: ({ boardId, requestedBy, currentRoomState, }: {
    boardId: string;
    requestedBy: RequestedBy;
    currentRoomState: State<typeof Room.template>;
}) => boolean;
export declare const isCharacterOwner: ({ requestedBy, characterId, currentRoomState, }: {
    requestedBy: RequestedBy;
    characterId: string | typeof anyValue | typeof none;
    currentRoomState: State<typeof Room.template>;
}) => boolean;
type CurrentOwnerParticipant = string | undefined | {
    ownerParticipantId: string | undefined;
};
export declare const canChangeOwnerParticipantId: ({ requestedBy, currentOwnerParticipant, }: {
    requestedBy: RequestedBy;
    currentOwnerParticipant: CurrentOwnerParticipant;
}) => boolean;
type CurrentOwnerCharacter = string | undefined | {
    ownerCharacterId: string | undefined;
};
export declare const canChangeOwnerCharacterId: ({ requestedBy, currentOwnerCharacter, currentRoomState, }: {
    requestedBy: RequestedBy;
    currentOwnerCharacter: CurrentOwnerCharacter;
    currentRoomState: State<typeof Room.template>;
}) => boolean;
export {};
//# sourceMappingURL=requestedBy.d.ts.map