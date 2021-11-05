import React from 'react';
import { GetRoomsListDocument, RoomAsListItemFragment } from '@flocon-trpg/typed-document-node';
import { Layout, loginAndEntry } from '../../layouts/Layout';
import Link from 'next/link';
import { Button, Table } from 'antd';
import { useRouter } from 'next/router';
import { QueryResultViewer } from '../../components/QueryResultViewer';
import classNames from 'classnames';
import { flex, flexNone } from '../../utils/className';
import { useQuery } from '@apollo/client';

type Data = RoomAsListItemFragment;

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
        sorter: (x: Data, y: Data) => x.name.localeCompare(y.name),
    },
    {
        title: 'Action',
        dataIndex: '',
        key: 'Action',
        // eslint-disable-next-line react/display-name
        render: (_: any, record: Data) => (
            <Link href={`/rooms/${record.id}`}>
                <a>入室</a>
            </Link>
        ),
    },
];

type RoomsListComponentProps = {
    rooms: RoomAsListItemFragment[];
};

const RoomsListComponent: React.FC<RoomsListComponentProps> = ({
    rooms,
}: RoomsListComponentProps) => {
    const router = useRouter();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: 10 }}>
            <div className={classNames(flex, flexNone)}>
                <div className={classNames(flexNone)}>
                    <Button onClick={() => router.push('rooms/create')}>部屋を作成</Button>
                </div>
                <div style={{ flex: 'auto' }} />
            </div>
            <div style={{ flex: '10px' }} />
            <Table rowKey='id' style={{ flex: 'auto' }} columns={columns} dataSource={rooms} />
        </div>
    );
};

const pollingInterval = 30000;

const RoomCore: React.FC = () => {
    const rooms = useQuery(GetRoomsListDocument, { fetchPolicy: 'network-only' });

    switch (rooms.data?.result.__typename) {
        case 'GetRoomsListSuccessResult':
            rooms.startPolling(pollingInterval);
            break;
        case 'GetRoomsListFailureResult':
            rooms.stopPolling();
            break;
    }

    const roomsData = (() => {
        switch (rooms.data?.result.__typename) {
            case 'GetRoomsListSuccessResult':
                return rooms.data.result.rooms;
            case 'GetRoomsListFailureResult':
                return undefined;
        }
    })();

    return (
        <QueryResultViewer loading={rooms.loading} error={rooms.error} compact={false}>
            {roomsData == null ? null : <RoomsListComponent rooms={roomsData ?? []} />}
        </QueryResultViewer>
    );
};

const Room: React.FC = () => {
    return <Layout requires={loginAndEntry}>{() => <RoomCore />}</Layout>;
};

export default Room;
