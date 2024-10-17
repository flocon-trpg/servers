import React from 'react';
import { RoomClientContext } from '@/contexts/RoomClientContext';

export const useRoomClient = () => {
    const result = React.useContext(RoomClientContext);
    if (result == null) {
        throw new Error('RoomClientContext is not set.');
    }
    return result;
};

export const useTryRoomClient = () => {
    return React.useContext(RoomClientContext);
};
