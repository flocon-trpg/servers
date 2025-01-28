/** @jsxImportSource @emotion/react */
import * as Icons from '@ant-design/icons';
import { css } from '@emotion/react';
import { WritingMessageStatusType } from '@flocon-trpg/graphql-documents';
import { keyNames, recordToMap } from '@flocon-trpg/utils';
import {
    CustomMessage,
    Message,
    PrivateChannelSet,
    PrivateChannelSets,
    pieceLog,
    privateMessage,
    publicMessage,
    soundEffect,
} from '@flocon-trpg/web-server-utils';
import {
    Alert,
    App,
    Button,
    Checkbox,
    Dropdown,
    Input,
    Menu,
    Modal,
    Popover,
    Radio,
    Select,
    Tooltip,
} from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import classNames from 'classnames';
import { Draft } from 'immer';
import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';
import moment from 'moment';
import React from 'react';
import { CombinedError, useMutation } from 'urql';
import { DeleteMessageDoc } from '../../../../../../../graphql/DeleteMessageDoc';
import { EditMessageDoc } from '../../../../../../../graphql/EditMessageDoc';
import { MakeMessageNotSecretDoc } from '../../../../../../../graphql/MakeMessageNotSecretDoc';
import { EditMessageDocument } from '../../../../../../../graphql-codegen/graphql';
import { useMessageFilter } from '../../hooks/useMessageFilter';
import { usePublicChannelNames } from '../../hooks/usePublicChannelNames';
import { useRoomId } from '../../hooks/useRoomId';
import { useRoomMessageQueryStatus } from '../../hooks/useRoomMessageQueryStatus';
import { useWritingMessageStatus } from '../../hooks/useWritingMessageStatus';
import { isDeleted, toText } from '../../utils/message';
import { ChatInput } from '../ChatInput';
import { MessageTabName } from './subcomponents/components/MessageTabName/MessageTabName';
import { RoomMessage as RoomMessageNameSpace } from './subcomponents/components/RoomMessage/RoomMessage';
import { custom, roomConfigAtomFamily } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { MessageFilter } from '@/atoms/roomConfigAtom/types/messageFilter';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { MessageTabConfig } from '@/atoms/roomConfigAtom/types/messageTabConfig';
import { MessageTabConfigUtils } from '@/atoms/roomConfigAtom/types/messageTabConfig/utils';
import { column, row } from '@/atoms/userConfigAtom/types';
import { userConfigAtomFamily } from '@/atoms/userConfigAtom/userConfigAtom';
import { UserConfigUtils } from '@/atoms/userConfigAtom/utils';
import {
    NotificationMain,
    NotificationType,
} from '@/components/models/room/Room/subcomponents/components/Notification/Notification';
import { useParticipants } from '@/components/models/room/Room/subcomponents/hooks/useParticipants';
import { useRoomMessages } from '@/components/models/room/Room/subcomponents/hooks/useRoomMessages';
import { useSetRoomStateWithImmer } from '@/components/models/room/Room/subcomponents/hooks/useSetRoomStateWithImmer';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { DraggableTabs } from '@/components/ui/DraggableTabs/DraggableTabs';
import { InputDescription } from '@/components/ui/InputDescription/InputDescription';
import { InputModal } from '@/components/ui/InputModal/InputModal';
import { JumpToBottomVirtuoso } from '@/components/ui/JumpToBottomVirtuoso/JumpToBottomVirtuoso';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { firebaseUserValueAtom } from '@/hooks/useSetupApp';
import { useSingleExecuteAsync1 } from '@/hooks/useSingleExecuteAsync';
import { Styles } from '@/styles';
import { cancelRnd, flex, flexColumn, flexNone, flexRow, itemsCenter } from '@/styles/className';
import { moveElement } from '@/utils/moveElement';
import { AntdTab } from '@/utils/types';
import { defaultTriggerSubMenuAction } from '@/utils/variables';

const headerHeight = 20;
const contentMinHeight = 22;

const none = 'none';
const some = 'some';
type HiwaSelectValueType = typeof none | typeof some | typeof custom;

const auto = 'auto';

const useParticipantsAsRecord = () => {
    return useRoomStateValueSelector(state => state.participants);
};

type TabEditorModalProps = {
    // これがundefinedの場合、Drawerのvisibleがfalseとみなされる。
    config?: MessageTabConfig;

    onChange: (newValue: MessageTabConfig) => void;
    onClose: () => void;
};

