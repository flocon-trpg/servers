import { ParticipantRole } from '@flocon-trpg/core';
import { Meta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { DeckTemplateEditor, Props } from './DeckTemplateEditor';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { defaultBoardId, myRichCharacterId } from '@/mocks';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const [state, setState] = React.useState<Props['value']>({
        $v: 1,
        $r: 1,
        name: 'デッキテンプレート',
        back: {
            type: 'FilePath',
            $v: 1,
            $r: 1,
            filePath: {
                $v: 1,
                $r: 1,
                sourceType: 'Default',
                path: 'https://placehold.jp/3d4070/ffffff/120x150.png?text=back',
            },
        },
        description: 'デッキテンプレートの説明文',
        cards: {
            card0id: {
                $v: 1,
                $r: 1,
                $index: 0,
                face: {
                    type: 'FilePath',
                    $v: 1,
                    $r: 1,
                    filePath: {
                        $v: 1,
                        $r: 1,
                        sourceType: 'Default',
                        path: 'https://placehold.jp/3d4070/ffffff/120x150.png?text=face1',
                    },
                },
                back: undefined,
                name: 'カード1',
                description: 'カード1の説明文',
            },
        },
    });

    return <DeckTemplateEditor value={state} onChange={setState} />;
};

export default {
    title: 'models/deckTemplateEditor/DeckTemplateEditor',
    component: Player,
    args: {
        myParticipantRole: 'Player',
        characterStateId: myRichCharacterId,
    },
} as Meta<typeof Player>;
