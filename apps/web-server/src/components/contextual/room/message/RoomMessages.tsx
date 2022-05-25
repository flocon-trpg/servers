/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import {
    Alert,
    Button,
    Checkbox,
    Col,
    Divider,
    Drawer,
    Dropdown,
    Input,
    Menu,
    Modal,
    Popover,
    Radio,
    Result,
    Row,
    Select,
    Tabs,
    Tooltip,
} from 'antd';
import moment from 'moment';
import { failure, graphqlError, notFetch, useRoomMesages } from '../../../../hooks/useRoomMessages';
import {
    Message,
    Notification,
    PrivateChannelSet,
    PrivateChannelSets,
    pieceLog,
    privateMessage,
    publicMessage,
    soundEffect,
} from '@flocon-trpg/web-server-utils';
import { ChatInput } from './ChatInput';
import {
    DeleteMessageDocument,
    EditMessageDocument,
    MakeMessageNotSecretDocument,
    WritingMessageStatusType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import * as Icon from '@ant-design/icons';
import { Gutter } from 'antd/lib/grid/row';
import { DialogFooter } from '../../../ui/DialogFooter';
import { BufferedInput } from '../../../ui/BufferedInput';
import { QueryResultViewer } from '../../../ui/QueryResultViewer';
import { useMessageFilter } from '../../../../hooks/useMessageFilter';
import { RoomMessage as RoomMessageNameSpace } from './RoomMessage';
import { useWritingMessageStatus } from '../../../../hooks/useWritingMessageStatus';
import { isDeleted, toText } from '../../../../utils/message/message';
import { usePublicChannelNames } from '../../../../hooks/state/usePublicChannelNames';
import { useParticipants } from '../../../../hooks/state/useParticipants';
import { recordToMap, toBeNever } from '@flocon-trpg/utils';
import { Color } from '../../../../utils/color';
import * as Icons from '@ant-design/icons';
import { InputModal } from '../../../ui/InputModal';
import { JumpToBottomVirtuoso } from '../../../ui/JumpToBottomVirtuoso';
import {
    cancelRnd,
    flex,
    flexColumn,
    flexNone,
    flexRow,
    itemsCenter,
} from '../../../../utils/className';
import classNames from 'classnames';
import { MyAuthContext, getUserUid } from '../../../../contexts/MyAuthContext';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { useMutation } from 'urql';
import { MessageTabConfig } from '../../../../atoms/roomConfig/types/messageTabConfig';
import { atom } from 'jotai';
import { roomAtom } from '../../../../atoms/room/roomAtom';
import { userConfigAtom } from '../../../../atoms/userConfig/userConfigAtom';
import { UserConfigUtils } from '../../../../atoms/userConfig/utils';
import { MessageFilter } from '../../../../atoms/roomConfig/types/messageFilter';
import { roomConfigAtom } from '../../../../atoms/roomConfig/roomConfigAtom';
import { MessageTabConfigUtils } from '../../../../atoms/roomConfig/types/messageTabConfig/utils';
import { useImmerUpdateAtom } from '../../../../atoms/useImmerUpdateAtom';
import { useAtomValue } from 'jotai/utils';
import { MessageTabName } from './MessageTabName';
import { DraggableTabs } from '../../../ui/DraggableTabs';
import { moveElement } from '../../../../utils/moveElement';
import { column, row } from '../../../../atoms/userConfig/types';
import { InputDescription } from '../../../ui/InputDescription';
import { WritableDraft } from 'immer/dist/internal';
import { MessagePanelConfig } from '../../../../atoms/roomConfig/types/messagePanelConfig';

const headerHeight = 20;
const contentMinHeight = 22;
const drawerGutter: [Gutter, Gutter] = [16, 16];
const drawerInputSpan = 18;

const none = 'none';
const some = 'some';
const custom = 'custom';
type HiwaSelectValueType = typeof none | typeof some | typeof custom;

const auto = 'auto';

const participantsAtom = atom(get => get(roomAtom).roomState?.state?.participants);
const roomIdAtom = atom(get => get(roomAtom).roomId);
const roomMessageFontSizeDeltaAtom = atom(get => get(userConfigAtom)?.roomMessagesFontSizeDelta);
const chatInputDirectionAtom = atom(get => get(userConfigAtom)?.chatInputDirection);

type TabEditorDrawerProps = {
    // これがundefinedの場合、Drawerのvisibleがfalseとみなされる。
    config?: MessageTabConfig;

    onChange: (newValue: MessageTabConfig) => void;
    onClose: () => void;
};

const TabEditorDrawer: React.FC<TabEditorDrawerProps> = (props: TabEditorDrawerProps) => {
    const { config, onChange: onChangeCore, onClose } = props;

    const myAuth = React.useContext(MyAuthContext);
    const publicChannelNames = usePublicChannelNames();
    const participantsMap = useParticipants();

    const hiwaSelectValue: HiwaSelectValueType = (() => {
        // config == null のケースは本来考慮する必要はないが、とりあえずnoneにしている。
        if (config == null || config.privateChannels === false) {
            return none;
        }
        if (config.privateChannels === true) {
            return some;
        }
        return custom;
    })();
    const selectedParticipants = React.useMemo<ReadonlySet<string>>(() => {
        if (typeof config?.privateChannels !== 'string') {
            return new Set();
        }
        const array = new PrivateChannelSets(config.privateChannels).toArray();
        const first = array[0];
        if (first == null) {
            return new Set();
        }
        return first.toStringSet();
    }, [config?.privateChannels]);

    const onChange = (newValue: Partial<MessageTabConfig>): void => {
        if (config == null) {
            return;
        }
        onChangeCore({ ...config, ...newValue });
    };

    if (participantsMap == null) {
        return null;
    }

    return (
        <Drawer
            className={cancelRnd}
            visible={config != null}
            title='タブの編集'
            closable
            onClose={() => onClose()}
            width={500}
            footer={
                <DialogFooter
                    close={{
                        textType: 'close',
                        onClick: () => onClose(),
                    }}
                />
            }
        >
            <Row gutter={drawerGutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>タブ名</Col>
                <Col span={drawerInputSpan}>
                    <Input
                        value={config?.tabName ?? ''}
                        onChange={e => onChange({ tabName: e.target.value })}
                    />
                    {config?.tabName ?? '' !== '' ? null : (
                        <>
                            <br />
                            <Alert
                                type='info'
                                showIcon
                                message='タブ名が空白であるため、自動的に決定された名前が表示されます。'
                            />
                        </>
                    )}
                </Col>
            </Row>
            <Divider />
            <Row gutter={drawerGutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>特殊チャンネル</Col>
                <Col span={drawerInputSpan}>
                    <Checkbox
                        checked={config?.showNotification ?? false}
                        onChange={e => onChange({ showNotification: e.target.checked })}
                    >
                        <span>ログ</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showSystem ?? false}
                        onChange={e => onChange({ showSystem: e.target.checked })}
                    >
                        <span>システムメッセージ</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showFree ?? false}
                        onChange={e => onChange({ showFree: e.target.checked })}
                    >
                        <span>雑談</span>
                    </Checkbox>
                </Col>
            </Row>
            <Divider dashed />
            <Row gutter={drawerGutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>一般チャンネル</Col>
                <Col span={drawerInputSpan}>
                    <Checkbox
                        checked={config?.showPublic1 ?? false}
                        onChange={e => onChange({ showPublic1: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel1Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic2 ?? false}
                        onChange={e => onChange({ showPublic2: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel2Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic3 ?? false}
                        onChange={e => onChange({ showPublic3: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel3Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic4 ?? false}
                        onChange={e => onChange({ showPublic4: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel4Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic5 ?? false}
                        onChange={e => onChange({ showPublic5: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel5Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic6 ?? false}
                        onChange={e => onChange({ showPublic6: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel6Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic7 ?? false}
                        onChange={e => onChange({ showPublic7: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel7Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic8 ?? false}
                        onChange={e => onChange({ showPublic8: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel8Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic9 ?? false}
                        onChange={e => onChange({ showPublic9: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel9Name}</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showPublic10 ?? false}
                        onChange={e => onChange({ showPublic10: e.target.checked })}
                    >
                        <span>{publicChannelNames?.publicChannel10Name}</span>
                    </Checkbox>
                </Col>
            </Row>
            <Divider dashed />
            <Row gutter={drawerGutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>秘話</Col>
                <Col span={drawerInputSpan}>
                    <Radio.Group
                        style={{ marginBottom: 5 }}
                        value={hiwaSelectValue}
                        onChange={e => {
                            switch (e.target.value) {
                                case none:
                                    onChange({ privateChannels: false });
                                    return;
                                case some:
                                    onChange({ privateChannels: true });
                                    return;
                                case custom:
                                    onChange({
                                        privateChannels: new PrivateChannelSets().toString(),
                                    });
                                    return;
                            }
                        }}
                    >
                        <Radio value={none}>含めない</Radio>
                        <br />
                        <Radio value={some}>全て含める</Radio>
                        <br />
                        <Radio value={custom}>カスタム(完全一致)</Radio>
                    </Radio.Group>
                    <br />
                    {hiwaSelectValue === custom &&
                        participantsMap.size <= 1 &&
                        [...participantsMap]
                            .filter(([userUid]) => getUserUid(myAuth) !== userUid)
                            .sort(([, x], [, y]) => (x.name ?? '').localeCompare(y.name ?? ''))
                            .map(([userUid, participant]) => {
                                return (
                                    <>
                                        <Checkbox
                                            key={userUid}
                                            checked={selectedParticipants.has(userUid)}
                                            onChange={newValue => {
                                                const newSelectedParticipants = new Set(
                                                    selectedParticipants
                                                );
                                                if (newValue.target.checked) {
                                                    newSelectedParticipants.add(userUid);
                                                } else {
                                                    newSelectedParticipants.delete(userUid);
                                                }
                                                onChange({
                                                    privateChannels: new PrivateChannelSet(
                                                        newSelectedParticipants
                                                    ).toString(),
                                                });
                                            }}
                                        >
                                            {participant.name}
                                        </Checkbox>
                                        <br key={userUid + '<br>'} />
                                    </>
                                );
                            })}
                    {hiwaSelectValue === custom && participantsMap.size <= 1 && (
                        <Alert type='info' showIcon message='自分以外の入室者がいません。' />
                    )}
                </Col>
            </Row>
        </Drawer>
    );
};

type ChannelNameEditorDrawerProps = {
    visible: boolean;

    onClose: () => void;
};

const ChannelNamesEditor: React.FC<ChannelNameEditorDrawerProps> = (
    props: ChannelNameEditorDrawerProps
) => {
    const { visible, onClose } = props;
    const publicChannelNames = usePublicChannelNames();
    const operateAsStateWithImmer = useSetRoomStateWithImmer();

    return (
        <Drawer
            className={cancelRnd}
            visible={visible}
            title='チャンネル名の編集'
            closable
            onClose={() => onClose()}
            width={500}
            footer={
                <DialogFooter
                    close={{
                        textType: 'close',
                        onClick: () => onClose(),
                    }}
                />
            }
        >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(i => {
                const key = `publicChannel${i}Name` as const;
                return (
                    <Row key={i} gutter={drawerGutter} align='middle'>
                        <Col flex='auto' />
                        <Col flex={0}>チャンネル{i}</Col>
                        <Col span={drawerInputSpan}>
                            <BufferedInput
                                bufferDuration='default'
                                value={publicChannelNames == null ? '' : publicChannelNames[key]}
                                onChange={e => {
                                    if (e.previousValue === e.currentValue) {
                                        return;
                                    }
                                    operateAsStateWithImmer(state => {
                                        state[key] = e.currentValue;
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                );
            })}
        </Drawer>
    );
};

type RoomMessageComponentProps = {
    message: RoomMessageNameSpace.MessageState | Notification;
    showPrivateMessageMembers?: boolean;

    // もしRoomMessageComponent内でusePublicChannelNamesをそれぞれ呼び出す形にすると、画像が読み込まれた瞬間（スクロールでメッセージ一覧を上下するときに発生しやすい）に一瞬だけpublicChannelNamesが何故かnullになる（react-virtuosoの影響？）ため、チャンネル名が一瞬だけ'?'になるためチラついて見えてしまう。そのため、このように外部からpublicChannelNamesを受け取る形にすることで解決している。
    publicChannelNames: ReturnType<typeof usePublicChannelNames>;
};

// margin を使うとvirtuosoで問題が発生するので、代わりにpaddingなどを用いなければならない。
// leftやrightはmarginを使っても大丈夫かもしれないが、改行の有無に関わる可能性があるのでこれらもmarginに置き換えている。
// https://virtuoso.dev/troubleshooting#list-does-not-scroll-to-the-bottom--items-jump-around
// また、例えば「roomId == nullならばとりあえず適当に<div style={{minHeight: 20}} />を返す」といったアプローチだとスクロールが正常にできないといった問題点があるのでこれも避けるべき。おそらく、初めはroomId == nullなので20pxになるが、直後にroomId != nullになるためすぐにheightが代わり、メッセージの数が多いとそのheightのずれが積み重なっておかしくなる、というのが原因だと考えられる。
const RoomMessageComponent: React.FC<RoomMessageComponentProps> = (
    props: RoomMessageComponentProps
) => {
    const participants = useAtomValue(participantsAtom);

    const { message, showPrivateMessageMembers, publicChannelNames } = props;

    const myAuth = React.useContext(MyAuthContext);
    const [, editMessageMutation] = useMutation(EditMessageDocument);
    const [, deleteMessageMutation] = useMutation(DeleteMessageDocument);
    const [, makeMessageNotSecret] = useMutation(MakeMessageNotSecretDocument);
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
    const roomId = useAtomValue(roomIdAtom);
    const roomMessagesFontSizeDelta = useAtomValue(roomMessageFontSizeDeltaAtom);

    const fontSize = UserConfigUtils.getRoomMessagesFontSize(roomMessagesFontSizeDelta ?? 0);

    const participantsMap = React.useMemo(
        () => (participants == null ? null : recordToMap(participants)),
        [participants]
    );

    const userMessage =
        message.type === privateMessage || message.type === publicMessage ? message.value : null;

    let createdByMe: boolean | null;
    if (typeof myAuth === 'string' || userMessage == null) {
        createdByMe = null;
    } else {
        createdByMe = myAuth.uid === userMessage.createdBy;
    }

    const createdAt =
        message.type === privateMessage ||
        message.type === publicMessage ||
        message.type === pieceLog
            ? message.value.createdAt
            : (message.createdAt as number | undefined);
    let datetime: string | null = null;
    if (createdAt != null) {
        datetime = moment(new Date(createdAt)).format('YYYY/MM/DD HH:mm:ss');
    }

    const userName =
        message.type === privateMessage ||
        message.type === publicMessage ||
        message.type === pieceLog
            ? RoomMessageNameSpace.userName(message, participantsMap ?? new Map())
            : null;

    let updatedInfo: JSX.Element | null = null;
    if (userMessage?.updatedAt != null) {
        if (isDeleted(userMessage)) {
            updatedInfo = (
                <Tooltip
                    title={`${moment(new Date(userMessage.updatedAt)).format(
                        'YYYY/MM/DD HH:mm:ss'
                    )}に削除されました`}
                >
                    <span style={{ color: 'gray' }}>(削除済み)</span>
                </Tooltip>
            );
        } else {
            updatedInfo = (
                <Tooltip
                    title={`${moment(new Date(userMessage.updatedAt)).format(
                        'YYYY/MM/DD HH:mm:ss'
                    )}に編集されました`}
                >
                    <span style={{ color: 'gray' }}>(編集済み)</span>
                </Tooltip>
            );
        }
    }

    let privateMessageMembersInfo: JSX.Element | null = null;
    if (showPrivateMessageMembers && message.type === privateMessage) {
        if (message.value.visibleTo.length === 0) {
            privateMessageMembersInfo = <div>(独り言)</div>;
        } else {
            const visibleTo = message.value.visibleTo
                .map(v => participantsMap?.get(v)?.name ?? v)
                .sort((x, y) => x.localeCompare(y));
            privateMessageMembersInfo = (
                <Popover
                    content={
                        <ul>
                            {visibleTo.map((str, i) => (
                                <li key={i}>{str}</li>
                            ))}
                        </ul>
                    }
                >
                    <div style={{ maxWidth: 100, textOverflow: 'ellipsis' }}>
                        {visibleTo.reduce(
                            (seed, elem, i) => (i === 0 ? elem : `${seed}, ${elem}`),
                            ''
                        )}
                    </div>
                </Popover>
            );
        }
    }
    const notSecretMenuItem =
        userMessage?.isSecret === true &&
        userMessage.createdBy != null &&
        userMessage.createdBy === getUserUid(myAuth) ? (
            <Menu.Item
                onClick={() => {
                    if (roomId == null) {
                        return;
                    }
                    makeMessageNotSecret({ messageId: userMessage.messageId, roomId });
                }}
            >
                公開
            </Menu.Item>
        ) : null;
    const editMenuItem =
        userMessage != null && createdByMe === true && userMessage.commandResult == null ? (
            <Menu.Item
                onClick={() => {
                    setIsEditModalVisible(true);
                }}
            >
                編集
            </Menu.Item>
        ) : null;
    const deleteMenuItem =
        userMessage != null && createdByMe === true ? (
            <Menu.Item
                onClick={() => {
                    if (roomId == null) {
                        return;
                    }
                    deleteMessageMutation({ messageId: userMessage.messageId, roomId });
                }}
            >
                削除
            </Menu.Item>
        ) : null;
    const allMenuItemsAreNull =
        notSecretMenuItem == null && editMenuItem == null && deleteMenuItem == null;
    const menuItems = (
        <>
            {notSecretMenuItem}
            {editMenuItem}
            {deleteMenuItem}
        </>
    );
    const iconSize = 28;
    const iconMargin = 6;
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: `${headerHeight}px 1fr`,
                gridTemplateColumns: `${iconMargin * 2 + iconSize}px 1fr 40px`,
                paddingBottom: 4,
                paddingTop: 4,
            }}
        >
            <div
                style={{
                    gridRow: '1 / 3',
                    gridColumn: '1 / 2',
                    justifySelf: 'center',
                    alignSelf: 'center',
                    margin: iconMargin,
                }}
            >
                <RoomMessageNameSpace.Icon message={message} size={iconSize} />
            </div>
            <div
                style={{
                    fontSize,
                    gridRow: '1 / 2',
                    gridColumn: '2 / 3',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '0 6px',
                }}
            >
                {userName && <div className={classNames(flexNone)}>{userName}</div>}
                <div style={{ flex: '0 0 auto', color: 'gray' }}>
                    {message.type !== privateMessage && message.type !== publicMessage
                        ? '(ログ)'
                        : publicChannelNames == null
                        ? '?'
                        : RoomMessageNameSpace.toChannelName(
                              message,
                              publicChannelNames,
                              participantsMap ?? new Map()
                          )}
                </div>
                <div style={{ flex: '0 0 auto', color: 'gray' }}>{datetime}</div>
                {privateMessageMembersInfo}
                {updatedInfo}
                <div style={{ flex: 1 }} />
            </div>
            {message.type === privateMessage ||
            message.type === publicMessage ||
            message.type === pieceLog ? (
                <RoomMessageNameSpace.Content
                    style={{
                        fontSize,
                        overflowWrap: 'break-word',
                        gridRow: '2 / 3',
                        gridColumn: '2 / 3',
                        minHeight: contentMinHeight,
                    }}
                    message={message}
                />
            ) : (
                <div
                    style={{
                        fontSize,
                        overflowWrap: 'break-word',
                        gridRow: '2 / 3',
                        gridColumn: '2 / 3',
                        minHeight: contentMinHeight,
                    }}
                >
                    {message.message}
                </div>
            )}
            <div
                style={{
                    gridRow: '1 / 3',
                    gridColumn: '3 / 4',
                    justifySelf: 'center',
                    alignSelf: 'center',
                }}
            >
                {allMenuItemsAreNull ? null : (
                    <Dropdown overlay={<Menu>{menuItems}</Menu>} trigger={['click']}>
                        <Button type='text' size='small'>
                            <Icon.EllipsisOutlined />
                        </Button>
                    </Dropdown>
                )}
            </div>
            <InputModal
                title='メッセージの編集'
                visible={isEditModalVisible}
                isTextArea={true}
                onOk={(value, setValue) => {
                    if (userMessage == null || roomId == null) {
                        return;
                    }
                    editMessageMutation({
                        messageId: userMessage.messageId,
                        roomId,
                        text: value,
                    }).then(() => {
                        setIsEditModalVisible(false);
                        setValue('');
                    });
                }}
                onClose={setValue => {
                    setIsEditModalVisible(false);
                    setValue('');
                }}
                onOpen={setValue => {
                    setValue(userMessage == null ? '' : toText(userMessage) ?? '');
                }}
            />
        </div>
    );
};

type MessageTabPaneProps = {
    contentHeight: number;
    config: MessageFilter;
};

const MessageTabPane: React.FC<MessageTabPaneProps> = (props: MessageTabPaneProps) => {
    const { contentHeight, config } = props;

    const writingStatusHeight = 16;

    const myAuth = React.useContext(MyAuthContext);
    const writingMessageStatusResult = useWritingMessageStatus();
    const publicChannelNames = usePublicChannelNames();
    const participants = useAtomValue(participantsAtom);
    const participantsMap = React.useMemo(
        () => (participants == null ? null : recordToMap(participants)),
        [participants]
    );

    const filter = useMessageFilter(config);
    const thenMap = React.useCallback(
        (_: unknown, message: Message) => {
            if (message.type === soundEffect) {
                // soundEffectはfilterで弾いていなければならない。
                throw new Error('soundEffect is not supported');
            }
            return (
                <RoomMessageComponent
                    key={
                        message.type === privateMessage || message.type === publicMessage
                            ? message.value.messageId
                            : message.value.createdAt
                    }
                    publicChannelNames={publicChannelNames}
                    message={
                        message.type === publicMessage ||
                        message.type === privateMessage ||
                        message.type === pieceLog
                            ? message
                            : message.value
                    }
                />
            );
        },
        [publicChannelNames]
    );
    const messages = useRoomMesages({ filter });

    const writingUsers = [...writingMessageStatusResult]
        .filter(
            ([key, value]) =>
                key !== getUserUid(myAuth) && value.current === WritingMessageStatusType.Writing
        )
        .map(([key]) => key)
        .map(userUid => participantsMap?.get(userUid)?.name ?? '')
        .sort();
    let writingStatus: JSX.Element | null = null;
    // TODO: background-colorが適当
    const writingStatusCss = css`
        flex-basis: ${writingStatusHeight}px;
        background-color: #10101090;
        padding: 0 4px;
    `;
    if (writingUsers.length >= 3) {
        writingStatus = <div css={writingStatusCss}>複数人が書き込み中…</div>;
    } else if (writingUsers.length === 0) {
        writingStatus = <div css={writingStatusCss} />;
    } else {
        writingStatus = (
            <div css={writingStatusCss}>
                {writingUsers.reduce(
                    (seed, elem, i) => (i === 0 ? elem : `${seed}, ${elem}`),
                    '' as string
                ) + ' が書き込み中…'}
            </div>
        );
    }

    let content: JSX.Element = <QueryResultViewer loading compact={false} />;
    if (messages !== notFetch) {
        if (messages.isError) {
            switch (messages.error.type) {
                case graphqlError:
                    content = (
                        <QueryResultViewer
                            loading={false}
                            error={messages.error.error}
                            compact={false}
                        />
                    );
                    break;
                case failure:
                    content = (
                        <Result
                            status='error'
                            title='エラー'
                            subTitle={messages.error.failureType}
                        />
                    );
                    break;
                default:
                    toBeNever(messages.error);
            }
        } else {
            content = (
                <JumpToBottomVirtuoso
                    items={messages.value.current ?? []}
                    create={thenMap}
                    height={contentHeight - writingStatusHeight}
                />
            );
        }
    }

    return (
        <div className={classNames(flex, flexColumn)}>
            <div style={{ padding: '0 4px' }}>{content}</div>
            {writingStatus}
        </div>
    );
};

type Props = {
    height: number;
    panelId: string;
};

export const RoomMessages: React.FC<Props> = ({ height, panelId }: Props) => {
    const tabsAtom = React.useMemo(() => {
        return atom(get => get(roomConfigAtom)?.panels.messagePanels?.[panelId]?.tabs);
    }, [panelId]);
    const tabs = useAtomValue(tabsAtom);
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const setUserConfig = useImmerUpdateAtom(userConfigAtom);

    const [editingTabConfigKey, setEditingTabConfigKey] = React.useState<string>();
    const editingTabConfig = React.useMemo(() => {
        if (editingTabConfigKey == null) {
            return undefined;
        }
        return tabs?.find(tab => tab.key === editingTabConfigKey);
    }, [tabs, editingTabConfigKey]);

    const [isChannelNamesEditorVisible, setIsChannelNamesEditorVisible] = React.useState(false);

    const roomId = useAtomValue(roomIdAtom);
    const roomMessagesFontSizeDelta = useAtomValue(roomMessageFontSizeDeltaAtom);
    const chatInputDirectionCore = useAtomValue(chatInputDirectionAtom) ?? auto;

    // GameSelectorの無駄なrerenderを抑止するため、useCallbackを使っている。
    const onChatInputConfigUpdate = React.useCallback(
        (recipe: (draft: WritableDraft<MessagePanelConfig>) => void) => {
            setRoomConfig(roomConfig => {
                if (roomConfig == null) {
                    return;
                }
                const messagePanel = roomConfig.panels.messagePanels[panelId];
                if (messagePanel == null) {
                    return;
                }
                recipe(messagePanel);
            });
        },
        [panelId, setRoomConfig]
    );

    const chatInputDirection =
        chatInputDirectionCore === auto ? (height <= 500 ? row : column) : chatInputDirectionCore;
    const spaceDiff = 60;
    const contentHeight = Math.max(
        0,
        height - 280 - (chatInputDirection === column ? spaceDiff : 0)
    );
    const tabsHeight = Math.max(0, height - 240 - (chatInputDirection === column ? spaceDiff : 0));

    const marginX = 5;

    const draggableTabs = React.useMemo(() => {
        if (tabs == null) {
            return undefined;
        }

        const tabPanels =
            contentHeight <= 0
                ? null
                : tabs.map((tab, tabIndex) => {
                      return (
                          <Tabs.TabPane
                              key={tab.key}
                              tabKey={tab.key}
                              closable={false}
                              style={{ backgroundColor: Color.chatBackgroundColor }}
                              tab={
                                  <div
                                      style={{
                                          display: 'flex',
                                          flexDirection: 'row',
                                          justifyItems: 'center',
                                      }}
                                  >
                                      <div style={{ flex: '0 0 auto', maxWidth: 100 }}>
                                          <MessageTabName tabConfig={tab} />
                                      </div>
                                      <div style={{ flex: 1 }} />
                                      <div style={{ flex: '0 0 auto', paddingLeft: 15 }}>
                                          <Dropdown
                                              trigger={['click']}
                                              overlay={
                                                  <Menu>
                                                      <Menu.Item
                                                          icon={<Icon.SettingOutlined />}
                                                          onClick={() =>
                                                              setEditingTabConfigKey(tab.key)
                                                          }
                                                      >
                                                          編集
                                                      </Menu.Item>
                                                      <Menu.Item
                                                          icon={<Icon.DeleteOutlined />}
                                                          onClick={() => {
                                                              Modal.warn({
                                                                  onOk: () => {
                                                                      setRoomConfig(roomConfig => {
                                                                          if (roomConfig == null) {
                                                                              return;
                                                                          }
                                                                          const messagePanel =
                                                                              roomConfig.panels
                                                                                  .messagePanels[
                                                                                  panelId
                                                                              ];
                                                                          if (
                                                                              messagePanel == null
                                                                          ) {
                                                                              return;
                                                                          }
                                                                          messagePanel.tabs.splice(
                                                                              tabIndex,
                                                                              1
                                                                          );
                                                                      });
                                                                  },
                                                                  okCancel: true,
                                                                  maskClosable: true,
                                                                  closable: true,
                                                                  content:
                                                                      'タブを削除します。よろしいですか？',
                                                              });
                                                          }}
                                                      >
                                                          削除
                                                      </Menu.Item>
                                                  </Menu>
                                              }
                                          >
                                              <Button
                                                  style={{
                                                      width: 18,
                                                      minWidth: 18,

                                                      // antdのButtonはCSS(.antd-btn-sm)によって padding: 0px 7px が指定されているため、左右に空白ができる。ここではこれを無効化するため、paddingを上書きしている。
                                                      padding: '0 2px',
                                                  }}
                                                  type='text'
                                                  size='small'
                                                  onClick={e => e.stopPropagation()}
                                              >
                                                  <Icon.EllipsisOutlined />
                                              </Button>
                                          </Dropdown>
                                      </div>
                                  </div>
                              }
                          >
                              <MessageTabPane config={tab} contentHeight={contentHeight} />
                          </Tabs.TabPane>
                      );
                  });

        return (
            <DraggableTabs
                style={{ flexBasis: `${tabsHeight}px`, margin: `0 ${marginX}px 4px ${marginX}px` }}
                dndType={`MessagePanelTab@${panelId}`}
                type='editable-card'
                onDnd={action => {
                    setRoomConfig(roomConfig => {
                        const messagePanel = roomConfig?.panels.messagePanels[panelId];
                        if (messagePanel == null) {
                            return;
                        }
                        moveElement(messagePanel.tabs, tab => tab.key, action);
                    });
                }}
                onEdit={(e, type) => {
                    if (type === 'remove') {
                        if (typeof e !== 'string') {
                            return;
                        }
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const messagePanel = roomConfig.panels.messagePanels[panelId];
                            if (messagePanel == null) {
                                return;
                            }
                            const indexToSplice = messagePanel.tabs.findIndex(
                                tab => tab.key === editingTabConfigKey
                            );
                            if (indexToSplice >= 0) {
                                messagePanel.tabs.splice(indexToSplice, 1);
                            }
                        });
                        return;
                    }
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const messagePanel = roomConfig.panels.messagePanels[panelId];
                        if (messagePanel == null) {
                            return;
                        }
                        messagePanel.tabs.push(MessageTabConfigUtils.createEmpty({}));
                    });
                }}
            >
                {tabPanels}
            </DraggableTabs>
        );
    }, [contentHeight, editingTabConfigKey, panelId, setRoomConfig, tabs, tabsHeight]);

    if (roomId == null || draggableTabs == null) {
        return null;
    }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '2px 4px' }}
        >
            <TabEditorDrawer
                config={editingTabConfig}
                onClose={() => setEditingTabConfigKey(undefined)}
                onChange={newValue => {
                    if (editingTabConfigKey == null) {
                        return;
                    }
                    setRoomConfig(roomConfig => {
                        if (roomConfig == null) {
                            return;
                        }
                        const messagePanel = roomConfig.panels.messagePanels[panelId];
                        if (messagePanel == null) {
                            return;
                        }
                        [...messagePanel.tabs].forEach((tab, i) => {
                            if (tab.key === editingTabConfigKey) {
                                messagePanel.tabs[i] = newValue;
                            }
                        });
                    });
                }}
            />
            <ChannelNamesEditor
                visible={isChannelNamesEditorVisible}
                onClose={() => setIsChannelNamesEditorVisible(false)}
            />
            <div className={classNames(flex, flexRow, itemsCenter)}>
                <Button
                    style={{ margin: `4px ${marginX}px 4px ${marginX}px`, width: 170 }}
                    size='small'
                    onClick={() => setIsChannelNamesEditorVisible(true)}
                >
                    チャンネルの名前を編集
                </Button>
                <div style={{ width: 16 }} />
                <InputDescription>フォントサイズ</InputDescription>
                <Button
                    size='small'
                    onClick={() => {
                        setUserConfig(userConfig => {
                            if (userConfig == null) {
                                return;
                            }
                            userConfig.roomMessagesFontSizeDelta =
                                (roomMessagesFontSizeDelta ?? 0) - 1;
                        });
                    }}
                >
                    <Icons.MinusOutlined />
                </Button>
                <Button
                    size='small'
                    onClick={() => {
                        setUserConfig(userConfig => {
                            if (userConfig == null) {
                                return;
                            }
                            userConfig.roomMessagesFontSizeDelta =
                                (roomMessagesFontSizeDelta ?? 0) + 1;
                        });
                    }}
                >
                    <Icons.PlusOutlined />
                </Button>
                <div style={{ width: 16 }} />
                <InputDescription>プルダウンメニューの表示方法</InputDescription>
                <Select
                    style={{ minWidth: 100 }}
                    value={chatInputDirectionCore}
                    onChange={e => {
                        setUserConfig(userConfig => {
                            if (userConfig == null) {
                                return;
                            }
                            switch (e) {
                                case column:
                                case row:
                                    userConfig.chatInputDirection = e;
                                    break;
                                default:
                                    userConfig.chatInputDirection = undefined;
                                    break;
                            }
                        });
                    }}
                >
                    <Select.Option value={auto}>自動</Select.Option>
                    <Select.Option value={column}>縦に並べる</Select.Option>
                    <Select.Option value={row}>横に並べる</Select.Option>
                </Select>
            </div>
            <div style={{ flex: 1 }} />
            {draggableTabs}
            <ChatInput
                style={{ flex: 'auto', margin: '0 4px' }}
                roomId={roomId}
                panelId={panelId}
                topElementsDirection={chatInputDirection}
                onConfigUpdate={onChatInputConfigUpdate}
            />
        </div>
    );
};
