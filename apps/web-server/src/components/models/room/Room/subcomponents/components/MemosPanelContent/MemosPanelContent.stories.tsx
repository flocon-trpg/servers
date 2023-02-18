import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { MemosPanelContent } from './MemosPanelContent';
import { RoomClientContext } from '@/contexts/RoomClientContext';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';

export const Default: React.FC<{ width?: number }> = ({ width }) => {
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole: 'Player',
            setCharacterTagNames: false,
            setPublicChannelNames: false,
            setBoards: false,
            setCharacters: false,
            setParamNames: false,
        },
    });
    const [selectedMemoId, setSelectedMemoId] = React.useState<string>('');
    return (
        <div style={{ height: 200, width }}>
            <RoomClientContext.Provider value={roomClientContextValue}>
                <MemosPanelContent
                    selectedMemoId={selectedMemoId}
                    onSelectedMemoIdChange={setSelectedMemoId}
                />
            </RoomClientContext.Provider>
        </div>
    );
};

export default {
    title: 'models/room/Room/MemosPanelContent',
    component: Default,
} as ComponentMeta<typeof Default>;
