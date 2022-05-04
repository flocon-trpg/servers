import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
    DeleteRoomDocument,
    GetMyRolesDocument,
    GetRoomsListDocument,
    ParticipantRole,
    RoomAsListItemFragment,
    UpdateBookmarkDocument,
    UpdateBookmarkFailureType,
} from '@flocon-trpg/typed-document-node';
import { Button, Dropdown, Menu, Modal, Table, Tooltip, notification } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React from 'react';
import { flex, flexNone, flexRow } from '../../../utils/className';
import { Layout, loginAndEntry } from '../../ui/Layout';
import { QueryResultViewer } from '../../ui/QueryResultViewer';
import * as Icons from '@ant-design/icons';
import { Styles } from '../../../styles';
import { useGetApiSemVer } from '../../../hooks/useGetApiSemVer';
import { SemVer, alpha, toBeNever } from '@flocon-trpg/utils';
import moment from 'moment';
import { ToggleButton } from '../../ui/ToggleButton';

type Data = RoomAsListItemFragment;

const BookmarkButton: React.FC<{ data: Data }> = ({ data }) => {
    const [updateBookmark] = useMutation(UpdateBookmarkDocument);
    const [loading, setLoading] = React.useState(false);
    const [checked, setChecked] = React.useState(data.isBookmarked);

    return (
        <ToggleButton
            unCheckedIcon={<Icons.StarOutlined />}
            checkedIcon={<Icons.StarFilled />}
            defaultType='text'
            checked={checked}
            loading={loading}
            onChange={async checked => {
                setLoading(true);
                const updateBookmarkResult = await updateBookmark({
                    variables: { roomId: data.id, newValue: checked },
                });
                if (updateBookmarkResult.errors != null) {
                    notification.error({
                        message: 'エラー',
                        description: 'APIサーバーとの通信でエラーが発生しました。',
                    });
                }
                if (updateBookmarkResult.data != null) {
                    switch (updateBookmarkResult.data.result.failureType) {
                        case null:
                        case undefined:
                            setChecked(checked);
                            break;
                        case UpdateBookmarkFailureType.NotFound:
                            notification.warning({
                                message: 'エラー',
                                description: '該当する部屋が見つかりませんでした。',
                            });
                            break;
                        case UpdateBookmarkFailureType.SameValue:
                            break;
                        default:
                            return toBeNever(updateBookmarkResult.data.result.failureType);
                    }
                }
                setLoading(false);
            }}
        />
    );
};

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

const dateToString = (dateMilliSeconds: number) =>
    moment(dateMilliSeconds).format('YYYY/MM/DD HH:mm:ss');

const bookmarkColumn = {
    title: '',
    dataIndex: 'isBookmarked',
    sorter: (x: Data, y: Data) => (x.isBookmarked ? 1 : 0) - (y.isBookmarked ? 1 : 0),
    render: (_: any, record: Data) => <BookmarkButton data={record} />,
    width: 60,
};
const nameColumn = {
    title: '名前',
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
};
const createdAtColumn = {
    title: '作成日時',
    dataIndex: 'createdAt',
    sorter: (x: Data, y: Data) => (x.createdAt ?? -1) - (y.createdAt ?? -1),
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data) =>
        record.createdAt == null ? '?' : dateToString(record.createdAt),
};
const updatedAtColumn = {
    title: '最終更新日時',
    dataIndex: 'updatedAt',
    sorter: (x: Data, y: Data) => (x.updatedAt ?? -1) - (y.updatedAt ?? -1),
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data) =>
        record.updatedAt == null ? '?' : dateToString(record.updatedAt),
};
const roleColumn = {
    title: '参加状況',
    dataIndex: 'role',
    sorter: (x: Data, y: Data) => {
        const toNumber = (source: Data['role']) => {
            switch (source) {
                case null:
                case undefined:
                    return 0;
                case ParticipantRole.Master:
                case ParticipantRole.Player:
                    return 2;
                case ParticipantRole.Spectator:
                    return 1;
                default:
                    toBeNever(source);
            }
        };
        return toNumber(x.role) - toNumber(y.role);
    },
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data) => {
        switch (record.role) {
            case null:
            case undefined:
                return '-';
            case ParticipantRole.Master:
            case ParticipantRole.Player:
                return '参加者';
            case ParticipantRole.Spectator:
                return '観戦者';
            default:
                toBeNever(record.role);
        }
    },
};
const actionColumn = {
    title: 'Action',
    dataIndex: '',
    key: 'Action',
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data) => <RoomButton roomId={record.id} />,
};

const columnV072 = [
    bookmarkColumn,
    nameColumn,
    createdAtColumn,
    updatedAtColumn,
    roleColumn,
    actionColumn,
];
const columnV071 = [bookmarkColumn, nameColumn, actionColumn];

type RoomsListComponentProps = {
    rooms: RoomAsListItemFragment[];
};

const RoomsListComponent: React.FC<RoomsListComponentProps> = ({
    rooms,
}: RoomsListComponentProps) => {
    const router = useRouter();
    const apiSemVer = useGetApiSemVer();

    let isV072OrLater: boolean | null;
    if (apiSemVer == null || apiSemVer.isError) {
        isV072OrLater = null;
    } else {
        isV072OrLater = SemVer.compare(
            new SemVer({ major: 0, minor: 7, patch: 2, prerelease: { type: alpha, version: 1 } }),
            '<=',
            apiSemVer.value
        );
    }

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
                <Table
                    rowKey='id'
                    style={{ flex: 'auto' }}
                    columns={
                        isV072OrLater == null || isV072OrLater == true ? columnV072 : columnV071
                    }
                    dataSource={rooms}
                />
            </div>
        ),
        [isV072OrLater, rooms, router]
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
