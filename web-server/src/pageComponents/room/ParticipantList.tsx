import React from 'react';
import { Table } from 'antd';
import { ParticipantRole } from '../../generated/graphql';
import { Jdenticon } from '../../components/Jdenticon';
import { useRoomConnections } from '../../hooks/useRoomConnections';
import { useParticipants } from '../../hooks/state/useParticipants';
import { ParticipantState } from '@kizahasi/flocon-core';
import _ from 'lodash';
import { useMyUserUid } from '../../hooks/useMyUserUid';

type DataSource = {
    key: string;
    participant: {
        userUid: string;
        state: ParticipantState;
        isConnected: string;
    };
};

export const ParticipantList: React.FC = () => {
    const roomConnections = useRoomConnections();
    const participants = useParticipants();
    const myUserUid = useMyUserUid();

    const dataSource: DataSource[] = React.useMemo(
        () =>
            [...(participants ?? [])].map(([key, participant]) => {
                const connection = roomConnections[key];
                return {
                    key, // antdのtableのkeyとして必要
                    participant: {
                        userUid: key,
                        state: participant,
                        // 自分自身のisConnectedは、接続しているのにfalseが返されることがあるバグが報告されている。ただし、自分自身の接続状況は非表示にしているのでUI上は関係ない。
                        isConnected:
                            key === myUserUid
                                ? ''
                                : connection?.isConnected === true
                                ? '接続'
                                : '未接続',
                    },
                };
            }),
        [participants, roomConnections, myUserUid]
    );

    const columns = _([
        {
            title: '',
            key: 'identicon',
            width: 30,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => (
                <Jdenticon
                    hashOrValue={participant.userUid}
                    size={24}
                    tooltipMode={{ type: 'userUid', userName: participant.state.name ?? undefined }}
                />
            ),
        },
        {
            title: '名前',
            key: '名前',
            width: 80,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => (
                <span>{participant.state.name}</span>
            ),
        },
        {
            title: 'ロール',
            key: 'ロール',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => {
                switch (participant.state.role) {
                    case ParticipantRole.Master:
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
    ])
        .compact()
        .value();

    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size='small' pagination={false} />
        </div>
    );
};
