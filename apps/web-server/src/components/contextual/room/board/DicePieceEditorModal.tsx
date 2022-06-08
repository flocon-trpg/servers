import { Modal } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { close, create, ok, update } from '../../../../utils/constants';
import { useAtom } from 'jotai';
import { dicePieceValueEditorAtom } from '../../../../atoms/pieceValueEditor/pieceValueEditorAtom';
import { Subject } from 'rxjs';
import { DicePieceEditor, Props } from './DicePieceEditor';

export const DicePieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(dicePieceValueEditorAtom);
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
            visible = !modalType.closed;
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
            <DicePieceEditor {...props} />
        </Modal>
    );
};
