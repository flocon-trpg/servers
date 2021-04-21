import React from 'react';
import { Tabs, Button, Menu, Dropdown, Tooltip, Popover, Drawer, Col, Row, Checkbox, Divider, Radio, Alert, Input, Modal, Result } from 'antd';
import moment from 'moment';
import { AllRoomMessagesSuccessResult, apolloError, failure, loading, RoomMessage, publicMessage, privateMessage, soundEffect, AllRoomMessagesResult, useFilteredAndMapRoomMessages, Message } from '../../hooks/useRoomMessages';
import { __ } from '../../@shared/collection';
import { PrivateChannelSet, PrivateChannelSets } from '../../utils/PrivateChannelSet';
import ChatInput from './ChatInput';
import MyAuthContext from '../../contexts/MyAuthContext';
import { $free, $system } from '../../@shared/Constants';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import { FilePathFragment, RoomPrivateMessageFragment, RoomPublicMessageFragment, useDeleteMessageMutation, useEditMessageMutation, useMakeMessageNotSecretMutation } from '../../generated/graphql';
import * as Icon from '@ant-design/icons';
import { useFirebaseStorageUrl } from '../../hooks/firebaseStorage';
import InputModal from '../InputModal';
import Jdenticon from '../../foundations/Jdenticon';
import { Character } from '../../stateManagers/states/character';
import { Participant } from '../../stateManagers/states/participant';
import { getUserUid } from '../../hooks/useFirebaseUser';
import PagenationScroll from '../PagenationScroll';
import { MessagePanelConfig, MessageFilter, TabConfig } from '../../states/MessagesPanelConfig';
import { Gutter } from 'antd/lib/grid/row';
import { PublicChannelNames } from '../../utils/types';
import DrawerFooter from '../../layouts/DrawerFooter';
import OperateContext from './contexts/OperateContext';
import BufferedInput from '../../foundations/BufferedInput';
import { Room } from '../../stateManagers/states/room';
import LoadingResult from '../../foundations/Result/LoadingResult';
import QueryResultViewer from '../../foundations/QueryResultViewer';
import { useMessageFilter } from '../../hooks/useMessageFilter';
import { RoomMessage as RoomMessageNameSpace } from './RoomMessage';
import { TextNotification, TextNotificationsState } from './contexts/LogNotificationContext';

const headerHeight = 20;
const contentMinHeight = 22;
const drawerGutter: [Gutter, Gutter] = [16, 16];
const drawerInputSpan = 18;

type PublicChannelKey =
    | typeof $free
    | typeof $system
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'

const publicChannelKeys: PublicChannelKey[] = [
    $free,
    $system,
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
];

export const isPublicChannelKey = (source: unknown): source is PublicChannelKey => {
    return publicChannelKeys.find(key => key === source) !== undefined;
};

const none = 'none';
const some = 'some';
const custom = 'custom';
type HiwaSelectValueType = typeof none | typeof some | typeof custom;

type TabEditorDrawerProps = {
    // これがundefinedの場合、Drawerのvisibleがfalseとみなされる。
    config?: TabConfig;

    onChange: (newValue: TabConfig) => void;
    onClose: () => void;
    participants: ReadonlyMap<string, Participant.State>;
} & PublicChannelNames

