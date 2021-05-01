import React from 'react';
import { Table } from 'antd';
import { __ } from '../../@shared/collection';
import { ParticipantRole } from '../../generated/graphql';
import Jdenticon from '../../foundations/Jdenticon';
import { Participant } from '../../stateManagers/states/participant';
import { RoomConnectionsResult } from '../../hooks/useRoomConnections';

type Props = {
    participants: ReadonlyMap<string, Participant.State>;
    roomConnections: RoomConnectionsResult;
}

type DataSource = {
    key: string;
    participant: {
        userUid: string;
        state: Participant.State;
        isConnected: string;
    };
}

const ParticipantList: React.FC<Props> = ({ participants, roomConnections }: Props) => {
    const dataSource: DataSource[] =
        React.useMemo(() => [...participants].map(([key, participant]) => {
            const connection = roomConnections[key];
            return {
                key, // antdのtableのkeyとして必要
                participant: {
                    userUid: key,
                    state: participant,
                    isConnected: connection?.isConnected === true ? '接続' : '未接続',
                },
            };
        }), [participants, roomConnections]);

    const columns = __([
        {
            title: '',
            key: 'identicon',
            width: 30,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => (
                <Jdenticon hashOrValue={participant.userUid} size={24} tooltipMode={{ type: 'userUid', userName: participant.state.name }} />),
        },
        {
            title: '名前',
            key: '名前',
            width: 80,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => (
                <span>{participant.state.name}</span>)
        },
        {
            title: 'ロール',
            key: 'ロール',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => {
                switch (participant.state.role) {
                    case ParticipantRole.Master:
                        return '参加者（マスター）';
                    case ParticipantRole.Player:
                        return '参加者';
                    case ParticipantRole.Spectator:
                        return '観戦者';
                    case undefined:
                        return '退室済み';
                }
            },
        },
        {
            title: '接続状態',
            key: '接続状態',
            dataIndex: ['participant', 'isConnected'],
        },
    ]).compact(x => x).toArray();

    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size='small' pagination={false} />
        </div>);
};

export default ParticipantList;