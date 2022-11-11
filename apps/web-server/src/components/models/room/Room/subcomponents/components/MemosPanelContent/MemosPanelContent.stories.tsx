import { ComponentMeta } from '@storybook/react';
import React from 'react';
import { MemosPanelContent } from './MemosPanelContent';
import { useSetupMocks } from '@/hooks/useSetupMocks';

export const Default: React.FC<{ width?: number }> = ({ width }) => {
    const { isInitialized } = useSetupMocks({
        roomConfig: {
            myParticipantRole: 'Player',
            setCharacterTagNames: false,
            setPublicChannelNames: false,
            setBoards: false,
            setCharacters: false,
            setParamNames: false,
        },
    });
    const [selectedMemoId, setSelectedMemoId] = React.useState<string>('');
    if (!isInitialized) {
        return <div />;
    }
    return (
        <div style={{ height: 200, width }}>
            <MemosPanelContent
                selectedMemoId={selectedMemoId}
                onSelectedMemoIdChange={setSelectedMemoId}
            />
        </div>
    );
};

export default {
    title: 'models/room/Room/MemosPanelContent',
    component: Default,
} as ComponentMeta<typeof Default>;