const TabEditorDrawer: React.FC<TabEditorDrawerProps> = (props: TabEditorDrawerProps) => {
    const { config, onChange: onChangeCore, participants, onClose } = props;

    const myAuth = React.useContext(MyAuthContext);
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
        if (array.length === 0) {
            return new Set();
        }
        return array[0].toStringSet();
    }, [config?.privateChannels]);

    const onChange = (newValue: Partial<TabConfig>): void => {
        if (config == null) {
            return;
        }
        onChangeCore({ ...config, ...newValue });
    };

    return (<Drawer
        className='cancel-rnd'
        visible={config != null}
        title='タブの編集'
        closable
        onClose={() => onClose()}
        width={500}
        footer={(
            <DrawerFooter
                close={({
                    textType: 'close',
                    onClick: () => onClose()
                })} />)}>
        <Row gutter={drawerGutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>タブ名</Col>
            <Col span={drawerInputSpan}>
                <Input value={config?.tabName ?? ''} onChange={e => onChange({ tabName: e.target.value })} />
                {config?.tabName ?? '' !== '' ? null : <>
                    <br />
                    <Alert type='info' showIcon message='タブ名が空白であるため、自動的に決定された名前が表示されます。' />
                </>}
            </Col>
        </Row>
        <Divider />
        <Row gutter={drawerGutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>特殊チャンネル</Col>
            <Col span={drawerInputSpan}>
                <Checkbox checked={config?.showLog ?? false} onChange={e => onChange({ showLog: e.target.checked })}>
                    <span>ログ</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showSystem ?? false} onChange={e => onChange({ showSystem: e.target.checked })}>
                    <span>システムメッセージ</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showFree ?? false} onChange={e => onChange({ showFree: e.target.checked })}>
                    <span>雑談</span>
                </Checkbox>
            </Col>
        </Row>
        <Divider dashed />
        <Row gutter={drawerGutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>一般チャンネル</Col>
            <Col span={drawerInputSpan}>
                <Checkbox checked={config?.showPublic1 ?? false} onChange={e => onChange({ showPublic1: e.target.checked })}>
                    <span>{props.publicChannel1Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic2 ?? false} onChange={e => onChange({ showPublic2: e.target.checked })}>
                    <span>{props.publicChannel2Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic3 ?? false} onChange={e => onChange({ showPublic3: e.target.checked })}>
                    <span>{props.publicChannel3Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic4 ?? false} onChange={e => onChange({ showPublic4: e.target.checked })}>
                    <span>{props.publicChannel4Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic5 ?? false} onChange={e => onChange({ showPublic5: e.target.checked })}>
                    <span>{props.publicChannel5Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic6 ?? false} onChange={e => onChange({ showPublic6: e.target.checked })}>
                    <span>{props.publicChannel6Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic7 ?? false} onChange={e => onChange({ showPublic7: e.target.checked })}>
                    <span>{props.publicChannel7Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic8 ?? false} onChange={e => onChange({ showPublic8: e.target.checked })}>
                    <span>{props.publicChannel8Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic9 ?? false} onChange={e => onChange({ showPublic9: e.target.checked })}>
                    <span>{props.publicChannel9Name}</span>
                </Checkbox>
                <br />
                <Checkbox checked={config?.showPublic10 ?? false} onChange={e => onChange({ showPublic10: e.target.checked })}>
                    <span>{props.publicChannel10Name}</span>
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
                                onChange({ privateChannels: new PrivateChannelSets().toString() });
                                return;
                        }
                    }}>
                    <Radio value={none}>含めない</Radio>
                    <br />
                    <Radio value={some}>全て含める</Radio>
                    <br />
                    <Radio value={custom}>カスタム(完全一致)</Radio>
                </Radio.Group>
                <br />
                {(hiwaSelectValue === custom && participants.size <= 1) && [...participants]
                    .filter(([userUid]) => getUserUid(myAuth) !== userUid)
                    .sort(([, x], [, y]) => x.name.localeCompare(y.name))
                    .map(([userUid, participant]) => {
                        return (
                            <>
                                <Checkbox
                                    key={userUid}
                                    checked={selectedParticipants.has(userUid)}
                                    onChange={newValue => {
                                        const newSelectedParticipants = new Set(selectedParticipants);
                                        if (newValue.target.checked) {
                                            newSelectedParticipants.add(userUid);
                                        } else {
                                            newSelectedParticipants.delete(userUid);
                                        }
                                        onChange({ privateChannels: new PrivateChannelSet(newSelectedParticipants).toString() });
                                    }}>
                                    {participant.name}
                                </Checkbox>
                                <br key={userUid + '<br>'} />
                            </>);
                    })}
                {(hiwaSelectValue === custom && participants.size <= 1) && <Alert type='info' showIcon message='自分以外の入室者がいません。' />}
            </Col>
        </Row>
    </Drawer >);
};

