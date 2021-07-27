import React from 'react';
import { Modal } from 'antd';
import { useCharacter } from '../../hooks/state/useCharacter';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import {
    characterDiff,
    CharacterState,
    update,
    UpOperation,
    toCharacterUpOperation,
} from '@kizahasi/flocon-core';
import { useDispatch } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';
import { ChatPaletteTomlInput } from '../../components/ChatPaletteTomlInput';

export const ChatPaletteEditorModal: React.FC = () => {
    const modalWidth = 10000;

    const operate = useOperate();
    const dispatch = useDispatch();
    const chatPaletteEditorModalType = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.chatPaletteEditorModalType
    );
    const character = useCharacter(chatPaletteEditorModalType?.characterKey);

    if (chatPaletteEditorModalType == null || character == null) {
        return <Modal width={modalWidth} visible={false} />;
    }

    const updateCharacter = (partialState: Partial<CharacterState>) => {
        const diffOperation = characterDiff({
            prevState: character,
            nextState: { ...character, ...partialState },
        });
        if (diffOperation == null) {
            return;
        }
        const operation: UpOperation = {
            $version: 1,
            characters: {
                [chatPaletteEditorModalType.characterKey.createdBy]: {
                    [chatPaletteEditorModalType.characterKey.id]: {
                        type: update,
                        update: toCharacterUpOperation(diffOperation),
                    },
                },
            },
        };
        operate(operation);
        return;
    };

    const close = () => {
        dispatch(
            roomDrawerAndPopoverAndModalModule.actions.set({ chatPaletteEditorModalType: null })
        );
    };

    return (
        <Modal
            width={modalWidth}
            visible
            okButtonProps={{ style: { display: 'none' } }}
            cancelText='閉じる'
            onOk={() => close()}
            onCancel={() => close()}
            title="チャットパレット"
        >
            <ChatPaletteTomlInput
                size="small"
                bufferDuration="default"
                value={character.chatPalette ?? ''}
                rows={30}
                onChange={e => updateCharacter({ chatPalette: e.currentValue })}
            />
        </Modal>
    );
};
