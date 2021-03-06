/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import {
    Alert,
    Button,
    Checkbox,
    Drawer,
    Dropdown,
    Input,
    Menu,
    Modal,
    Popover,
    Radio,
    Result,
    Select,
    Tabs,
    Tooltip,
} from 'antd';
import moment from 'moment';
import { failure, graphqlError, notFetch, useRoomMessages } from '@/hooks/useRoomMessages';
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
import { ChatInput } from '../ChatInput';
import {
    DeleteMessageDocument,
    EditMessageDocument,
    MakeMessageNotSecretDocument,
    WritingMessageStatusType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import * as Icon from '@ant-design/icons';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { QueryResultViewer } from '@/components/ui/QueryResultViewer/QueryResultViewer';
import { useMessageFilter } from '../../hooks/useMessageFilter';
import { RoomMessage as RoomMessageNameSpace } from './subcomponents/components/RoomMessage/RoomMessage';
import { useWritingMessageStatus } from '../../hooks/useWritingMessageStatus';
import { isDeleted, toText } from '../../utils/message';
import { usePublicChannelNames } from '../../hooks/usePublicChannelNames';
import { useParticipants } from '../../hooks/useParticipants';
import { keyNames, recordToMap, toBeNever } from '@flocon-trpg/utils';
import * as Icons from '@ant-design/icons';
import { InputModal } from '@/components/ui/InputModal/InputModal';
import { JumpToBottomVirtuoso } from '@/components/ui/JumpToBottomVirtuoso/JumpToBottomVirtuoso';
import { cancelRnd, flex, flexColumn, flexNone, flexRow, itemsCenter } from '@/styles/className';
import classNames from 'classnames';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { useMutation } from 'urql';
import { MessageTabConfig } from '@/atoms/roomConfigAtom/types/messageTabConfig';
import { atom } from 'jotai';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { userConfigAtom } from '@/atoms/userConfigAtom/userConfigAtom';
import { UserConfigUtils } from '@/atoms/userConfigAtom/utils';
import { MessageFilter } from '@/atoms/roomConfigAtom/types/messageFilter';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { MessageTabConfigUtils } from '@/atoms/roomConfigAtom/types/messageTabConfig/utils';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { useAtomValue } from 'jotai/utils';
import { MessageTabName } from './subcomponents/components/MessageTabName/MessageTabName';
import { DraggableTabs } from '@/components/ui/DraggableTabs/DraggableTabs';
import { moveElement } from '@/utils/moveElement';
import { column, row } from '@/atoms/userConfigAtom/types';
import { InputDescription } from '@/components/ui/InputDescription/InputDescription';
import { WritableDraft } from 'immer/dist/internal';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { defaultTriggerSubMenuAction } from '@/utils/variables';
import { firebaseUserValueAtom } from '@/pages/_app';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { Styles } from '@/styles';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';

const headerHeight = 20;
const contentMinHeight = 22;

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
    // ?????????undefined????????????Drawer???visible???false?????????????????????
    config?: MessageTabConfig;

    onChange: (newValue: MessageTabConfig) => void;
    onClose: () => void;
};

const TabEditorDrawer: React.FC<TabEditorDrawerProps> = (props: TabEditorDrawerProps) => {
    const { config, onChange: onChangeCore, onClose } = props;

    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const publicChannelNames = usePublicChannelNames();
    const participantsMap = useParticipants();

    const hiwaSelectValue: HiwaSelectValueType = (() => {
        // config == null ?????????????????????????????????????????????????????????????????????none??????????????????
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
            title='???????????????'
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
            <Table>
                <TableRow label='?????????'>
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
                                message='?????????????????????????????????????????????????????????????????????????????????????????????'
                            />
                        </>
                    )}
                </TableRow>
                <TableDivider />
                <TableRow label='?????????????????????'>
                    <Checkbox
                        checked={config?.showNotification ?? false}
                        onChange={e => onChange({ showNotification: e.target.checked })}
                    >
                        <span>??????</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showSystem ?? false}
                        onChange={e => onChange({ showSystem: e.target.checked })}
                    >
                        <span>???????????????????????????</span>
                    </Checkbox>
                    <br />
                    <Checkbox
                        checked={config?.showFree ?? false}
                        onChange={e => onChange({ showFree: e.target.checked })}
                    >
                        <span>??????</span>
                    </Checkbox>
                </TableRow>
                <TableDivider dashed />
                <TableRow label='?????????????????????'>
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
                </TableRow>
                <TableDivider dashed />
                <TableRow label='??????'>
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
                        <Radio value={none}>????????????</Radio>
                        <br />
                        <Radio value={some}>???????????????</Radio>
                        <br />
                        <Radio value={custom}>????????????(????????????)</Radio>
                    </Radio.Group>
                    <br />
                    {hiwaSelectValue === custom &&
                        participantsMap.size <= 1 &&
                        [...participantsMap]
                            .filter(([userUid]) => firebaseUser?.uid !== userUid)
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
                        <Alert type='info' showIcon message='??????????????????????????????????????????' />
                    )}
                </TableRow>
            </Table>
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
            title='???????????????????????????'
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
            <Table>
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(i => {
                    const key = `publicChannel${i}Name` as const;
                    return (
                        <TableRow
                            key={keyNames('RoomMessagesPanelContent', 'ChannelNamesEditor', i)}
                            label={`???????????????${i}`}
                        >
                            <CollaborativeInput
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
                        </TableRow>
                    );
                })}
            </Table>
        </Drawer>
    );
};