type ChannelNameEditorDrawerProps = {
    visible: boolean;

    onClose: () => void;
} & PublicChannelNames

const ChannelNamesEditor: React.FC<ChannelNameEditorDrawerProps> = (props: ChannelNameEditorDrawerProps) => {
    const { visible, onClose } = props;

    const operate = React.useContext(OperateContext);

    return (<Drawer
        className='cancel-rnd'
        visible={visible}
        title='チャンネル名の編集'
        closable
        onClose={() => onClose()}
        width={500}
        footer={(
            <DrawerFooter
                close={({
                    textType: 'close',
                    onClick: () => onClose()
                })} />)}>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(i => {
            const key = `publicChannel${i}Name` as const;
            return <Row key={i} gutter={drawerGutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>チャンネル{i}</Col>
                <Col span={drawerInputSpan}>
                    <BufferedInput bufferDuration='default' value={props[key]} onChange={e => {
                        if (e.previousValue === e.currentValue) {
                            return;
                        }
                        const setup = Room.createPostOperationSetup();
                        setup[key] = { newValue: e.currentValue };
                        operate(setup);
                    }} />
                </Col>
            </Row>;
        })}
    </Drawer >);
};

type RoomMessageComponentProps = {
    roomId: string;
    message: RoomMessageNameSpace.MessageState | TextNotification;
    participants: ReadonlyMap<string, Participant.State> | undefined;
    showPrivateMessageMembers?: boolean;
} & PublicChannelNames

