import { Select } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';
import { useMyBoards } from '../../../../../hooks/useMyBoards';
import { useSetRoomStateByApply } from '@/hooks/useSetRoomStateByApply';
import { cancelRnd } from '@/styles/className';

type Props = {
    visible: boolean;
    onComplete: () => void;
};

type SelectedBoardKey =
    | {
          delete: true;
      }
    | {
          delete: false;
          boardId: string;
      };

export const ActiveBoardSelectorModal: React.FC<Props> = ({ visible, onComplete }: Props) => {
    const myBoards = useMyBoards();
    const operate = useSetRoomStateByApply();
    const [selectedBoardKey, setSelectedBoardKey] = React.useState<SelectedBoardKey | undefined>(
        undefined
    );
    const options = React.useMemo(() => {
        if (myBoards == null) {
            return [];
        }
        return [...myBoards]
            .sort(([, x], [, y]) => x.name.localeCompare(y.name))
            .map(([key, value]) => {
                return (
                    <Select.Option key={key} value={key}>
                        {value.name}
                    </Select.Option>
                );
            });
    }, [myBoards]);

    const hasSelectedBoardKey: boolean =
        selectedBoardKey?.delete === false
            ? myBoards?.has(selectedBoardKey.boardId) === true
            : false;

    const onOk = () => {
        if (selectedBoardKey == null) {
            return;
        }
        if (selectedBoardKey.delete) {
            operate({
                $v: 2,
                $r: 1,
                activeBoardId: {
                    newValue: undefined,
                },
            });
            onComplete();
            setSelectedBoardKey(undefined);
            return;
        }
        operate({
            $v: 2,
            $r: 1,
            activeBoardId: {
                newValue: selectedBoardKey.boardId,
            },
        });
        onComplete();
        setSelectedBoardKey(undefined);
    };

    return (
        <Modal
            visible={visible}
            title='ボードビュアーに表示させるボードの変更'
            onOk={onOk}
            okButtonProps={
                hasSelectedBoardKey || selectedBoardKey?.delete === true
                    ? undefined
                    : { disabled: true }
            }
            onCancel={() => {
                onComplete();
            }}
        >
            <div>
                <div>
                    {
                        'ボードビュアーに表示させるボードを変更もしくはクリアできます。他の参加者が作成したボードを選択することはできません。ボードビュアーに表示されているボードは全参加者が閲覧、編集できます。'
                    }
                </div>
                <Select
                    style={{ minWidth: 150 }}
                    autoFocus
                    onChange={newValue => {
                        if (newValue === '$$delete') {
                            setSelectedBoardKey({ delete: true });
                            return;
                        }
                        if (newValue == null) {
                            setSelectedBoardKey(undefined);
                            return;
                        }
                        setSelectedBoardKey({ delete: false, boardId: newValue.toString() });
                    }}
                >
                    <Select.Option value='$$delete'>クリアする</Select.Option>
                    <Select.OptGroup label='ボード一覧'>{options}</Select.OptGroup>
                </Select>
            </div>
        </Modal>
    );
};
