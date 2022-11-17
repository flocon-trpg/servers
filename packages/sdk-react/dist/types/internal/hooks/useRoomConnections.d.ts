import { RoomClient } from '@flocon-trpg/sdk';
export declare const useRoomConnections: (roomClient: Pick<RoomClient<any, any>, 'roomConnections'>) => {
    current: ReadonlyMap<string, import("@flocon-trpg/sdk/dist/types/internal/roomClient/roomConnections").RoomConnectionStatus>;
    diff: import("@flocon-trpg/sdk/dist/types/internal/roomClient/roomConnections").RoomConnectionStatusDiff | null;
};
//# sourceMappingURL=useRoomConnections.d.ts.map