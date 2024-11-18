import * as Icons from '@ant-design/icons';
import { ParticipantRole, RoomAsListItemFragmentDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { useNavigate } from '@tanstack/react-router';
import { App, Button, Dropdown, Menu, Table, Tooltip } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React from 'react';
import { Subscription } from 'rxjs';
import { useMutation, useQuery } from 'urql';
import { DeleteRoomAsAdminDoc } from '../../../../graphql/DeleteRoomAsAdminDoc';
import { GetRoomAsListItemDoc } from '../../../../graphql/GetRoomAsListItemDoc';
import { GetRoomsListDoc } from '../../../../graphql/GetRoomsListDoc';
import { UpdateBookmarkDoc } from '../../../../graphql/UpdateBookmarkDoc';
import { AwaitableButton } from '@/components/ui/AwaitableButton/AwaitableButton';
import { GraphQLResult } from '@/components/ui/GraphQLResult/GraphQLResult';
import { Layout, loginAndEntry } from '@/components/ui/Layout/Layout';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import { useGetMyRoles } from '@/hooks/useGetMyRoles';
import { Styles } from '@/styles';
import { flex, flexNone, flexRow } from '@/styles/className';
import { defaultTriggerSubMenuAction } from '@/utils/variables';

type Data = ResultOf<typeof RoomAsListItemFragmentDoc>;

const BookmarkButton: React.FC<{ data: Data }> = ({ data }) => {
    const [, updateBookmark] = useMutation(UpdateBookmarkDoc);
    const [loading, setLoading] = React.useState(false);
    const [checked, setChecked] = React.useState(data.isBookmarked);
    const { notification } = App.useApp();

    return (
        <ToggleButton
            unCheckedIcon={<Icons.StarOutlined />}
            checkedIcon={<Icons.StarFilled />}
            defaultType="text"
            checked={checked}
            loading={loading}
            onChange={async checked => {
                setLoading(true);
                const updateBookmarkResult = await updateBookmark({
                    roomId: data.id,
                    newValue: checked,
                });
                if (updateBookmarkResult.error != null) {
                    notification.error({
                        message: 'エラー',
                        description: 'APIサーバーとの通信でエラーが発生しました。',
                    });
                }
                if (updateBookmarkResult.data != null) {
                    switch (updateBookmarkResult.data.result.__typename) {
                        case 'UpdateBookmarkFailureResult':
                            notification.warning({
                                message: 'エラー',
                                description: '該当する部屋が見つかりませんでした。',
                            });
                            break;
                        case 'UpdateBookmarkSuccessResult':
                            setChecked(updateBookmarkResult.data.result.currentValue);
                            break;
                    }
                }
                setLoading(false);
            }}
        />
    );
};

const RoomButton: React.FC<{ roomId: string }> = ({ roomId }) => {
    const { modal } = App.useApp();
    const router = useNavigate();
    const [, deleteRoomAsAdmin] = useMutation(DeleteRoomAsAdminDoc);
    const [, getRooms] = useQuery({
        query: GetRoomsListDoc,
        pause: true,
        requestPolicy: 'network-only',
    });
    const getMyRolesQueryResult = useGetMyRoles();

    const overlay = React.useMemo(() => {
        if (getMyRolesQueryResult.data?.result.admin !== true) {
            return undefined;
        }
        return (
            <Menu
                items={[
                    {
                        type: 'group',
                        key: '管理者コマンド',
                        label: '管理者コマンド',
                        children: [
                            {
                                key: '削除@管理者コマンド',
                                icon: <Icons.DeleteOutlined />,
                                label: <div style={Styles.Text.danger}>削除</div>,
                                onClick: () => {
                                    modal.warning({
                                        onOk: async () => {
                                            await deleteRoomAsAdmin({ id: roomId });
                                            getRooms();
                                        },
                                        okCancel: true,
                                        maskClosable: true,
                                        closable: true,
                                        content: '部屋を削除します。よろしいですか？',
                                    });
                                },
                            },
                        ],
                    },
                ]}
                triggerSubMenuAction={defaultTriggerSubMenuAction}
            />
        );
    }, [getMyRolesQueryResult.data?.result.admin, modal, deleteRoomAsAdmin, roomId, getRooms]);
    const join = React.useCallback(
        () => void router({ to: `/rooms/$id`, params: { id: roomId } }),
        [roomId, router],
    );

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
    render: (_: unknown, record: Data) => <BookmarkButton data={record} />,
    width: 60,
};
const nameColumn = {
    title: '名前',
    dataIndex: 'name',
    sorter: (x: Data, y: Data) => x.name.localeCompare(y.name),
    render: (_: unknown, record: Data) => (
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
    render: (_: unknown, record: Data) =>
        record.createdAt == null ? '?' : dateToString(record.createdAt),
};
const updatedAtColumn = {
    title: '最終更新日時',
    dataIndex: 'updatedAt',
    sorter: (x: Data, y: Data) => (x.updatedAt ?? -1) - (y.updatedAt ?? -1),
    render: (_: unknown, record: Data) =>
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
            }
        };
        return toNumber(x.role) - toNumber(y.role);
    },
    render: (_: unknown, record: Data) => {
        switch (record.role) {
            case null:
            case undefined:
                return '-';
            case ParticipantRole.Master:
            case ParticipantRole.Player:
                return '参加者';
            case ParticipantRole.Spectator:
                return '観戦者';
        }
    },
};
const actionColumn = {
    title: 'Action',
    dataIndex: '',
    key: 'Action',
    render: (_: unknown, record: Data) => <RoomButton roomId={record.id} />,
};

