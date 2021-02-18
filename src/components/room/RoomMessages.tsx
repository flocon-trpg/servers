import React, { useCallback } from 'react';
import { Comment, message, Tabs, Button, Menu, Dropdown, Tooltip } from 'antd';
import moment from 'moment';
import { AllRoomMessagesSuccessResult, apolloError, failure, loading, useAllRoomMessages, useFilteredRoomMessages, publicChannel, RoomMessage, publicMessage, privateMessage, soundEffect, newEvent } from '../../hooks/useRoomMessages';
import * as Participant from '../../stateManagers/states/participant';
import { __ } from '../../@shared/collection';
import useConstant from 'use-constant';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { PrivateChannelSet } from '../../utils/PrivateChannelsSet';
import ChatInput from './ChatInput';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { createPrivateMessageDrawerVisibility } from './RoomComponentsState';
import MyAuthContext from '../../contexts/MyAuthContext';
import { UserOutlined, CommentOutlined, EyeInvisibleOutlined, PlusOutlined } from '@ant-design/icons';
import { $free, $system } from '../../@shared/Constants';
import { useSelector } from '../../store';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import * as Character from '../../stateManagers/states/character';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import { FilePathFragment, FilePathFragmentDoc, RoomPrivateMessageFragment, RoomPublicMessageFragment, RoomSoundEffectFragment, useDeleteMessageMutation, useEditMessageMutation, useMakeMessageNotSecretMutation } from '../../generated/graphql';
import * as Icon from '@ant-design/icons';
import { useFirebaseStorageUrl } from '../../hooks/firebaseStorage';
import InputModal from '../InputModal';
import Jdenticon from '../../foundations/Jdenticon';
import { Howl } from 'howler';
import PlaySoundEffectBehavior from '../../foundations/PlaySoundEffectBehavior';
import { Notification, TextNotification } from './contexts/NotificationContext';

const Image: React.FC<{ filePath: FilePathFragment | undefined }> = ({ filePath }: { filePath: FilePathFragment | undefined }) => {
    const src = useFirebaseStorageUrl(filePath);
    if (src == null) {
        return <Icon.UserOutlined style={({ width: 16, height: 16 })} />;
    }
    return (<img src={src} width={16} height={16} />);
};

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

export const isPublicChannelKey = (source: string): source is PublicChannelKey => {
    return publicChannelKeys.find(key => key === source) !== undefined;
};

export type Tab =
    | PublicChannelKey
    | PrivateChannelSet

const { TabPane } = Tabs;

export type RoomUIMessage = {
    type: typeof privateMessage;
    value: Omit<RoomPrivateMessageFragment, 'createdAt'> & { createdAt?: number };
} | {
    type: typeof publicMessage;
    value: Omit<RoomPublicMessageFragment, 'createdAt'> & { createdAt?: number };
} | {
    type: typeof soundEffect;
    value: { messageId: string };
}

type RoomMessageProps = {
    roomId: string;
    message: RoomUIMessage;
    participantsState: Participant.State | undefined;
    style?: React.CSSProperties;
    characters: ReadonlyStateMap<Character.State>;
}

const deletedMessageStyle: React.CSSProperties = {
    opacity: 0.7,
};

