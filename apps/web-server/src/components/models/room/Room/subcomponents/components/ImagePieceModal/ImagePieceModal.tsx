import { Modal } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../../../../ui/DialogFooter/DialogFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { close, create, ok, update } from '../../../../../../../utils/constants';
import { atom, useAtom } from 'jotai';
import { Subject } from 'rxjs';
import { CreateMode, ImagePieceEditor, UpdateMode } from '../ImagePieceEditor/ImagePieceEditor';
import { PixelPosition } from '../../utils/positionAndSizeAndRect';
import { usePersistentMemo } from '../../../../../../../hooks/usePersistentMemo';
import useConstant from 'use-constant';

type ImagePieceModalType =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PixelPosition;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      };

export const imagePieceModalAtom = atom<ImagePieceModalType | null>(null);

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

export const ImagePieceModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(imagePieceModalAtom);
    const actionRequest = useConstant(() => new Subject<typeof ok | typeof close>());

    const {
        visible,
        createMode,
        updateMode,
    }: { visible: boolean; createMode?: CreateMode; updateMode?: UpdateMode } =
        usePersistentMemo(() => {
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
            title={modalType?.type == update ? '画像コマの編集' : '画像コマの新規作成'}
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
            <ImagePieceEditor
                createMode={createMode}
                updateMode={updateMode}
                actionRequest={actionRequest}
            />
        </Modal>
    );
};
