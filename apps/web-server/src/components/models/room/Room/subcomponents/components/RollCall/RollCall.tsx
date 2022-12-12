import * as Icons from '@ant-design/icons';
import { Master, Player, State, getOpenRollCall, roomTemplate } from '@flocon-trpg/core';
import {
    AnswerRollCallDocument,
    CloseRollCallDocument,
    PerformRollCallDocument,
} from '@flocon-trpg/typed-document-node-v0.7.13';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { maxBy, sortBy } from 'lodash';
import React from 'react';
import { useInterval } from 'react-use';
import { useMutation } from 'urql';
import { useJoinParticipants } from '../../hooks/useJoinParticipants';
import { useRoomId } from '../../hooks/useRoomId';
import { prettyElapsed } from './prettyElapsed';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { Jdenticon } from '@/components/ui/Jdenticon/Jdenticon';
import { Table, TableHeader, TableRow } from '@/components/ui/Table/Table';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { flex, flexColumn, flexRow, itemsCenter } from '@/styles/className';

type RoomState = State<typeof roomTemplate>;
type RollCallsState = NonNullable<RoomState['rollCalls']>;
type RollCallState = NonNullable<RollCallsState[string]>;

type RollCallResultProps = {
    rollCallId: string;
    rollCall: RollCallState;
    /** 点呼が行われているかどうかを示します。`true` のときは AnswerRollCall を実行するボタンなどが有効化されます。 */
    isOpen: boolean;
    tableHeader: string;
};

const RollCallResult: React.FC<RollCallResultProps> = ({
    rollCall,
    rollCallId,
    isOpen,
    tableHeader,
}) => {
    const myUserUid = useMyUserUid();
    const participants = useJoinParticipants(rollCall.participants);
    const [answerRollCallResult, answerRollCall] = useMutation(AnswerRollCallDocument);
    const roomId = useRoomId();

    const joined = React.useMemo(() => {
        return [...participants].flatMap(([key, value]) => {
            if (!value.hasParticipant) {
                return [];
            }
            switch (value.participant.role) {
                case Master:
                case Player:
                    break;
                default:
                    return [];
            }
            const answeredAt = value.recordValue?.answeredAt;
            return [
                {
                    isMe: key === myUserUid,
                    userUid: key,
                    participantName: value.participant.name,
                    answered: answeredAt == null ? undefined : new Date(answeredAt),
                },
            ];
        });
    }, [myUserUid, participants]);

    const participantsElementContent = React.useMemo(() => {
        return sortBy(joined, [p => p.participantName, p => p.userUid]).map(p => {
            const checked = p.answered != null;
            const checkbox = checked ? <Icons.CheckOutlined /> : <Icons.CloseOutlined />;
            let button: JSX.Element | null;
            if (isOpen && p.isMe) {
                button = (
                    <Button
                        style={{ marginLeft: 4 }}
                        size='small'
                        type={checked ? undefined : 'primary'}
                        onClick={() => {
                            answerRollCall({
                                answer: !checked,
                                roomId,
                                rollCallId: rollCallId,
                            });
                        }}
                        disabled={answerRollCallResult.fetching}
                    >
                        {checked ? '返事を解除' : '返事する'}
                    </Button>
                );
            } else {
                button = null;
            }

            return (
                <div
                    style={{ height: 22 }}
                    key={keyNames('ActiveRollCall.Participant', p.userUid)}
                    className={classNames(flex, flexRow, itemsCenter)}
                >
                    <div style={{ width: 16 }}>{checkbox}</div>
                    <Jdenticon
                        hashOrValue={p.userUid}
                        size={16}
                        tooltipMode={{ type: 'userUid', userName: p.participantName }}
                    />
                    <div>{p.participantName ?? '(不明な名前)'}</div>
                    {button}
                </div>
            );
        });
    }, [answerRollCall, answerRollCallResult.fetching, isOpen, joined, rollCallId, roomId]);

    const participantsElement = (
        <div className={classNames(flex, flexColumn)}>{participantsElementContent}</div>
    );
    const getCreatedAtText = () => {
        return `${dayjs(rollCall.createdAt).format('YYYY/MM/DD HH:mm:ss')} (${prettyElapsed(
            rollCall.createdAt,
            { customizeMilliseconds: i => i - (i % 10_000) }
        )})`;
    };
    const [elapesedText, setElapsedText] = React.useState<string>(getCreatedAtText());
    useInterval(() => {
        setElapsedText(getCreatedAtText());
    }, 5_000);

    return (
        <Table>
            <TableHeader>{tableHeader}</TableHeader>
            <TableRow label='開始日時'>{elapesedText}</TableRow>
            <TableRow label='返事した人数'>{`${joined
                .filter(p => p.answered != null)
                .reduce(seed => seed + 1, 0)} / ${joined.length}`}</TableRow>
            <TableRow label='返事の状況'>{participantsElement}</TableRow>
        </Table>
    );
};