const RoomMessageComponent: React.FC<RoomMessageComponentProps> = (props: RoomMessageComponentProps) => {
    const { roomId, message, participants, showPrivateMessageMembers } = props;

    const myAuth = React.useContext(MyAuthContext);
    const [editMessageMutation] = useEditMessageMutation();
    const [deleteMessageMutation] = useDeleteMessageMutation();
    const [makeMessageNotSecret] = useMakeMessageNotSecretMutation();
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

    const roomMessage = message.type === privateMessage || message.type === publicMessage ? message.value : null;

    let createdByMe: boolean | null;
    if (typeof myAuth === 'string' || roomMessage == null) {
        createdByMe = null;
    } else {
        createdByMe = (myAuth.uid === roomMessage.createdBy);
    }

    const createdAt = message.type === privateMessage || message.type === publicMessage ? message.value.createdAt : message.createdAt as number | undefined;
    let datetime: string | null = null;
    if (createdAt != null) {
        datetime = moment(new Date(createdAt)).format('YYYY/MM/DD HH:mm:ss');
    }

    let updatedInfo: JSX.Element | null = null;
    if (roomMessage?.updatedAt != null) {
        if (roomMessage.text == null) {
            updatedInfo = (
                <Tooltip title={`${moment(new Date(roomMessage.updatedAt)).format('YYYY/MM/DD HH:mm:ss')}に削除されました`}>
                    <span style={({ color: 'gray' })}>(削除済み)</span>
                </Tooltip>
            );
        } else {
            updatedInfo = (
                <Tooltip title={`${moment(new Date(roomMessage.updatedAt)).format('YYYY/MM/DD HH:mm:ss')}に編集されました`}>
                    <span style={({ color: 'gray' })}>(編集済み)</span>
                </Tooltip>
            );
        }
    }

    let privateMessageMembersInfo: JSX.Element | null = null;
    if (showPrivateMessageMembers && message.type === privateMessage) {
        if (message.value.visibleTo.length === 0) {
            privateMessageMembersInfo = <div>(独り言)</div>;
        } else {
            const visibleTo = message.value.visibleTo.map(v => participants?.get(v)?.name ?? v).sort((x, y) => x.localeCompare(y));
            privateMessageMembersInfo = <Popover content={<ul>{visibleTo.map((str, i) => <li key={i}>{str}</li>)}</ul>}>
                <div style={{ maxWidth: 100, textOverflow: 'ellipsis' }}>{visibleTo.reduce((seed, elem, i) => i === 0 ? elem : `${seed}, ${elem}`, '')}</div>
            </Popover>;
        }
    }
    const notSecretMenuItem = (roomMessage?.isSecret === true && roomMessage.createdBy != null && roomMessage.createdBy === getUserUid(myAuth)) ?
        <Menu.Item
            onClick={() => {
                makeMessageNotSecret({ variables: { messageId: roomMessage.messageId, roomId } });
            }}>
            公開
        </Menu.Item>
        : null;
    const editMenuItem = (roomMessage != null && createdByMe === true && roomMessage.commandResult == null) ?
        <Menu.Item onClick={() => {
            setIsEditModalVisible(true);
        }}>
            編集
        </Menu.Item> :
        null;
    const deleteMenuItem = (roomMessage != null && createdByMe === true) ?
        <Menu.Item onClick={() => {
            deleteMessageMutation({ variables: { messageId: roomMessage.messageId, roomId } });
        }}>
            削除
        </Menu.Item> :
        null;
    const allMenuItemsAreNull = notSecretMenuItem == null && editMenuItem == null && deleteMenuItem == null;
    const menuItems =
        <>
            {notSecretMenuItem}
            {editMenuItem}
            {deleteMenuItem}
        </>;
    return (
        <div style={({ display: 'grid', gridTemplateRows: `${headerHeight}px 1fr`, gridTemplateColumns: '1fr 40px', marginBottom: 4, marginTop: 4 })}>
            <div style={({ gridRow: '1 / 2', gridColumn: '1 / 2', display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                <div style={({ flex: '0 0 auto' })}>
                    {message.type === privateMessage || message.type === publicMessage && RoomMessageNameSpace.userName(message, participants ?? new Map())}
                </div>
                <div style={({ flex: '0 0 auto', color: 'gray', marginLeft: 6 })}>{message.type !== privateMessage && message.type !== publicMessage ? '(ログ)' : RoomMessageNameSpace.toChannelName(message, props, participants ?? new Map())}</div>
                <div style={({ flex: '0 0 auto', color: 'gray', marginLeft: 6 })}>{datetime}</div>
                {privateMessageMembersInfo != null && <div style={{ flex: '0 0 auto', width: 6 }} />}
                {privateMessageMembersInfo}
                {updatedInfo == null ? null : <div style={({ flex: '0 0 auto', width: 6 })} />}
                {updatedInfo}
                <div style={({ flex: 1 })} />
            </div>
            {message.type === privateMessage || message.type === publicMessage ? <RoomMessageNameSpace.Content style={{ overflowWrap: 'break-word', gridRow: '2 / 3', gridColumn: '1 / 2', minHeight: contentMinHeight }} message={message} /> : <div style={{ overflowWrap: 'break-word', gridRow: '2 / 3', gridColumn: '1 / 2', minHeight: contentMinHeight }}>{message.message}</div>}
            <div style={({ gridRow: '1 / 3', gridColumn: '2 / 3', justifySelf: 'center', alignSelf: 'center' })} >
                {allMenuItemsAreNull ? null : <Dropdown overlay={<Menu>{menuItems}</Menu>} trigger={['click']}>
                    <Button type='text' size='small'><Icon.EllipsisOutlined /></Button>
                </Dropdown>}
            </div>
            <InputModal
                title='メッセージの編集'
                visible={isEditModalVisible}
                onOk={(value, setValue) => {
                    if (roomMessage == null) {
                        return;
                    }
                    editMessageMutation({ variables: { messageId: roomMessage.messageId, roomId, text: value } }).then(() => {
                        setIsEditModalVisible(false);
                        setValue('');
                    });
                }}
                onClose={setValue => {
                    setIsEditModalVisible(false);
                    setValue('');
                }}
                onOpen={setValue => {
                    setValue(roomMessage?.text ?? '');
                }} />
        </div>
    );
};

type MessageTabPaneProps = {
    allRoomMessagesResult: AllRoomMessagesSuccessResult;
    logNotifications: TextNotificationsState;
    participants: ReadonlyMap<string, Participant.State>;
    roomId: string;
    contentHeight: number;
    config: MessageFilter;
} & PublicChannelNames

const MessageTabPane: React.FC<MessageTabPaneProps> = (props: MessageTabPaneProps) => {
    const {
        allRoomMessagesResult,
        logNotifications,
        participants,
        roomId,
        contentHeight,
        config,
    } = props;

    const filter = useMessageFilter(config);

    const thenMap = React.useCallback((messages: ReadonlyArray<Message>) => {
        return [...messages]
            .sort((x, y) => y.value.createdAt - x.value.createdAt)
            .map(message => {
                if (message.type === soundEffect) {
                    // soundEffectはfilterで弾いていなければならない。
                    throw 'soundEffect is not supported';
                }
                return (<RoomMessageComponent
                    publicChannel1Name={props.publicChannel1Name}
                    publicChannel2Name={props.publicChannel2Name}
                    publicChannel3Name={props.publicChannel3Name}
                    publicChannel4Name={props.publicChannel4Name}
                    publicChannel5Name={props.publicChannel5Name}
                    publicChannel6Name={props.publicChannel6Name}
                    publicChannel7Name={props.publicChannel7Name}
                    publicChannel8Name={props.publicChannel8Name}
                    publicChannel9Name={props.publicChannel9Name}
                    publicChannel10Name={props.publicChannel10Name}
                    key={message.type === privateMessage || message.type === publicMessage ? message.value.messageId : message.value.createdAt}
                    roomId={roomId}
                    message={message.type === publicMessage || message.type === privateMessage ? message : message.value}
                    participants={participants} />);
            });
    }, [roomId, participants, props.publicChannel1Name, props.publicChannel2Name, props.publicChannel3Name, props.publicChannel4Name, props.publicChannel5Name, props.publicChannel6Name, props.publicChannel7Name, props.publicChannel8Name, props.publicChannel9Name, props.publicChannel10Name]);

    const messages = useFilteredAndMapRoomMessages({ allRoomMessagesResult, logNotifications, filter, thenMap });
    return <PagenationScroll source={messages} elementMinHeight={headerHeight + contentMinHeight} height={contentHeight} />;
};

type Props = {
    allRoomMessagesResult: AllRoomMessagesResult;
    logNotifications: TextNotificationsState;
    characters: ReadonlyStateMap<Character.State>;
    participants: ReadonlyMap<string, Participant.State>;
    roomId: string;
    height: number;
    panelId: string;
    config: MessagePanelConfig;
} & PublicChannelNames

const RoomMessages: React.FC<Props> = (props: Props) => {
    const { allRoomMessagesResult, logNotifications, characters, participants, roomId, height, panelId, config } = props;

    const contentHeight = Math.max(0, height - 250);
    const tabsHeight = Math.max(0, height - 210);

    const dispatch = useDispatch();

    const [editingTabConfigKey, setEditingTabConfigKey] = React.useState<{ key: string; createdAt: number }>();
    const editingTabConfig = React.useMemo(() => {
        return config.tabs.find(x => x.createdAt === editingTabConfigKey?.createdAt && x.key === editingTabConfigKey?.key);
    }, [config.tabs, editingTabConfigKey?.createdAt, editingTabConfigKey?.key]);

    const [isChannelNamesEditorVisible, setIsChannelNamesEditorVisible] = React.useState(false);

    switch (allRoomMessagesResult.type) {
        case loading:
            return <QueryResultViewer loading compact={false} />;
        case apolloError:
            return <QueryResultViewer loading={false} error={allRoomMessagesResult.error} compact={false} />;
        case failure:
            return <Result status='error' title='エラー' />;
        default:
            break;
    }

    const tabPanels = contentHeight <= 0 ? null : config.tabs.map(tab => {
        return <Tabs.TabPane
            key={tab.key}
            tabKey={tab.key}
            closable={false}
            style={{ backgroundColor: '#FFFFFF08', padding: '0 4px' }}
            tab={<div style={{ display: 'flex', flexDirection: 'row', justifyItems: 'center' }}>
                <div style={{ flex: '0 0 auto', maxWidth: 100 }}>{TabConfig.toTabName(tab)}</div>
                <div style={{ flex: 1 }} />
                <div style={{ flex: '0 0 auto', marginLeft: 15 }} >
                    <Dropdown trigger={['click']} overlay={<Menu>
                        <Menu.Item icon={<Icon.SettingOutlined />} onClick={() => setEditingTabConfigKey(tab)}>編集</Menu.Item>
                        <Menu.Item
                            icon={<Icon.DeleteOutlined />}
                            onClick={() => {
                                Modal.warning({
                                    onOk: () => {
                                        dispatch(roomConfigModule.actions.updateMessagePanel({
                                            roomId,
                                            panelId,
                                            panel: {
                                                tabs: config.tabs.filter(elem => elem.key !== tab.key || elem.createdAt !== tab.createdAt)
                                            }
                                        }));
                                    },
                                    content: 'タブを削除します。よろしいですか？'
                                });
                            }}>削除</Menu.Item>
                    </Menu>}>
                        <Button style={{ width: 16 }} type='text' size='small' icon={<Icon.EllipsisOutlined style={{ opacity: 0.6 }} />} onClick={e => e.stopPropagation()}>
                        </Button>
                    </Dropdown>
                </div>
            </div>}>
            <MessageTabPane
                {...props}
                allRoomMessagesResult={allRoomMessagesResult}
                participants={participants}
                roomId={roomId}
                config={tab}
                contentHeight={contentHeight} />
        </Tabs.TabPane>;
    });

    const marginX = 5;

    return (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '2px 4px' }}>
        <TabEditorDrawer
            {...props}
            config={editingTabConfig}
            onClose={() => setEditingTabConfigKey(undefined)}
            onChange={newValue => {
                dispatch(roomConfigModule.actions.updateMessagePanel({
                    roomId,
                    panelId,
                    panel: {
                        tabs: config.tabs.map(oldValue => oldValue.key === newValue.key && oldValue.createdAt === newValue.createdAt ? newValue : oldValue)
                    }
                }));
            }}
            participants={participants} />
        <ChannelNamesEditor {...props} visible={isChannelNamesEditorVisible} onClose={() => setIsChannelNamesEditorVisible(false)} />
        <Button style={{ margin: `4px ${marginX}px 4px ${marginX}px`, width: 170 }} size='small' onClick={() => setIsChannelNamesEditorVisible(true)}>チャンネルの名前を編集</Button>
        <Tabs
            style={{ flexBasis: `${tabsHeight}px`, margin: `0 ${marginX}px 4px ${marginX}px` }}
            type='editable-card'
            onEdit={(e, type) => {
                if (type === 'remove') {
                    if (typeof e !== 'string') {
                        return;
                    }
                    dispatch(roomConfigModule.actions.updateMessagePanel({
                        roomId,
                        panelId,
                        panel: {
                            tabs: config.tabs.filter(tab => tab.key !== e),
                        }
                    }));
                    return;
                }
                dispatch(roomConfigModule.actions.updateMessagePanel({
                    roomId,
                    panelId,
                    panel: {
                        tabs: [...config.tabs, TabConfig.createEmpty({})],
                    }
                }));
            }}>
            {tabPanels}
        </Tabs>
        <div style={{ flex: 1 }} />
        <ChatInput style={{ flex: 'auto', margin: '0 4px' }} roomId={roomId} characters={characters} participants={participants} config={config} />
    </div>);
};

export default RoomMessages;