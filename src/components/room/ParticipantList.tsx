import React from 'react';
import { Table } from 'antd';
import * as Participant from '../../stateManagers/states/participant';
import { __ } from '../../@shared/collection';
import { ParticipantRole } from '../../generated/graphql';
import Jdenticon from '../../foundations/Jdenticon';

type Props = {
    participants: Participant.State;
}

type DataSource = {
    key: string;
    participant: {
        userUid: string;
        state: Participant.StateElement;
    };
}

const ParticipantList: React.FC<Props> = ({ participants }: Props) => {
    const dataSource: DataSource[] =
        [...participants].map(([key, participant]) => {
            return {
                key, // antdのtableのkeyとして必要
                participant: {
                    userUid: key,
                    state: participant,
                },
            };
        });

    const columns = __([
        {
            title: '',
            key: 'identicon',
            width: 30,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { participant }: DataSource) => (
                <Jdenticon hashOrValue={participant.userUid} size={24} tooltipMode='userUid' />),
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
    ]).compact(x => x).toArray();

    return (
        <div>
            <Table columns={columns} dataSource={dataSource} size='small' />
        </div>);
};

export default ParticipantList;