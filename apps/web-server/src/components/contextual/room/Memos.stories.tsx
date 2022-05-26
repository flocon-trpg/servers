import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { Memos } from './Memos';
import { useRoomStub } from '../../../hooks/useRoomStub';
import { storybookAtom } from '../../../atoms/storybook/storybookAtom';
import { useSetAtom } from 'jotai';
import { generateRoomData } from '../../../stubObject';

const room = generateRoomData({
    myParticipantRole: 'Player',
    setCharacterTagNames: false,
    setPublicChannelNames: false,
});

export const Default: React.FC = () => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {},
        });
    }, [setStorybook]);
    useRoomStub({ room });
    const [selectedMemoId, setSelectedMemoId] = React.useState<string>('');
    return <Memos selectedMemoId={selectedMemoId} onSelectedMemoIdChange={setSelectedMemoId} />;
};

export default {
    title: 'Contextual/Room/Memo',
    component: Default,
} as ComponentMeta<typeof Default>;
