import { Modal } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { Subject } from 'rxjs';
import useConstant from 'use-constant';
import { useMemoOne } from 'use-memo-one';
import { CreateMode, ShapePieceEditor, UpdateMode } from '../ShapePieceEditor/ShapePieceEditor';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { close, create, ok, update } from '@/utils/constants';
import { PieceModalState } from '@/utils/types';

export const shapePieceModalAtom = atom<PieceModalState | null>(null);

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

export const ShapePieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(shapePieceModalAtom);
    const actionRequest = useConstant(() => new Subject<typeof ok | typeof close>());

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

    return (
        <Modal
            {...drawerBaseProps}
            title={modalType?.type == update ? '図形コマの編集' : '図形コマの新規作成'}
            open={visible}
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
            <ShapePieceEditor
                createMode={createMode}
                updateMode={updateMode}
                actionRequest={actionRequest}
            />
        </Modal>
    );
};
