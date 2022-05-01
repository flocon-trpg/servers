import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
    DeleteRoomDocument,
    GetMyRolesDocument,
    GetRoomsListDocument,
    RoomAsListItemFragment,
} from '@flocon-trpg/typed-document-node';
import { Button, Dropdown, Menu, Modal, Table, Tooltip } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React from 'react';
import { flex, flexNone, flexRow } from '../../../utils/className';
import { Layout, loginAndEntry } from '../../ui/Layout';
import { QueryResultViewer } from '../../ui/QueryResultViewer';
import * as Icons from '@ant-design/icons';
import { Styles } from '../../../styles';

type Data = RoomAsListItemFragment;

const RoomButton: React.FC<{ roomId: string }> = ({ roomId }) => {
    const router = useRouter();
    const [deleteRoom] = useMutation(DeleteRoomDocument);
    const getMyRolesQueryResult = useQuery(GetMyRolesDocument);
    const [getRooms] = useLazyQuery(GetRoomsListDocument, { fetchPolicy: 'network-only' });

    const overlay = React.useMemo(() => {
        if (getMyRolesQueryResult.data?.result.admin !== true) {
            return undefined;
        }
        return (
            <Menu>
                <Menu.ItemGroup title='管理者用コマンド'>
                    <Menu.Item
                        icon={<Icons.DeleteOutlined />}
                        onClick={() => {
                            Modal.warn({
                                onOk: async () => {
                                    await deleteRoom({ variables: { id: roomId } });
                                    await getRooms();
                                },
                                okCancel: true,
                                maskClosable: true,
                                closable: true,
                                content: '部屋を削除します。よろしいですか？',
                            });
                        }}
                    >
                        <div style={Styles.Text.danger}>削除</div>
                    </Menu.Item>
                </Menu.ItemGroup>
            </Menu>
        );
    }, [getMyRolesQueryResult.data, deleteRoom, getRooms, roomId]);
    const join = React.useCallback(() => router.push(`/rooms/${roomId}`), [roomId, router]);

    const joinText = '入室';

    if (overlay == null) {
        return <Button onClick={join}>{joinText}</Button>;
    }
    return (
        <Dropdown.Button onClick={join} overlay={overlay} trigger={['click']}>
            {joinText}
        </Dropdown.Button>
    );
};

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
        sorter: (x: Data, y: Data) => x.name.localeCompare(y.name),
        // eslint-disable-next-line react/display-name
        render: (_: any, record: Data) => (
            <div className={classNames(flex, flexRow)}>
                <Tooltip title={record.name}>
                    <div
                        style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            maxWidth: 400,
                        }}
                    >
                        {record.name}
                    </div>
                </Tooltip>
            </div>
        ),
    },
    {
        title: 'Action',
        dataIndex: '',
        key: 'Action',
        // eslint-disable-next-line react/display-name
        render: (_: any, record: Data) => <RoomButton roomId={record.id} />,
    },
];

type RoomsListComponentProps = {
    rooms: RoomAsListItemFragment[];
};

const RoomsListComponent: React.FC<RoomsListComponentProps> = ({
    rooms,
}: RoomsListComponentProps) => {
    const router = useRouter();

    return React.useMemo(
        () => (
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
        ),
        [rooms, router]
    );
};

const pollingInterval = 30000;

const RoomCore: React.FC = () => {
    const rooms = useQuery(GetRoomsListDocument, { fetchPolicy: 'network-only' });

    React.useEffect(() => {
        switch (rooms.data?.result.__typename) {
            case 'GetRoomsListSuccessResult':
                rooms.startPolling(pollingInterval);
                break;
            case 'GetRoomsListFailureResult':
                rooms.stopPolling();
                break;
        }
    }, [rooms]);

    const roomsData = React.useMemo(() => {
        switch (rooms.data?.result.__typename) {
            case 'GetRoomsListSuccessResult':
                return rooms.data.result.rooms;
            case 'GetRoomsListFailureResult':
                return [];
        }
    }, [rooms.data]);

    return (
        <QueryResultViewer loading={rooms.loading} error={rooms.error} compact={false}>
            {roomsData == null ? null : <RoomsListComponent rooms={roomsData} />}
        </QueryResultViewer>
    );
};

export const RoomIndex: React.FC = () => {
    return <Layout requires={loginAndEntry}>{() => <RoomCore />}</Layout>;
};