type RoomMessageComponentProps = {
    message: RoomMessageNameSpace.MessageState | Notification;
    showPrivateMessageMembers?: boolean;

    // ??????RoomMessageComponent??????usePublicChannelNames????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????publicChannelNames????????????null????????????react-virtuoso?????????????????????????????????????????????????????????'?'?????????????????????????????????????????????????????????????????????????????????????????????publicChannelNames?????????????????????????????????????????????????????????
    publicChannelNames: ReturnType<typeof usePublicChannelNames>;
};

// margin ????????????virtuoso?????????????????????????????????????????????padding??????????????????????????????????????????
// left???right???margin???????????????????????????????????????????????????????????????????????????????????????????????????????????????margin???????????????????????????
// https://virtuoso.dev/troubleshooting#list-does-not-scroll-to-the-bottom--items-jump-around
// ?????????????????????roomId == null?????????????????????????????????<div style={{minHeight: 20}} />???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????roomId == null?????????20px????????????????????????roomId != null????????????????????????height??????????????????????????????????????????????????????height????????????????????????????????????????????????????????????????????????????????????????????????
const RoomMessageComponent: React.FC<RoomMessageComponentProps> = (
    props: RoomMessageComponentProps
) => {
    const participants = useAtomValue(participantsAtom);

    const { message, showPrivateMessageMembers, publicChannelNames } = props;

    const firebaseUser = useAtomValue(firebaseUserValueAtom);
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
    if (firebaseUser == null || userMessage == null) {
        createdByMe = null;
    } else {
        createdByMe = firebaseUser.uid === userMessage.createdBy;
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
                    )}????????????????????????`}
                >
                    <span style={{ color: 'gray' }}>(????????????)</span>
                </Tooltip>
            );
        } else {
            updatedInfo = (
                <Tooltip
                    title={`${moment(new Date(userMessage.updatedAt)).format(
                        'YYYY/MM/DD HH:mm:ss'
                    )}????????????????????????`}
                >
                    <span style={{ color: 'gray' }}>(????????????)</span>
                </Tooltip>
            );
        }
    }

    let privateMessageMembersInfo: JSX.Element | null = null;
    if (showPrivateMessageMembers && message.type === privateMessage) {
        if (message.value.visibleTo.length === 0) {
            privateMessageMembersInfo = <div>(?????????)</div>;
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
    const notSecretMenuItem: ItemType =
        userMessage?.isSecret === true &&
        userMessage.createdBy != null &&
        userMessage.createdBy === firebaseUser?.uid
            ? {
                  key: '??????@RoomMessageComponent',
                  label: '??????',
                  onClick: () => {
                      if (roomId == null) {
                          return;
                      }
                      makeMessageNotSecret({ messageId: userMessage.messageId, roomId });
                  },
              }
            : null;
    const editMenuItem: ItemType =
        userMessage != null && createdByMe === true && userMessage.commandResult == null
            ? {
                  key: '??????@RoomMessageComponent',
                  label: '??????',
                  onClick: () => setIsEditModalVisible(true),
              }
            : null;
    const deleteMenuItem: ItemType =
        userMessage != null && createdByMe === true
            ? {
                  key: '??????@RoomMessageComponent',
                  label: '??????',
                  onClick: () => {
                      if (roomId == null) {
                          return;
                      }
                      deleteMessageMutation({ messageId: userMessage.messageId, roomId });
                  },
              }
            : null;
    const allMenuItemsAreNull =
        notSecretMenuItem == null && editMenuItem == null && deleteMenuItem == null;
    const menuItems: ItemType[] = [notSecretMenuItem, editMenuItem, deleteMenuItem];
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
                        ? '(??????)'
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
                    <Dropdown
                        overlay={
                            <Menu
                                items={menuItems}
                                triggerSubMenuAction={defaultTriggerSubMenuAction}
                            />
                        }
                        trigger={['click']}
                    >
                        <Button type='text' size='small'>
                            <Icon.EllipsisOutlined />
                        </Button>
                    </Dropdown>
                )}
            </div>
            <InputModal
                title='????????????????????????'
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

    const firebaseUser = useAtomValue(firebaseUserValueAtom);
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
                // soundEffect???filter??????????????????????????????????????????
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
    const messages = useRoomMessages({ filter });

    const writingUsers = [...writingMessageStatusResult]
        .filter(
            ([key, value]) =>
                key !== firebaseUser?.uid && value.current === WritingMessageStatusType.Writing
        )
        .map(([key]) => key)
        .map(userUid => participantsMap?.get(userUid)?.name ?? '')
        .sort();
    let writingStatus: JSX.Element | null = null;
    // TODO: background-color?????????
    const writingStatusCss = css`
        flex-basis: ${writingStatusHeight}px;
        background-color: #10101090;
        padding: 0 4px;
    `;
    if (writingUsers.length >= 3) {
        writingStatus = <div css={writingStatusCss}>??????????????????????????????</div>;
    } else if (writingUsers.length === 0) {
        writingStatus = <div css={writingStatusCss} />;
    } else {
        writingStatus = (
            <div css={writingStatusCss}>
                {writingUsers.reduce(
                    (seed, elem, i) => (i === 0 ? elem : `${seed}, ${elem}`),
                    '' as string
                ) + ' ?????????????????????'}
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
                            title='?????????'
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

export const RoomMessagesPanelContent: React.FC<Props> = ({ height, panelId }: Props) => {
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

    // GameSelector????????????rerender????????????????????????useCallback?????????????????????
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

        const createTabPane = (tab: MessageTabConfig, tabIndex: number) => {
            const onTabDelete = () => {
                Modal.warn({
                    onOk: () => {
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const messagePanel = roomConfig.panels.messagePanels[panelId];
                            if (messagePanel == null) {
                                return;
                            }
                            messagePanel.tabs.splice(tabIndex, 1);
                        });
                    },
                    okCancel: true,
                    maskClosable: true,
                    closable: true,
                    content: '???????????????????????????????????????????????????',
                });
            };

            return (
                <Tabs.TabPane
                    key={tab.key}
                    tabKey={tab.key}
                    closable={false}
                    style={{ backgroundColor: Styles.chatBackgroundColor }}
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
                                        <Menu
                                            items={[
                                                {
                                                    key: '??????@RoomMessages',
                                                    label: '??????',
                                                    icon: <Icon.SettingOutlined />,
                                                    onClick: () => setEditingTabConfigKey(tab.key),
                                                },
                                                {
                                                    key: '??????@RoomMessages',
                                                    label: '??????',
                                                    icon: <Icon.DeleteOutlined />,
                                                    onClick: () => onTabDelete(),
                                                },
                                            ]}
                                            triggerSubMenuAction={defaultTriggerSubMenuAction}
                                        />
                                    }
                                >
                                    <Button
                                        style={{
                                            width: 18,
                                            minWidth: 18,

                                            // antd???Button???CSS(.antd-btn-sm)???????????? padding: 0px 7px ????????????????????????????????????????????????????????????????????????????????????????????????????????????padding???????????????????????????
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
        };

        const tabPanels =
            contentHeight <= 0 ? null : tabs.map((tab, tabIndex) => createTabPane(tab, tabIndex));

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
                    ?????????????????????????????????
                </Button>
                <div style={{ width: 16 }} />
                <InputDescription>?????????????????????</InputDescription>
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
                <InputDescription>??????????????????????????????????????????</InputDescription>
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
                    <Select.Option value={auto}>??????</Select.Option>
                    <Select.Option value={column}>???????????????</Select.Option>
                    <Select.Option value={row}>???????????????</Select.Option>
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