const TabEditorModal: React.FC<TabEditorModalProps> = (props: TabEditorModalProps) => {
    const { config, onChange: onChangeCore, onClose } = props;

    const firebaseUser = useAtomValue(firebaseUserValueAtom);
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
        <Modal
            className={cancelRnd}
            open={config != null}
            title="タブの編集"
            closable
            onCancel={() => onClose()}
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
                <TableRow label="タブ名">
                    <Input
                        value={config?.tabName ?? ''}
                        onChange={e => onChange({ tabName: e.target.value })}
                    />
                    {(config?.tabName ?? '' !== '') ? null : (
                        <>
                            <br />
                            <Alert
                                type="info"
                                showIcon
                                message="タブ名が空白であるため、自動的に決定された名前が表示されます。"
                            />
                        </>
                    )}
                </TableRow>
                <TableDivider />
                <TableRow label="特殊チャンネル">
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
                </TableRow>
                <TableDivider dashed />
                <TableRow label="一般チャンネル">
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
                <TableRow label="秘話">
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
                                                    selectedParticipants,
                                                );
                                                if (newValue.target.checked) {
                                                    newSelectedParticipants.add(userUid);
                                                } else {
                                                    newSelectedParticipants.delete(userUid);
                                                }
                                                onChange({
                                                    privateChannels: new PrivateChannelSet(
                                                        newSelectedParticipants,
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
                        <Alert type="info" showIcon message="自分以外の入室者がいません。" />
                    )}
                </TableRow>
            </Table>
        </Modal>
    );
};

type ChannelNameEditorProps = {
    visible: boolean;

    onClose: () => void;
};

const ChannelNamesEditor: React.FC<ChannelNameEditorProps> = (props: ChannelNameEditorProps) => {
    const { visible, onClose } = props;
    const publicChannelNames = usePublicChannelNames();
    const operateAsStateWithImmer = useSetRoomStateWithImmer();

    return (
        <Modal
            className={cancelRnd}
            open={visible}
            title="チャンネル名の編集"
            closable
            onCancel={() => onClose()}
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
                            label={`チャンネル${i}`}
                        >
                            <CollaborativeInput
                                bufferDuration="default"
                                value={publicChannelNames == null ? '' : publicChannelNames[key]}
                                onChange={currentValue => {
                                    operateAsStateWithImmer(state => {
                                        state[key] = currentValue;
                                    });
                                }}
                            />
                        </TableRow>
                    );
                })}
            </Table>
        </Modal>
    );
};

type RoomMessageComponentProps = {
    message: RoomMessageNameSpace.MessageState | CustomMessage<NotificationType<CombinedError>>;
    showPrivateMessageMembers?: boolean;

    // もしRoomMessageComponent内でusePublicChannelNamesをそれぞれ呼び出す形にすると、画像が読み込まれた瞬間（スクロールでメッセージ一覧を上下するときに発生しやすい）に一瞬だけpublicChannelNamesが何故かnullになる（react-virtuosoの影響？）ため、チャンネル名が一瞬だけ'?'になるためチラついて見えてしまう。そのため、このように外部からpublicChannelNamesを受け取る形にすることで解決している。
    publicChannelNames: ReturnType<typeof usePublicChannelNames>;
};