const HasOpenRollCall: React.FC<{ rollCall: RollCallState; rollCallId: string }> = ({
    rollCall,
    rollCallId,
}) => {
    const roomId = useRoomId();
    const [closeRollCallResult, closeRollCall] = useMutation(CloseRollCallDocument);
    const disableClose = closeRollCallResult.fetching;
    const [showModal, setShowModal] = React.useState(false);

    return (
        <div>
            <div style={{ marginBottom: 12 }} className={classNames(flex, flexRow, itemsCenter)}>
                <strong>{'点呼が行われています。'}</strong>
                <Button
                    onClick={() => {
                        setShowModal(true);
                    }}
                    disabled={disableClose}
                >
                    点呼を終了
                </Button>
            </div>
            <RollCallResult
                rollCall={rollCall}
                rollCallId={rollCallId}
                isOpen
                tableHeader='点呼の状況'
            />
            <Modal
                open={showModal}
                closable
                onCancel={() => setShowModal(false)}
                footer={
                    <DialogFooter
                        destroy={{
                            textType: 'end',
                            onClick: () => {
                                closeRollCall({ roomId, rollCallId });
                                () => setShowModal(false);
                            },
                            disabled: disableClose,
                        }}
                        close={{ textType: 'cancel', onClick: () => setShowModal(false) }}
                    />
                }
            >
                {'現在行われている点呼を終了します。よろしいですか？'}
            </Modal>
        </div>
    );
};

const NoOpenRollCall: React.FC = () => {
    const roomId = useRoomId();
    const [startRollCallResult, startRollCall] = useMutation(PerformRollCallDocument);
    const rollCalls = useRoomStateValueSelector(state => state.rollCalls);
    const latestRollCall = React.useMemo(() => {
        return maxBy(recordToArray(rollCalls ?? {}), r => r.value.createdAt);
    }, [rollCalls]);

    return (
        <div>
            <div style={{ marginBottom: 12 }} className={classNames(flex, flexRow, itemsCenter)}>
                {'現在行われている点呼はありません。'}
                <Button
                    onClick={() => {
                        startRollCall({ roomId });
                    }}
                    type='primary'
                    disabled={startRollCallResult.fetching}
                >
                    点呼を開始
                </Button>
            </div>
            {latestRollCall && (
                <RollCallResult
                    rollCall={latestRollCall.value}
                    rollCallId={latestRollCall.key}
                    isOpen={false}
                    tableHeader='最後に行われた点呼の結果'
                />
            )}
        </div>
    );
};

export type Props = {
    rollCalls: RollCallsState;
};

export const RollCall: React.FC<Props> = ({ rollCalls }) => {
    const openRollCall = React.useMemo(() => getOpenRollCall(rollCalls), [rollCalls]);
    if (openRollCall == null) {
        return <NoOpenRollCall />;
    }
    return <HasOpenRollCall rollCallId={openRollCall.key} rollCall={openRollCall.value} />;
};
