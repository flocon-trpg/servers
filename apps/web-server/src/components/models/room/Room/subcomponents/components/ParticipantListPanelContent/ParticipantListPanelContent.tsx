import { State, participantTemplate } from '@flocon-trpg/core';
import { ParticipantRole } from '@flocon-trpg/graphql-documents';
import { Table } from 'antd';
import React from 'react';
import { useParticipants } from '../../hooks/useParticipants';
import { useRoomConnections } from '../../hooks/useRoomConnections';
import { Jdenticon } from '@/components/ui/Jdenticon/Jdenticon';
import { useMyUserUid } from '@/hooks/useMyUserUid';

type ParticipantState = State<typeof participantTemplate>;

type DataSource = {
    key: string;
    participant: {
        userUid: string;
        state: ParticipantState;
        isConnected: string;
    };
};

export const ParticipantListPanelContent: React.FC = () => {
    const roomConnections = useRoomConnections();
    const participants = useParticipants();
    const myUserUid = useMyUserUid();

    const dataSource: DataSource[] = React.useMemo(
        () =>
            [...(participants ?? [])].map(([key, participant]) => {
                const connection = roomConnections?.current.get(key);
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
        [participants, roomConnections, myUserUid],
    );

    const columns = React.useMemo(
        () => [
            {
                title: '',
                key: 'identicon',
                width: 30,
                render: (_: unknown, { participant }: DataSource) => (
                    <Jdenticon
                        hashOrValue={participant.userUid}
                        size={24}
                        tooltipMode={{
                            type: 'userUid',
                            userName: participant.state.name ?? undefined,
                        }}
                    />
                ),
            },
            {
                title: '名前',
                key: '名前',
                render: (_: unknown, { participant }: DataSource) => (
                    <span>{participant.state.name}</span>
                ),
            },
            {
                title: 'ロール',
                key: 'ロール',
                render: (_: unknown, { participant }: DataSource) => {
                    switch (participant.state.role) {
                        case ParticipantRole.Master:
                        case 'Master':
                        case ParticipantRole.Player:
                        case 'Player':
                            return '参加者';
                        case ParticipantRole.Spectator:
                        case 'Spectator':
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
        ],
        [],
    );

    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size="small" pagination={false} />
        </div>
    );
};
