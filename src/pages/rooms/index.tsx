import React from 'react';
import { GetRoomsListFailureType, RoomAsListItemFragment, useGetRoomsListQuery } from '../../generated/graphql';
import Layout from '../../layouts/Layout';
import moment from 'moment';
import Link from 'next/link';
import { Button, Col, Row, Space, Table, Tooltip } from 'antd';
import { useRouter } from 'next/router';
import QueryResultViewer from '../../components/QueryResultViewer';

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
        render: (_: any, record: Data) => (<Link href={`/rooms/${record.id}`}><a>入室</a></Link>),
    },
];

type RoomsListComponentProps = {
    rooms: RoomAsListItemFragment[];
}

const RoomsListComponent: React.FC<RoomsListComponentProps> = ({ rooms }: RoomsListComponentProps) => {
    const router = useRouter();

    return (
        <div style={({ display: 'flex', flexDirection: 'column', padding: 10 })}>
            <div style={({ flex: 0, display: 'flex' })}>
                <div style={({ flex: 0 })}>
                    <Button onClick={() => router.push('rooms/create')}>部屋を作成</Button>
                </div>
                <div style={({ flex: 'auto' })} />
            </div>
            <div style={({ flex: '10px' })} />
            <Table
                rowKey='id'
                style={({ flex: 'auto' })}
                columns={columns}
                dataSource={rooms} />
        </div>);
};

const pollingInterval = 30000;

const RoomCore: React.FC = () => {
    const rooms = useGetRoomsListQuery({ fetchPolicy: 'network-only' });

    switch (rooms.data?.result.__typename) {
        case 'GetRoomsListSuccessResult':
            rooms.startPolling(pollingInterval);
            break;
        case 'GetRoomsListFailureResult':
            rooms.stopPolling();
            break;
    }

    const showEntryForm = (() => {
        switch (rooms.data?.result.__typename) {
            case 'GetRoomsListFailureResult':
                switch (rooms.data.result.failureType) {
                    case GetRoomsListFailureType.NotEntry:
                        return true;
                    default:
                        return false;
                }
                break;
            default:
                return false;
        }
    })();

    const roomsData = (() => {
        switch (rooms.data?.result.__typename) {
            case 'GetRoomsListSuccessResult':
                return rooms.data.result.rooms;
            case 'GetRoomsListFailureResult':
                return undefined;
        }
    })();

    return (
        <Layout showEntryForm={showEntryForm} onEntry={() => rooms.refetch()} requiresLogin={true}>
            <QueryResultViewer loading={rooms.loading} error={rooms.error} compact={false}>
                {roomsData == null ? null : (<RoomsListComponent rooms={roomsData ?? []} />)}
            </QueryResultViewer>
        </Layout>);
};

const Room: React.FC = () => {
    return (<RoomCore />);
};

export default Room;