import { Modal } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { DrawerProps } from 'antd/lib/drawer';
import { PiecePositionWithCell } from '../../../../utils/types';
import { close, create, ok, update } from '../../../../utils/constants';
import { atom, useAtom } from 'jotai';
import { Subject } from 'rxjs';
import { ImagePieceEditor, Props } from './ImagePieceEditor';

type ImagePieceModalType =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PiecePositionWithCell;
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
    const actionRequest = React.useMemo(() => new Subject<typeof ok | typeof close>(), []);

    let visible: boolean;
    let props: Props;
    switch (modalType?.type) {
        case undefined: {
            visible = false;
            props = {
                type: undefined,
            };
            break;
        }
        case update: {
            visible = true;
            props = {
                type: update,
                actionRequest,
                boardId: modalType.boardId,
                pieceId: modalType.pieceId,
            };
            break;
        }
        case create: {
            visible = true;
            props = {
                type: create,
                actionRequest,
                boardId: modalType.boardId,
                piecePosition: modalType.piecePosition,
            };
            break;
        }
    }

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
            <ImagePieceEditor {...props} />
        </Modal>
    );
};
