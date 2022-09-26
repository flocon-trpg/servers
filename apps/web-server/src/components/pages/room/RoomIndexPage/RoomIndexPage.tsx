import { useMutation, useQuery } from 'urql';
import * as DocNode072 from '@flocon-trpg/typed-document-node-v0.7.2';
import * as DocNode071 from '@flocon-trpg/typed-document-node-v0.7.1';
import { Button, Dropdown, Menu, Modal, Table, Tooltip, notification } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React from 'react';
import { flex, flexNone, flexRow } from '@/styles/className';
import { Layout, loginAndEntry } from '@/components/ui/Layout/Layout';
import { QueryResultViewer } from '@/components/ui/QueryResultViewer/QueryResultViewer';
import * as Icons from '@ant-design/icons';
import { Styles } from '@/styles';
import moment from 'moment';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import { useGetMyRoles } from '@/hooks/useGetMyRoles';
import { useIsV072OrLater } from '@/hooks/useIsV072OrLater';
import { Subscription } from 'rxjs';
import { defaultTriggerSubMenuAction } from '@/utils/variables';

type Data072 = DocNode072.RoomAsListItemFragment;
type Data071 = DocNode071.RoomAsListItemFragment;
type Data = Data072 | Data071;

const BookmarkButton: React.FC<{ data: Data072 }> = ({ data }) => {
    const [, updateBookmark] = useMutation(DocNode072.UpdateBookmarkDocument);
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
    const router = useRouter();
    const isV072OrLater = useIsV072OrLater();
    const [, deleteRoomAsAdmin] = useMutation(DocNode072.DeleteRoomAsAdminDocument);
    const [, getRooms] = useQuery({
        query: DocNode072.GetRoomsListDocument,
        pause: true,
        requestPolicy: 'network-only',
    });
    const getMyRolesQueryResult = useGetMyRoles();

    const overlay = React.useMemo(() => {
        if (!isV072OrLater) {
            return undefined;
        }
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
                                    Modal.warn({
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
    }, [
        isV072OrLater,
        getMyRolesQueryResult.data?.result.admin,
        deleteRoomAsAdmin,
        roomId,
        getRooms,
    ]);
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
    sorter: (x: Data072, y: Data072) => (x.isBookmarked ? 1 : 0) - (y.isBookmarked ? 1 : 0),
    render: (_: any, record: Data072) => <BookmarkButton data={record} />,
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
    sorter: (x: Data072, y: Data072) => (x.createdAt ?? -1) - (y.createdAt ?? -1),
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data072) =>
        record.createdAt == null ? '?' : dateToString(record.createdAt),
};
const updatedAtColumn = {
    title: '最終更新日時',
    dataIndex: 'updatedAt',
    sorter: (x: Data072, y: Data072) => (x.updatedAt ?? -1) - (y.updatedAt ?? -1),
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data072) =>
        record.updatedAt == null ? '?' : dateToString(record.updatedAt),
};
const roleColumn = {
    title: '参加状況',
    dataIndex: 'role',
    sorter: (x: Data072, y: Data072) => {
        const toNumber = (source: Data072['role']) => {
            switch (source) {
                case null:
                case undefined:
                    return 0;
                case DocNode072.ParticipantRole.Master:
                case DocNode072.ParticipantRole.Player:
                    return 2;
                case DocNode072.ParticipantRole.Spectator:
                    return 1;
            }
        };
        return toNumber(x.role) - toNumber(y.role);
    },
    // eslint-disable-next-line react/display-name
    render: (_: any, record: Data072) => {
        switch (record.role) {
            case null:
            case undefined:
                return '-';
            case DocNode072.ParticipantRole.Master:
            case DocNode072.ParticipantRole.Player:
                return '参加者';
            case DocNode072.ParticipantRole.Spectator:
                return '観戦者';
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
const columnV071 = [nameColumn, actionColumn];

const RoomsTable072: React.FC<{ rooms: readonly Data072[] }> = ({ rooms }) => {
    return <Table rowKey='id' style={{ flex: 'auto' }} columns={columnV072} dataSource={rooms} />;
};

const RoomsTable071: React.FC<{ rooms: readonly Data071[] }> = ({ rooms }) => {
    return <Table rowKey='id' style={{ flex: 'auto' }} columns={columnV071} dataSource={rooms} />;
};

type RoomsListComponentProps = {
    roomsTable: React.ReactChild;
    onReload: () => void;
};

const RoomsListComponent: React.FC<RoomsListComponentProps> = ({
    roomsTable,
    onReload,
}: RoomsListComponentProps) => {
    const router = useRouter();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: 10 }}>
            <div className={classNames(flex, flexNone)}>
                <div className={classNames(flexNone)}>
                    <Button
                        icon={<Icons.PlusOutlined />}
                        onClick={() => router.push('rooms/create')}
                    >
                        部屋を作成
                    </Button>
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
    const [rooms072, getRooms072] = useQuery({
        query: DocNode072.GetRoomsListDocument,
        requestPolicy: 'network-only',
    });
    const [rooms071, getRooms071] = useQuery({
        query: DocNode071.GetRoomsListDocument,
        requestPolicy: 'network-only',
    });
    const fetching = rooms072.fetching && rooms071.fetching;
    const error = rooms072.error && rooms071.error;
    const isV072OrLater = useIsV072OrLater();
    const subscriptionsRef = React.useRef(new Subscription());

    React.useEffect(() => {
        const subscriptions = subscriptionsRef.current;
        return () => {
            subscriptions.unsubscribe();
            subscriptionsRef.current = new Subscription();
        };
    }, []);

    React.useEffect(() => {
        if (isV072OrLater) {
            getRooms072();
        } else {
            getRooms071();
        }
    }, [getRooms071, getRooms072, isV072OrLater]);

    let roomsData072;
    switch (rooms072.data?.result.__typename) {
        case 'GetRoomsListSuccessResult':
            roomsData072 = rooms072.data.result.rooms;
            break;
        case 'GetRoomsListFailureResult':
        case undefined:
            roomsData072 = undefined;
            break;
    }

    let roomsData071;
    switch (rooms071.data?.result.__typename) {
        case 'GetRoomsListSuccessResult':
            roomsData071 = rooms071.data.result.rooms;
            break;
        case 'GetRoomsListFailureResult':
        case undefined:
            roomsData071 = undefined;
            break;
    }

    return (
        <QueryResultViewer loading={fetching} error={error} compact={false}>
            <RoomsListComponent
                roomsTable={
                    roomsData072 != null ? (
                        <RoomsTable072 rooms={roomsData072} />
                    ) : roomsData071 != null ? (
                        <RoomsTable071 rooms={roomsData071} />
                    ) : (
                        <div />
                    )
                }
                onReload={() => {
                    if (isV072OrLater) {
                        getRooms072();
                    } else {
                        getRooms071();
                    }
                }}
            />
        </QueryResultViewer>
    );
};

export const RoomIndexPage: React.FC = () => {
    return <Layout requires={loginAndEntry}>{() => <Room />}</Layout>;
};