// margin を使うとvirtuosoで問題が発生するので、代わりにpaddingなどを用いなければならない。
// leftやrightはmarginを使っても大丈夫かもしれないが、改行の有無に関わる可能性があるのでこれらもmarginに置き換えている。
// https://virtuoso.dev/troubleshooting#list-does-not-scroll-to-the-bottom--items-jump-around
// また、例えば「roomId == nullならばとりあえず適当に<div style={{minHeight: 20}} />を返す」といったアプローチだとスクロールが正常にできないといった問題点があるのでこれも避けるべき。おそらく、初めはroomId == nullなので20pxになるが、直後にroomId != nullになるためすぐにheightが代わり、メッセージの数が多いとそのheightのずれが積み重なっておかしくなる、というのが原因だと考えられる。
const RoomMessageComponent: React.FC<RoomMessageComponentProps> = (
    props: RoomMessageComponentProps,
) => {
    const participants = useParticipantsAsRecord();

    const { message, showPrivateMessageMembers, publicChannelNames } = props;

    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const [, editMessageMutation] = useMutation(EditMessageDoc);
    const editMessageAwaited = useSingleExecuteAsync1(
        async ({
            text,
            messageId,
            onResolve,
        }: {
            text: string;
            messageId: string;
            onResolve: () => void;
        }) => {
            if (roomId == null) {
                return;
            }
            await editMessageMutation({
                messageId,
                roomId,
                text,
            }).then(() => onResolve());
        },
    );
    const [, deleteMessageMutation] = useMutation(DeleteMessageDoc);
    const deleteMessageAwaited = useSingleExecuteAsync1(async (messageId: string) => {
        if (roomId == null) {
            return;
        }
        await deleteMessageMutation({ messageId, roomId });
    });
    const [, makeMessageNotSecret] = useMutation(MakeMessageNotSecretDoc);
    const makeMessageNotSecretAwaited = useSingleExecuteAsync1(async (messageId: string) => {
        if (roomId == null) {
            return;
        }
        await makeMessageNotSecret({ messageId, roomId });
    });
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
    const roomId = useRoomId();
    const userUid = useMyUserUid();
    const userConfigAtom = userConfigAtomFamily(userUid);
    const userConfig = useAtomValue(userConfigAtom);
    const roomMessagesFontSizeDelta = userConfig.roomMessagesFontSizeDelta;

    const fontSize = UserConfigUtils.getRoomMessagesFontSize(roomMessagesFontSizeDelta ?? 0);

    const participantsMap = React.useMemo(
        () => (participants == null ? null : recordToMap(participants)),
        [participants],
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
            : message.createdAt;
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
                        'YYYY/MM/DD HH:mm:ss',
                    )}に削除されました`}
                >
                    <span style={{ color: 'gray' }}>(削除済み)</span>
                </Tooltip>
            );
        } else {
            updatedInfo = (
                <Tooltip
                    title={`${moment(new Date(userMessage.updatedAt)).format(
                        'YYYY/MM/DD HH:mm:ss',
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
                            '',
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
                  key: '公開@RoomMessageComponent',
                  label: '公開',
                  disabled: makeMessageNotSecretAwaited.isExecuting,
                  onClick: () => {
                      if (makeMessageNotSecretAwaited.execute == null) {
                          return;
                      }
                      makeMessageNotSecretAwaited.execute(userMessage.messageId);
                  },
              }
            : null;
    const editMenuItem: ItemType =
        userMessage != null && createdByMe === true && userMessage.commandResult == null
            ? {
                  key: '編集@RoomMessageComponent',
                  label: '編集',
                  onClick: () => setIsEditModalVisible(true),
              }
            : null;
    const deleteMenuItem: ItemType =
        userMessage != null && createdByMe === true
            ? {
                  key: '削除@RoomMessageComponent',
                  label: '削除',
                  disabled: deleteMessageAwaited.isExecuting,
                  onClick: () => {
                      if (deleteMessageAwaited.execute == null) {
                          return;
                      }
                      deleteMessageAwaited.execute(userMessage.messageId);
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
                        ? '(ログ)'
                        : publicChannelNames == null
                          ? '?'
                          : RoomMessageNameSpace.toChannelName(
                                message,
                                publicChannelNames,
                                participantsMap ?? new Map(),
                            )}
                </div>
                <div style={{ flex: '0 0 auto', color: 'gray' }}>{datetime}</div>
                {privateMessageMembersInfo}
                {updatedInfo}
                <div style={{ flex: 1 }} />
            </div>
            {message.type === custom ? (
                <div
                    style={{
                        fontSize,
                        overflowWrap: 'break-word',
                        gridRow: '2 / 3',
                        gridColumn: '2 / 3',
                        minHeight: contentMinHeight,
                    }}
                >
                    <NotificationMain notification={message.value} />
                </div>
            ) : (
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
                        <Button type="text" size="small">
                            <Icons.EllipsisOutlined />
                        </Button>
                    </Dropdown>
                )}
            </div>
            <InputModal
                title="メッセージの編集"
                visible={isEditModalVisible}
                isTextArea={true}
                disabled={() => editMessageAwaited.isExecuting}
                onOk={(value, setValue) => {
                    if (editMessageAwaited.execute == null) {
                        return;
                    }
                    if (userMessage == null) {
                        return;
                    }
                    editMessageAwaited.execute({
                        text: value,
                        messageId: userMessage.messageId,
                        onResolve: () => {
                            setIsEditModalVisible(false);
                            setValue('');
                        },
                    });
                }}
                onClose={setValue => {
                    setIsEditModalVisible(false);
                    setValue('');
                }}
                onOpen={setValue => {
                    setValue(userMessage == null ? '' : (toText(userMessage) ?? ''));
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

    const statusBarHeight = 20;

    const firebaseUser = useAtomValue(firebaseUserValueAtom);
    const writingMessageStatusResult = useWritingMessageStatus();
    const publicChannelNames = usePublicChannelNames();
    const participants = useParticipants();

    const filter = useMessageFilter(config);
    const thenMap = React.useCallback(
        (_: unknown, message: Message<NotificationType<CombinedError>>) => {
            if (message.type === soundEffect) {
                // soundEffectはfilterで弾いていなければならない。
                throw new Error('soundEffect is not supported');
            }
            return (
                <RoomMessageComponent
                    key={
                        message.type === privateMessage || message.type === publicMessage
                            ? message.value.messageId
                            : message.type === pieceLog
                              ? message.value.createdAt
                              : message.createdAt
                    }
                    publicChannelNames={publicChannelNames}
                    message={message}
                />
            );
        },
        [publicChannelNames],
    );
    const messages = useRoomMessages({ filter });
    const queryStatus = useRoomMessageQueryStatus();

    // TODO: background-colorが適当
    const statusBarCss = css`
        flex-basis: ${statusBarHeight}px;
        background-color: #10101090;
        padding: 0 4px;
    `;
    let statusBar: JSX.Element | null = null;
    switch (queryStatus.type) {
        case 'success': {
            const writingUsers = (
                writingMessageStatusResult == null ? [] : [...writingMessageStatusResult]
            )
                .filter(
                    ([key, value]) =>
                        key !== firebaseUser?.uid && value === WritingMessageStatusType.Writing,
                )
                .map(([key]) => key)
                .map(userUid => participants?.get(userUid)?.name ?? '')
                .sort();
            if (writingUsers.length >= 3) {
                statusBar = <div css={statusBarCss}>複数人が書き込み中…</div>;
            } else if (writingUsers.length === 0) {
                statusBar = <div css={statusBarCss} />;
            } else {
                statusBar = (
                    <div css={statusBarCss}>
                        {writingUsers.reduce(
                            (seed, elem, i) => (i === 0 ? elem : `${seed}, ${elem}`),
                            '' as string,
                        ) + ' が書き込み中…'}
                    </div>
                );
            }
            break;
        }
        case 'fetching': {
            statusBar = <div css={statusBarCss}>メッセージを API サーバーから取得中です…</div>;
            break;
        }
        case 'error': {
            statusBar = (
                <div css={statusBarCss}>
                    <Tooltip overlay={<div>{JSON.stringify(queryStatus.error)}</div>}>
                        メッセージを API サーバーから取得できませんでした。
                    </Tooltip>
                </div>
            );
            break;
        }
    }

    const content = (
        <JumpToBottomVirtuoso
            items={messages.current ?? []}
            create={thenMap}
            height={contentHeight - statusBarHeight}
        />
    );

    return (
        <div className={classNames(flex, flexColumn)}>
            <div style={{ padding: '0 4px' }}>{content}</div>
            {statusBar}
        </div>
    );
};

type Props = {
    height: number;
    panelId: string;
};

export const RoomMessagesPanelContent: React.FC<Props> = ({ height, panelId }: Props) => {
    const { modal } = App.useApp();

    const roomId = useRoomId();
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const [roomConfig, reduceRoomConfig] = useAtom(roomConfigAtom);
    const tabs = roomConfig.panels.messagePanels[panelId]?.tabs;
    const userUid = useMyUserUid();
    const userConfigAtom = userConfigAtomFamily(userUid);
    const userConfig = useAtomValue(userConfigAtom);
    const setUserConfig = useSetAtom(userConfigAtom);

    const [editingTabConfigKey, setEditingTabConfigKey] = React.useState<string>();
    const editingTabConfig = React.useMemo(() => {
        if (editingTabConfigKey == null) {
            return undefined;
        }
        return tabs?.find(tab => tab.key === editingTabConfigKey);
    }, [tabs, editingTabConfigKey]);

    const [isChannelNamesEditorVisible, setIsChannelNamesEditorVisible] = React.useState(false);

    const roomMessagesFontSizeDelta = userConfig.roomMessagesFontSizeDelta;
    const chatInputDirectionCore = userConfig.chatInputDirection ?? auto;

    // GameSelectorの無駄なrerenderを抑止するため、useCallbackを使っている。
    const onChatInputConfigUpdate = React.useCallback(
        (recipe: (draft: Draft<MessagePanelConfig>) => void) => {
            reduceRoomConfig({
                type: custom,
                action: roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const messagePanel = roomConfig.panels.messagePanels[panelId];
                    if (messagePanel == null) {
                        return;
                    }
                    recipe(messagePanel);
                },
            });
        },
        [panelId, reduceRoomConfig],
    );

    const chatInputDirection =
        chatInputDirectionCore === auto ? (height <= 500 ? row : column) : chatInputDirectionCore;
    const spaceDiff = 60;
    const contentHeight = Math.max(
        0,
        height - 280 - (chatInputDirection === column ? spaceDiff : 0),
    );
    const tabsHeight = Math.max(0, height - 240 - (chatInputDirection === column ? spaceDiff : 0));

    const marginX = 5;

    const draggableTabs = React.useMemo(() => {
        if (tabs == null) {
            return undefined;
        }

        const createTabItem = (tab: MessageTabConfig, tabIndex: number) => {
            const onTabDelete = () => {
                modal.warning({
                    onOk: () => {
                        reduceRoomConfig({
                            type: custom,
                            action: roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const messagePanel = roomConfig.panels.messagePanels[panelId];
                                if (messagePanel == null) {
                                    return;
                                }
                                messagePanel.tabs.splice(tabIndex, 1);
                            },
                        });
                    },
                    okCancel: true,
                    maskClosable: true,
                    closable: true,
                    content: 'タブを削除します。よろしいですか？',
                });
            };

            const result: AntdTab = {
                key: tab.key,
                tabKey: tab.key,
                closable: false,
                style: { backgroundColor: Styles.chatBackgroundColor },
                label: (
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
                                                key: '編集@RoomMessages',
                                                label: '編集',
                                                icon: <Icons.SettingOutlined />,
                                                onClick: () => setEditingTabConfigKey(tab.key),
                                            },
                                            {
                                                key: '削除@RoomMessages',
                                                label: '削除',
                                                icon: <Icons.DeleteOutlined />,
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

                                        // antdのButtonはCSS(.antd-btn-sm)によって padding: 0px 7px が指定されているため、左右に空白ができる。ここではこれを無効化するため、paddingを上書きしている。
                                        padding: '0 2px',
                                    }}
                                    type="text"
                                    size="small"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <Icons.EllipsisOutlined />
                                </Button>
                            </Dropdown>
                        </div>
                    </div>
                ),
                children: <MessageTabPane config={tab} contentHeight={contentHeight} />,
            };
            return result;
        };

        const tabItems =
            contentHeight <= 0 ? [] : tabs.map((tab, tabIndex) => createTabItem(tab, tabIndex));

        return (
            <DraggableTabs
                items={tabItems}
                style={{ flexBasis: `${tabsHeight}px`, margin: `0 ${marginX}px 4px ${marginX}px` }}
                dndType={`MessagePanelTab@${panelId}`}
                type="editable-card"
                onDnd={action => {
                    reduceRoomConfig({
                        type: custom,
                        action: roomConfig => {
                            const messagePanel = roomConfig?.panels.messagePanels[panelId];
                            if (messagePanel == null) {
                                return;
                            }
                            moveElement(messagePanel.tabs, tab => tab.key, action);
                        },
                    });
                }}
                onEdit={(e, type) => {
                    if (type === 'remove') {
                        if (typeof e !== 'string') {
                            return;
                        }
                        reduceRoomConfig({
                            type: custom,
                            action: roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const messagePanel = roomConfig.panels.messagePanels[panelId];
                                if (messagePanel == null) {
                                    return;
                                }
                                const indexToSplice = messagePanel.tabs.findIndex(
                                    tab => tab.key === editingTabConfigKey,
                                );
                                if (indexToSplice >= 0) {
                                    messagePanel.tabs.splice(indexToSplice, 1);
                                }
                            },
                        });
                        return;
                    }
                    reduceRoomConfig({
                        type: custom,
                        action: roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            const messagePanel = roomConfig.panels.messagePanels[panelId];
                            if (messagePanel == null) {
                                return;
                            }
                            messagePanel.tabs.push(MessageTabConfigUtils.createEmpty({}));
                        },
                    });
                }}
            />
        );
    }, [contentHeight, editingTabConfigKey, modal, panelId, reduceRoomConfig, tabs, tabsHeight]);

    if (roomId == null || draggableTabs == null) {
        return null;
    }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '2px 4px' }}
        >
            <TabEditorModal
                config={editingTabConfig}
                onClose={() => setEditingTabConfigKey(undefined)}
                onChange={newValue => {
                    if (editingTabConfigKey == null) {
                        return;
                    }
                    reduceRoomConfig({
                        type: custom,
                        action: roomConfig => {
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
                        },
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
                    size="small"
                    onClick={() => setIsChannelNamesEditorVisible(true)}
                >
                    チャンネルの名前を編集
                </Button>
                <div style={{ width: 16 }} />
                <InputDescription>フォントサイズ</InputDescription>
                <Button
                    size="small"
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
                    size="small"
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
