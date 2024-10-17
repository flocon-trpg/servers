import { Modal } from 'antd';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { CreateMode, UpdateMode, useDicePieceEditor } from '../DicePieceEditor/DicePieceEditor';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { create, update } from '@/utils/constants';
import { PieceModalState } from '@/utils/types';

export const dicePieceModalAtom = atom<PieceModalState | null>(null);

export const DicePieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(dicePieceModalAtom);

    const {
        visible,
        createMode,
        updateMode,
    }: { visible: boolean; updateMode?: UpdateMode; createMode?: CreateMode } = useMemoOne(() => {
        switch (modalType?.type) {
            case undefined: {
                return { visible: false };
            }
            case update: {
                return {
                    visible: true,
                    updateMode: {
                        boardId: modalType.boardId,
                        pieceId: modalType.pieceId,
                    },
                };
            }
            case create: {
                return {
                    visible: true,
                    createMode: {
                        boardId: modalType.boardId,
                        piecePosition: modalType.piecePosition,
                    },
                };
            }
        }
    }, [modalType]);

    const dicePieceEditor = useDicePieceEditor({ createMode, updateMode });

    return (
        <Modal
            title={modalType?.type === update ? 'ダイスコマの編集' : 'ダイスコマの新規作成'}
            open={visible}
            closable
            onCancel={() => setModalType(null)}
            footer={
                <DialogFooter
                    close={{
                        textType: modalType?.type === update ? 'close' : 'cancel',
                        onClick: () => {
                            setModalType(null);
                        },
                    }}
                    ok={{
                        textType: 'create',
                        onClick: () => {
                            dicePieceEditor.ok();
                            setModalType(null);
                        },
                        disabled: !dicePieceEditor.canOk,
                    }}
                />
            }
        >
            {dicePieceEditor.element}
        </Modal>
    );
};