const RoomMessageComponent: React.FC<RoomMessageProps> = ({ roomId, message, participantsState, style, characters }: RoomMessageProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const [editMessageMutation] = useEditMessageMutation();
    const [deleteMessageMutation] = useDeleteMessageMutation();
    const [makeMessageNotSecret] = useMakeMessageNotSecretMutation();
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

    if (message.type == soundEffect) {
        return null;
    }

    let createdByMe: boolean | null;
    if (myAuth == null) {
        createdByMe = null;
    } else {
        createdByMe = (myAuth.uid === message.value.createdBy);
    }

    const nameElement = (() => {
        if (message.value.createdBy == null) {
            return <span style={({ color: 'gray' })}>(システムメッセージ)</span>;
        }
        let participantName: string | null = null;
        if (participantsState != null) {
            participantName = participantsState.get(message.value.createdBy)?.name ?? null;
        }

        let character: Character.State | undefined = undefined;
        if (message.value.characterStateId == null) {
            if (message.value.customName == null) {
                return (
                    <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                        {message.value.createdBy != null && <Jdenticon hashOrValue={message.value.createdBy} size={16} tooltipMode='userUid' />}
                        <Tooltip title={participantName ?? message.value.createdBy}>
                            {participantName ?? message.value.createdBy}
                        </Tooltip>
                    </div>);
            }
            return (
                <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                    {message.value.createdBy != null && <Jdenticon hashOrValue={message.value.createdBy} size={16} tooltipMode='userUid' />}
                    <Tooltip title={participantName ?? message.value.createdBy}>
                        {message.value.customName}
                    </Tooltip>
                </div>);
        } else {
            character = characters.get({ createdBy: message.value.createdBy, id: message.value.characterStateId });
        }
        return (
            <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                {message.value.createdBy != null && <Jdenticon hashOrValue={message.value.createdBy} size={16} tooltipMode='userUid' />}
                <Image filePath={character?.image ?? undefined} />
                <Tooltip title={participantName ?? message.value.createdBy}>
                    {character?.name == null ? message.value.characterName : character.name}
                </Tooltip>
            </div>);
    })();
    let content: JSX.Element;
    if (message.value.text == null && message.value.altTextToSecret == null) {
        // 当初、削除された場合斜体にして表そうと考えたが、現状はボツにしている。
        // まず、italicなどでは対応してない日本語フォントの場合斜体にならない（対応しているフォントを選べばいいだけの話だが）。なのでtransform: skewX(-15deg)を使おうとしたが、文字列が斜めになることで横幅が少し増えるため、横のスクロールバーが出てしまう問題が出たので却下（x方向のスクロールバーを常に非表示にすれば解決しそうだが、x方向のスクロールバーを表示させたい場合は困る）。
        // ただ、解決策はありそうなのでのちのち斜体にするかもしれない。
        content = (<span style={deletedMessageStyle}>(このメッセージは削除されました)</span>);
    } else {
        content = (
            <span>
                {message.value.text ?? message.value.altTextToSecret}
                <span> </span>
                <span style={({ fontWeight: 'bold' })}>{message.value.commandResult}</span>
                <span> </span>
                <span style={({ fontWeight: 'bold' })}>{message.value.isSecret ? 'Secret' : ''}</span>
            </span>);
    }
    const createdAt = message.value.createdAt as number | null | undefined;
    let datetime: string | null = null;
    if (createdAt != null) {
        datetime = moment(new Date(createdAt)).format('YYYY/MM/DD HH:mm:ss');
    }
    let updatedInfo: JSX.Element | null = null;
    if (message.value.updatedAt != null) {
        if (message.value.text == null) {
            updatedInfo = (
                <Tooltip title={`${moment(new Date(message.value.updatedAt)).format('YYYY/MM/DD HH:mm:ss')}に削除されました`}>
                    <span style={({ color: 'gray' })}>(削除済み)</span>
                </Tooltip>
            );
        } else {
            updatedInfo = (
                <Tooltip title={`${moment(new Date(message.value.updatedAt)).format('YYYY/MM/DD HH:mm:ss')}に編集されました`}>
                    <span style={({ color: 'gray' })}>(編集済み)</span>
                </Tooltip>
            );
        }
    }
    const notSecretMenuItem = (message.value.isSecret && message.value.createdBy != null && message.value.createdBy === myAuth?.uid) ?
        <Menu.Item
            onClick={() => {
                makeMessageNotSecret({ variables: { messageId: message.value.messageId, roomId } });
            }}>
            公開
        </Menu.Item>
        : null;
    const editMenuItem = (createdByMe === true && message.value.commandResult == null) ?
        <Menu.Item onClick={() => {
            setIsEditModalVisible(true);
        }}>
            編集
        </Menu.Item> :
        null;
    const deleteMenuItem = createdByMe === true ?
        <Menu.Item onClick={() => {
            deleteMessageMutation({ variables: { messageId: message.value.messageId, roomId } });
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
        <div style={({ ...style, display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginTop: 4 })}>
            <div style={({ flex: '0 0 auto', display: 'flex', flexDirection: 'column' })}>
                <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                    <div style={({ flex: '0 0 auto' })}>
                        {nameElement}
                    </div>
                    <div style={({ flex: '0 0 auto', width: 6 })} />
                    <div style={({ flex: '0 0 auto', color: 'gray' })}>{datetime}</div>
                    {updatedInfo == null ? null : <div style={({ flex: '0 0 auto', width: 6 })} />}
                    {updatedInfo}
                    <div style={({ flex: 1 })} />
                </div>
                <div>
                    {content}
                </div>
            </div>
            <div style={({ flex: 1 })} />
            <div style={({ flex: '0 0 auto' })} >
                {allMenuItemsAreNull ? null : <Dropdown overlay={<Menu>{menuItems}</Menu>} trigger={['click']}>
                    <Button type='text' size='small'><Icon.EllipsisOutlined /></Button>
                </Dropdown>}
            </div>
            <InputModal
                title='メッセージの編集'
                visible={isEditModalVisible}
                onOk={(value, setValue) => {
                    editMessageMutation({ variables: { messageId: message.value.messageId, roomId, text: value } }).then(() => {
                        setIsEditModalVisible(false);
                        setValue('');
                    });
                }}
                onClose={setValue => {
                    setIsEditModalVisible(false);
                    setValue('');
                }}
                onOpen={setValue => {
                    setValue(message.value.text ?? '');
                }} />
        </div>
    );
};

// TODO: itemSizeが適当
const messageItemSize = 60;

type PrivateChannelMessagesProps = {
    roomId: string;
    allRoomMessagesResult: AllRoomMessagesSuccessResult;
    visibleTo: PrivateChannelSet;
    participantsState: Participant.State;
    characters: ReadonlyStateMap<Character.State>;
}

const PrivateChannelMessages: React.FC<PrivateChannelMessagesProps> = ({ roomId, allRoomMessagesResult, visibleTo, participantsState, characters }: PrivateChannelMessagesProps) => {
    const visibleToAsString = visibleTo.toString();
    const filter = useCallback((message: RoomMessage) => {
        if (message.type !== privateMessage) {
            return false;
        }
        return __(new PrivateChannelSet(visibleToAsString).toStringSet()).equal(new Set(message.value.visibleTo));
    }, [visibleToAsString]);
    const messages = useFilteredRoomMessages({ allRoomMessagesResult, filter });
    return (
        <div style={({ height: '100%', overflowY: 'scroll', display: 'flex', flexDirection: 'column' })}>
            {
                messages.reverse().map(message => (<RoomMessageComponent key={message.value.messageId} roomId={roomId} message={message} participantsState={participantsState} characters={characters} />))
            }
        </div>
    );
    // TODO: AutoSizer&FixedSizeListを使うと、RoomMessageComponentのボタンのonClickが何故か実行されないのでとりあえず無効化している。
    // CO:
    // return (
    //     <AutoSizer>
    //         {({ height, width }) => (
    //             <FixedSizeList
    //                 layout="vertical"
    //                 itemCount={messages.length}
    //                 itemSize={messageItemSize}
    //                 width={width}
    //                 height={height}>
    //                 {({ index, style }) => {
    //                     const message = messages[messages.length - index - 1];
    //                     return (<RoomMessageComponent key={message.value.messageId} roomId={roomId} style={style} message={message} participants={participants} characters={characters} />);
    //                 }}
    //             </FixedSizeList>
    //         )}
    //     </AutoSizer>);
};

// useFilteredRoomMessagesの再実行回数を減らすため、ここでfilterをすべて定義している
const publicMessageFilters = {
    $free: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === $free,
    $system: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === $system,
    1: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '1',
    2: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '2',
    3: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '3',
    4: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '4',
    5: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '5',
    6: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '6',
    7: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '7',
    8: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '8',
    9: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '9',
    10: (message: RoomMessage) => message.type === publicMessage && message.value.channelKey === '10',
};

type ChannelMessageTabsProps = {
    allRoomMessagesResult: AllRoomMessagesSuccessResult;
    participantsState: Participant.State;
    roomId: string;
    onActiveTabChange?: (activeTab: Tab) => void;
    style?: Omit<React.CSSProperties, 'height'>;
    characters: ReadonlyStateMap<Character.State>;
    notifications: ReadonlyArray<TextNotification>;
}

const ChannelMessageTabs: React.FC<ChannelMessageTabsProps> = ({ allRoomMessagesResult, participantsState, roomId, onActiveTabChange, style, characters, notifications }: ChannelMessageTabsProps) => {
    const myAuth = React.useContext(MyAuthContext);
    const roomConfig = useSelector(state => state.roomConfigModule);
    const dispatch = useDispatch();

    const channelFreeMessages$ = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[$free] });
    const channelSystemMessages$ = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[$system] });
    const channel1Messages$ = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[1] });
    const channel2Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[2] });
    const channel3Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[3] });
    const channel4Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[4] });
    const channel5Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[5] });
    const channel6Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[6] });
    const channel7Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[7] });
    const channel8Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[8] });
    const channel9Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[9] });
    const channel10Messages = useFilteredRoomMessages({ allRoomMessagesResult, filter: publicMessageFilters[10] });

    const channelSystemMessages: RoomUIMessage[] = (() => {
        const $notifications = notifications.map(notification => {
            return {
                type: publicMessage,
                value: {
                    channelKey: $system,
                    messageId: `${notification.message}@${notification.createdAt}`,
                    text: `通知: ${notification.message} ${notification.description}`,
                    isSecret: false,
                    createdAt: notification.createdAt,
                },
            } as const;
        });
        const base = [...$notifications, ...channelSystemMessages$].sort((x, y) => y.value.createdAt - x.value.createdAt);

        return [{
            type: publicMessage,
            value: {
                channelKey: $system,
                messageId: 'system0',
                text: '（仮メッセージ）ようこそ！',
                isSecret: false,
            }
        } as const, ...base];
    })();
    // 説明用メッセージを付加している。channel1のメッセージを1個以上にすることで、（デフォルトの設定であれば）channel1を必ずUIに表示させるという狙いもある。
    const channelFreeMessages: RoomUIMessage[] = [{
        type: publicMessage,
        value: {
            channelKey: $free,
            messageId: 'free0',
            text: 'ここは参加者と観戦者の全員が書き込めるチャンネルです。',
            isSecret: false,
        }
    }, ...channelFreeMessages$];
    const channel1Messages: RoomUIMessage[] = [{
        type: publicMessage,
        value: {
            channelKey: '1',
            messageId: 'channel0',
            text: 'ここは参加者のみが書き込めるチャンネルです。観戦者は書き込むことはできませんが見ることはできます。',
            isSecret: false,
        }
    }, ...channel1Messages$];

    const createList = (messages: RoomUIMessage[]) => {
        return (
            <div style={({ height: '100%', overflowY: 'scroll', display: 'flex', flexDirection: 'column' })}>
                {
                    messages.reverse().map(message => (<RoomMessageComponent key={message.value.messageId} roomId={roomId} message={message} participantsState={participantsState} characters={characters} />))
                }
            </div>
        );
        // TODO: AutoSizer&FixedSizeListを使うと、RoomMessageComponentのボタンのonClickが何故か実行されないのでとりあえず無効化している。
        // CO:
        // return (
        //     <div style={({ ...style, flex: 'auto' })}>
        //         <AutoSizer>
        //             {({ height, width }) => (
        //                 <FixedSizeList
        //                     layout='vertical'
        //                     itemCount={messages.length}
        //                     itemSize={messageItemSize}
        //                     width={width}
        //                     height={height}>
        //                     {({ index, style }) => {
        //                         const message = messages[messages.length - index - 1];
        //                         if (message == null) {
        //                             return null;
        //                         }
        //                         return (<RoomMessageComponent key={message.value.messageId} roomId={roomId} style={style} message={message} participants={participants} characters={characters} />);
        //                     }}
        //                 </FixedSizeList>
        //             )}
        //         </AutoSizer>
        //     </div>
        // );
    };

    const createPublicChannelName = (publicChannelKey: PublicChannelKey) => {
        if (publicChannelKey === $system) {
            return 'システムメッセージ';
        }
        if (publicChannelKey === $free) {
            return 'フリー';
        }
        return allRoomMessagesResult.value.publicChannels.get(publicChannelKey)?.name ?? `(チャンネル${publicChannelKey})`;
    };

    const createPublicMessagesTabPane = (messages: RoomUIMessage[], publicChannelKey: PublicChannelKey) => {
        const channelName = (() => {
            const name = createPublicChannelName(publicChannelKey);
            if (publicChannelKey === $system) {
                return name;
            }
            return <span><CommentOutlined />{name}</span>;
        })();
        return (
            <TabPane tab={channelName} key={publicChannelKey}>
                <div style={({ height: '100%', display: 'flex', flexDirection: 'column' })}>
                    <ChatInput style={({ flex: 0 })} roomId={roomId} activeTab={publicChannelKey} characters={characters} />
                    {createList(messages)}
                </div>
            </TabPane>
        );
    };

    const createPrivateChannelName = (channel: PrivateChannelSet, showIcon: boolean) => {
        const channelNameBase = channel.toChannelNameBase(participantsState, { userUid: myAuth?.uid ?? '' });
        if (channelNameBase.length === 0) {
            return '独り言';
        }
        const children = __(channelNameBase).flatMap((name, i) => {
            if (i !== 0) {
                return [(<span key={i * 3} style={({ fontStyle: 'italic' })}>{'&'}</span>), (<span key={i * 3 + 1}>{name}</span>)];
            }
            if (showIcon) {
                return [(<UserOutlined key={i * 3} />), (<span key={i * 3 + 2}>{name}</span>)];
            }
            return [(<span key={i * 3 + 2}>{name}</span>)];
        }).toArray();
        return <span>{children}</span>;
    };

    const channelsConfig = roomConfig?.panels.messagesPanel.channels ?? {};
    const showChannel = (channelKey: string): boolean => {
        const show = channelsConfig[channelKey]?.show;
        if (show == null) {
            switch (channelKey) {
                case '1':
                    return channel1Messages.length !== 0;
                case '2':
                    return channel2Messages.length !== 0;
                case '3':
                    return channel3Messages.length !== 0;
                case '4':
                    return channel4Messages.length !== 0;
                case '5':
                    return channel5Messages.length !== 0;
                case '6':
                    return channel6Messages.length !== 0;
                case '7':
                    return channel7Messages.length !== 0;
                case '8':
                    return channel8Messages.length !== 0;
                case '9':
                    return channel9Messages.length !== 0;
                case '10':
                    return channel10Messages.length !== 0;
                default:
                    return true;
            }
        }
        return show;
    };

    const privateChannelElements = allRoomMessagesResult.value.privateChannels.toArray()
        .map(channel => {
            const channelNameBase = channel.toChannelNameBase(participantsState, { userUid: myAuth?.uid ?? '' });
            const tab = createPrivateChannelName(channel, true);
            const tabPane = (
                <TabPane tab={tab} key={channel.toString()}>
                    <ChatInput roomId={roomId} activeTab={channel} characters={characters} />
                    <PrivateChannelMessages roomId={roomId} visibleTo={channel} allRoomMessagesResult={allRoomMessagesResult} participantsState={participantsState} characters={characters} />
                </TabPane>
            );
            return { key: channelNameBase, channel, tabPane, showTab: showChannel(channel.toString()), menuItemContent: createPrivateChannelName(channel, false) };
        })
        .sort((x, y) => {
            let i = 0;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const l = x.key[i];
                const r = y.key[i];
                if (l == null) {
                    if (r == null) {
                        return 0;
                    }
                    return -1;
                }
                if (l !== r) {
                    return l.localeCompare(r);
                }
                i++;
            }
        })
        .map(({ channel, tabPane, showTab, menuItemContent }) => ({ channel, tabPane, showTab, menuItemContent }));

    const publicChannelKeys: PublicChannelKey[] = [
        $system,
        $free,
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
    const addPublicChannelMenuItems = __(publicChannelKeys)
        .compact(channelKey => {
            if (showChannel(channelKey)) {
                return null;
            }
            return <Menu.Item
                key={channelKey}
                onClick={() => dispatch(roomConfigModule.actions.updateChannelVisibility({ roomId, channelKey, newValue: true }))}>
                {createPublicChannelName(channelKey)}
            </Menu.Item>;
        })
        .toArray();
    const addPrivateChannelMenuItems = __(privateChannelElements)
        .compact(({ channel, showTab, menuItemContent }) => {
            if (showTab) {
                return null;
            }
            return <Menu.Item
                key={channel.toString()}
                onClick={() => dispatch(roomConfigModule.actions.updateChannelVisibility({ roomId, channelKey: channel.toString(), newValue: true }))}>
                {menuItemContent}
            </Menu.Item>;
        })
        .toArray();
    const addIconMenuItems = [...addPublicChannelMenuItems, ...addPrivateChannelMenuItems];

    return (
        <Tabs
            type="editable-card"
            size='small'
            hideAdd={addIconMenuItems.length === 0}
            addIcon={(<Dropdown trigger={['click']} overlay={<Menu>{addIconMenuItems}</Menu>}>
                <PlusOutlined />
            </Dropdown>)}
            style={({ height: '100%' })}
            defaultActiveKey={$free}
            onChange={activeTabKey => {
                if (onActiveTabChange == null) {
                    return;
                }
                if (isPublicChannelKey(activeTabKey)) {
                    onActiveTabChange(activeTabKey);
                    return;
                }
                onActiveTabChange(new PrivateChannelSet(activeTabKey));
                return;
            }}
            onEdit={(e, action) => {
                if (typeof e !== 'string') {
                    return;
                }
                if (action === 'add') {
                    return;
                }
                dispatch(roomConfigModule.actions.updateChannelVisibility({ roomId, channelKey: e, newValue: false }));
            }}>
            {showChannel($system) ? createPublicMessagesTabPane(channelSystemMessages, $system) : null}
            {showChannel($free) ? createPublicMessagesTabPane(channelFreeMessages, $free) : null}
            {showChannel('1') ? createPublicMessagesTabPane(channel1Messages, '1') : null}
            {showChannel('2') ? createPublicMessagesTabPane(channel2Messages, '2') : null}
            {showChannel('3') ? createPublicMessagesTabPane(channel3Messages, '3') : null}
            {showChannel('4') ? createPublicMessagesTabPane(channel4Messages, '4') : null}
            {showChannel('5') ? createPublicMessagesTabPane(channel5Messages, '5') : null}
            {showChannel('6') ? createPublicMessagesTabPane(channel6Messages, '6') : null}
            {showChannel('7') ? createPublicMessagesTabPane(channel7Messages, '7') : null}
            {showChannel('8') ? createPublicMessagesTabPane(channel8Messages, '8') : null}
            {showChannel('9') ? createPublicMessagesTabPane(channel9Messages, '9') : null}
            {showChannel('10') ? createPublicMessagesTabPane(channel10Messages, '10') : null}
            {privateChannelElements.map(({ tabPane, showTab }) => {
                if (!showTab) {
                    return null;
                }
                return tabPane;
            })}
        </Tabs>
    );
};

