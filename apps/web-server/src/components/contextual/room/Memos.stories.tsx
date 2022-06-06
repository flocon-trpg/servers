import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Memos } from './Memos';
import { useMockRoom } from '../../../hooks/useMockRoom';
import { storybookAtom } from '../../../atoms/storybook/storybookAtom';
import { useSetAtom } from 'jotai';
import { createMockRoom } from '../../../mocks';
import { screen, userEvent } from '@storybook/testing-library';
import { delay } from '@flocon-trpg/utils';

const room = createMockRoom({
    myParticipantRole: 'Player',
    setCharacterTagNames: false,
    setPublicChannelNames: false,
    setCharacters: false,
    setParamNames: false,
});

export const Default: React.FC<{ width?: number }> = ({ width }) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {},
        });
    }, [setStorybook]);
    useMockRoom({ room });
    const [selectedMemoId, setSelectedMemoId] = React.useState<string>('');
    return (
        <div style={{ height: 200, width }}>
            <Memos selectedMemoId={selectedMemoId} onSelectedMemoIdChange={setSelectedMemoId} />
        </div>
    );
};

export default {
    title: 'Contextual/Room/Memo',
    component: Default,
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Create = Template.bind({});
Create.play = async () => {
    // すぐボタンをクリックしても反応しないようなので待っている。
    await delay(500);
    const button = screen.getByRole('button', { name: '新規作成' });
    userEvent.click(button);
};

export const Width400Create = Template.bind({});
Width400Create.args = {
    width: 400,
};
Width400Create.play = async () => {
    // すぐボタンをクリックしても反応しないようなので待っている。
    await delay(500);
    const button = screen.getByRole('button', { name: '新規作成' });
    userEvent.click(button);
};
