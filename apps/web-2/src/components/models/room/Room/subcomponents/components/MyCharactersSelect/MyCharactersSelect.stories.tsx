import { loggerRef } from '@flocon-trpg/utils';
import React from 'react';
import { MyCharactersSelect } from './MyCharactersSelect';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { myRichCharacterId } from '@/mocks';
import { Meta, StoryObj } from '@storybook/react';

export const Default: React.FC<{
    characterIdMode: 'found' | 'notFound' | 'undefined';
    showAlert: boolean;
    readonly: boolean;
}> = ({ characterIdMode, showAlert, readonly }) => {
    const { roomClientContextValue } = useSetupStorybook({});

    let selectedCharacterId: string | undefined;
    switch (characterIdMode) {
        case 'found':
            selectedCharacterId = myRichCharacterId;
            break;
        case 'notFound':
            selectedCharacterId = 'character-id-not-found';
            break;
        case 'undefined':
            selectedCharacterId = undefined;
            break;
    }
    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <MyCharactersSelect
                selectedCharacterId={selectedCharacterId}
                showAlert={showAlert}
                readOnly={readonly}
                onSelect={value => loggerRef.info({ value }, 'onSelect')}
            />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/MyCharactersSelect',
    component: Default,
    args: {
        characterIdMode: 'found',
        readonly: false,
        showAlert: true,
    },
} satisfies Meta<typeof Default>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Readonly: Story = ({
    args: {
    readonly: true,
    }
});

export const NotFound: Story = ({
    args: {
    characterIdMode: 'notFound',
    }
});

export const Undefined: Story = ({
    args: {
    characterIdMode: 'undefined',
    }
});
