import { Modal, ModalProps } from 'antd';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
import { CreateMode, UpdateMode, useImagePieceEditor } from '../ImagePieceEditor/ImagePieceEditor';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { create, update } from '@/utils/constants';
import { PieceModalState } from '@/utils/types';

export const imagePieceModalAtom = atom<PieceModalState | null>(null);

const modalBaseProps: Partial<ModalProps> = {
    width: 600,
};

export const ImagePieceModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(imagePieceModalAtom);

    const {
        visible,
        createMode,
        updateMode,
    }: { visible: boolean; createMode?: CreateMode; updateMode?: UpdateMode } = useMemoOne(() => {
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
    const imagePieceEditor = useImagePieceEditor({ createMode, updateMode });

    return (
        <Modal
            {...modalBaseProps}
            title={modalType?.type == update ? '画像コマの編集' : '画像コマの新規作成'}
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
                            imagePieceEditor.ok();
                            setModalType(null);
                        },
                    }}
                />
            }
        >
            {imagePieceEditor.element}
        </Modal>
    );
};
