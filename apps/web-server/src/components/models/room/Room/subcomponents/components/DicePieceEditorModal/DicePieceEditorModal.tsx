import { Modal } from 'antd';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { Subject } from 'rxjs';
import useConstant from 'use-constant';
import { useMemoOne } from 'use-memo-one';
import { CreateMode, DicePieceEditor, UpdateMode } from '../DicePieceEditor/DicePieceEditor';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { close, create, ok, update } from '@/utils/constants';
import { PieceModalState } from '@/utils/types';

export const dicePieceModalAtom = atom<PieceModalState | null>(null);

export const DicePieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(dicePieceModalAtom);
    const actionRequest = useConstant(() => new Subject<typeof ok | typeof close>());

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

    return (
        <Modal
            title={modalType?.type === update ? 'ダイスコマの編集' : 'ダイスコマの新規作成'}
            visible={visible}
            closable
            onCancel={() => setModalType(null)}
            footer={
                <DialogFooter
                    close={{
                        textType: modalType?.type === update ? 'close' : 'cancel',
                        onClick: () => {
                            actionRequest.next(close);
                            setModalType(null);
                        },
                    }}
                    ok={{
                        textType: 'create',
                        onClick: () => {
                            actionRequest.next(ok);
                            setModalType(null);
                        },
                    }}
                />
            }
        >
            <DicePieceEditor
                createMode={createMode}
                updateMode={updateMode}
                actionRequest={actionRequest}
            />
        </Modal>
    );
};
