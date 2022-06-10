import { Modal } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../../../ui/DialogFooter/DialogFooter';
import { close, create, ok, update } from '../../../../../../utils/constants';
import { useAtom } from 'jotai';
import { dicePieceValueEditorAtom } from '../../../../../../atoms/pieceValueEditor/pieceValueEditorAtom';
import { Subject } from 'rxjs';
import { CreateMode, DicePieceEditor, UpdateMode } from '../DicePieceEditor/DicePieceEditor';

export const DicePieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(dicePieceValueEditorAtom);
    const actionRequest = React.useMemo(() => new Subject<typeof ok | typeof close>(), []);

    // TODO: useStateEditorの性質上、useMemoでは不十分
    const {
        visible,
        createMode,
        updateMode,
    }: { visible: boolean; updateMode?: UpdateMode; createMode?: CreateMode } =
        React.useMemo(() => {
            switch (modalType?.type) {
                case undefined: {
                    return { visible: false };
                }
                case update: {
                    return {
                        visible: !modalType.closed,
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