type Props = {
    roomId: string;
    // keyはUserUid
    participantsState: Participant.State;
    onActiveTabChange?: (activeTab: Tab) => void;
    characters: ReadonlyStateMap<Character.State>;
    notifications: ReadonlyArray<TextNotification>;
}

const RoomMessages: React.FC<Props> = ({ roomId, participantsState: participants, onActiveTabChange, characters, notifications }: Props) => {
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const allRoomMessages = useAllRoomMessages({ roomId });
    const [soundEffect, setSoundEffect] = React.useState<{ filePath: FilePathFragment; volume: number }>();

    React.useEffect(() => {
        if (allRoomMessages.type !== newEvent) {
            return;
        }
        if (allRoomMessages.event.__typename !== 'RoomSoundEffect') {
            return;
        }
        setSoundEffect({
            filePath: allRoomMessages.event.file,
            volume: allRoomMessages.event.volume,
        });
    }, [allRoomMessages]);

    switch (allRoomMessages.type) {
        case 'loaded':
        case 'newEvent': {
            return (
                <div style={({ height: '100%', overflowY: 'hidden', display: 'flex', flexDirection: 'column' })}>
                    <Button
                        style={({ flex: 0 })}
                        size='small'
                        onClick={() => dispatch({ type: createPrivateMessageDrawerVisibility, newValue: true })}>
                        プライベートメッセージを作成
                    </Button>
                    <ChannelMessageTabs 
                        style={({ flex: 'auto' })} 
                        allRoomMessagesResult={allRoomMessages}
                        participantsState={participants} 
                        roomId={roomId}
                        onActiveTabChange={onActiveTabChange} 
                        characters={characters}
                        notifications={notifications} />
                    <PlaySoundEffectBehavior value={soundEffect} />
                </div>
            );
        }
        case apolloError:
            // TODO:ちゃんとした見た目にする
            return (<>{allRoomMessages.error.message}</>);
        case loading:
            // TODO:ちゃんとした見た目にする
            return (<>loading...</>);
        case failure:
            // TODO:ちゃんとした見た目にする
            return (<>failure</>);
    }
};

export default RoomMessages;