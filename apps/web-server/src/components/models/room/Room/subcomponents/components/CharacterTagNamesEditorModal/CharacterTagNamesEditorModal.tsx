import * as Icons from '@ant-design/icons';
import { strIndex10Array } from '@flocon-trpg/core';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { useCharacterTagNames } from '../../hooks/useCharacterTagNames';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { flex, flexColumn, flexRow } from '@/styles/className';

export const characterTagNamesEditorVisibilityAtom = atom(false);

export const CharacterTagNamesEditorModal: React.FC = () => {
    const [editorVisibility, setEditorVisibility] = useAtom(characterTagNamesEditorVisibilityAtom);
    const setRoomState = useSetRoomStateWithImmer();

    const characterTagNames = useCharacterTagNames();

    return React.useMemo(() => {
        const inputs = strIndex10Array.map(index => {
            const characterTagName = characterTagNames?.[`characterTag${index}Name`];
            return (
                <div key={`tag${index}Input`} className={classNames(flex, flexRow)}>
                    <div style={{ width: 60 }}>{`タグ${index}`}</div>
                    <CollaborativeInput
                        style={{ width: 150 }}
                        size='small'
                        disabled={characterTagName == null}
                        value={characterTagName ?? ''}
                        bufferDuration='default'
                        onChange={({ currentValue }) => {
                            setRoomState(roomState => {
                                roomState[`characterTag${index}Name`] = currentValue;
                            });
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            setRoomState(roomState => {
                                roomState[`characterTag${index}Name`] =
                                    characterTagName == null ? '' : undefined;
                            });
                        }}
                    >
                        {characterTagName == null ? (
                            <Icons.PlusOutlined />
                        ) : (
                            <Icons.DeleteOutlined />
                        )}
                    </Button>
                </div>
            );
        });

        return (
            <Modal
                title='キャラクターのタグの追加・編集・削除'
                width={600}
                visible={editorVisibility}
                closable
                onCancel={() => setEditorVisibility(false)}
                footer={
                    <DialogFooter
                        close={{
                            textType: 'close',
                            onClick: () => setEditorVisibility(false),
                        }}
                    />
                }
            >
                <div className={classNames(flex, flexColumn)}>{inputs}</div>
            </Modal>
        );
    }, [characterTagNames, editorVisibility, setEditorVisibility, setRoomState]);
};
