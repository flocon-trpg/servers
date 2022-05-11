import { Button, Modal } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { BufferedInput } from '../../../ui/BufferedInput';
import { strIndex10Array } from '@flocon-trpg/core';
import classNames from 'classnames';
import { flex, flexColumn, flexRow } from '../../../../utils/className';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { atom, useAtom } from 'jotai';
import { useCharacterTagNames } from '../../../../hooks/state/useCharacterTagNames';
import * as Icons from '@ant-design/icons';

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
                    <BufferedInput
                        style={{ width: 150 }}
                        size='small'
                        readOnly={characterTagName == null}
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
