import { DrawerProps, Modal } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { close, create, ok, update } from '../../../../utils/constants';
import { useAtom } from 'jotai';
import { stringPieceValueEditorAtom } from '../../../../atoms/pieceValueEditor/pieceValueEditorAtom';
import { Subject } from 'rxjs';
import { CreateMode, StringPieceEditor, UpdateMode } from './StringPieceEditor';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

export const StringPieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(stringPieceValueEditorAtom);
    const actionRequest = React.useMemo(() => new Subject<typeof ok | typeof close>(), []);

    // TODO: useStateEditorの性質上、useMemoでは不十分
    const {
        visible,
        createMode,
        updateMode,
    }: { visible: boolean; createMode?: CreateMode; updateMode?: UpdateMode } =
        React.useMemo(() => {
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
            title={modalType?.type == update ? '文字列コマの編集' : '文字列コマの新規作成'}
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
            <StringPieceEditor
                createMode={createMode}
                updateMode={updateMode}
                actionRequest={actionRequest}
            />
        </Modal>
    );
};