const columns = [
    bookmarkColumn,
    nameColumn,
    createdAtColumn,
    updatedAtColumn,
    roleColumn,
    actionColumn,
];

const RoomsTable: React.FC<{ rooms: readonly Data[] }> = ({ rooms }) => {
    return <Table rowKey="id" style={{ flex: 'auto' }} columns={columns} dataSource={rooms} />;
};

type RoomsListComponentProps = {
    roomsTable: React.ReactChild;
    onReload: () => void;
};

const RoomsListComponent: React.FC<RoomsListComponentProps> = ({
    roomsTable,
    onReload,
}: RoomsListComponentProps) => {
    const { notification } = App.useApp();
    const router = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: 10 }}>
            <div className={classNames(flex, flexNone)}>
                <div className={classNames(flexNone)}>
                    <AwaitableButton
                        icon={<Icons.PlusOutlined />}
                        onClick={() => router({ to: '/rooms/create' })}
                    >
                        部屋を作成
                    </AwaitableButton>
                </div>
                <div style={{ paddingLeft: 4 }} className={classNames(flexNone)}>
                    <Button
                        icon={<Icons.ReloadOutlined />}
                        onClick={() => {
                            onReload();
                            notification.open({
                                message: '再読み込みしました。',
                                placement: 'bottomRight',
                            });
                        }}
                    >
                        再読み込み
                    </Button>
                </div>
                <div style={{ flex: 'auto' }} />
            </div>
            <div style={{ flex: '10px' }} />
            {roomsTable}
        </div>
    );
};

const Room: React.FC = () => {
    const [rooms, getRooms] = useQuery({
        query: GetRoomsListDoc,
        requestPolicy: 'network-only',
    });
    const fetching = rooms.fetching;
    const error = rooms.error;
    const subscriptionsRef = React.useRef(new Subscription());

    React.useEffect(() => {
        const subscriptions = subscriptionsRef.current;
        return () => {
            subscriptions.unsubscribe();
            subscriptionsRef.current = new Subscription();
        };
    }, []);

    React.useEffect(() => {
        getRooms();
    }, [getRooms]);

    let roomsData;
    switch (rooms.data?.result.__typename) {
        case 'GetRoomsListSuccessResult':
            roomsData = rooms.data.result.rooms;
            break;
        case 'GetRoomsListFailureResult':
        case undefined:
            roomsData = undefined;
            break;
    }

    return (
        <GraphQLResult
            loading={fetching}
            error={error == null ? undefined : { error, title: 'API エラー' }}
        >
            <RoomsListComponent
                roomsTable={roomsData != null ? <RoomsTable rooms={roomsData} /> : <div />}
                onReload={() => {
                    getRooms();
                }}
            />
        </GraphQLResult>
    );
};

export const RoomIndexPage: React.FC = () => {
    return (
        <Layout requires={loginAndEntry}>
            <Room />
        </Layout>
    );
};
