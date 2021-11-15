/** @jsxImportSource @emotion/react */
import React from 'react';
import { Button, Input } from 'antd';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import * as Icon from '@ant-design/icons';
import { usePublicChannelNames } from '../../hooks/state/usePublicChannelNames';
import { custom, SelectedCharacterType, some } from './getSelectedCharacterType';
import _ from 'lodash';
import { useParticipants } from '../../hooks/state/useParticipants';
import {
    WritePrivateMessageDocument,
    WritePublicMessageDocument,
    WriteRoomPublicMessageFailureType,
} from '@flocon-trpg/typed-document-node';
import { UISelector } from '../UISelector';
import { PrivateMessageChannelSelector } from './PrivateMessageChannelSelector';
import { PublicMessageChannelSelector } from './PublicMessageChannelSelector';
import { Observable } from 'rxjs';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import classNames from 'classnames';
import { flex, flexColumn, flexNone } from '../../utils/className';
import { $free, PublicChannelKey } from '@flocon-trpg/core';
import { useMutation } from '@apollo/client';
import { ChatPalettePanelConfig } from '../../atoms/roomConfig/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '../../atoms/roomConfig/types/messagePanelConfig';
import { userConfigAtom } from '../../atoms/userConfig/userConfigAtom';
import { UserConfigUtils } from '../../atoms/userConfig/utils';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { useAtom } from 'jotai';
import { roomNotificationsAtom, Notification } from '../../atoms/room/roomAtom';
import { Draft } from 'immer';
import { roomPrivateMessageInputAtom } from '../../atoms/inputs/roomPrivateMessageInputAtom';
import { roomPublicMessageInputAtom } from '../../atoms/inputs/roomPublicMessageInputAtom';
import { useUpdateAtom } from 'jotai/utils';

/* react-virtuosoはおそらくheightを指定しなければ正常に動作しないため、もしこれが可変だとheightの指定が無理とは言わないまでも面倒になる。そのため、70pxという適当な値で固定している */
const height = 70;

type PrivateMessageElementProps = {
    roomId: string;
    config: ChatPalettePanelConfig | MessagePanelConfig;
    participantIdsOfSendTo: ReadonlySet<string>;
    selectedCharacterType: SelectedCharacterType | null;
    autoSubmitter?: Observable<string>;
};

const PrivateMessageElement: React.FC<PrivateMessageElementProps> = ({
    roomId,
    config,
    participantIdsOfSendTo,
    selectedCharacterType,
    autoSubmitter,
}: PrivateMessageElementProps) => {
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const [text, setText] = useAtom(roomPrivateMessageInputAtom);
    const [writePrivateMessage] = useMutation(WritePrivateMessageDocument);
    const textAreaRef = React.useRef<TextAreaRef | null>(null);
    const [isPosting, setIsPosting] = React.useState(false); // 現状、並列投稿は「PublicMessage1つとPrivateMessage1つの最大2つまで」という制限になっているが、これは単に実装が楽だからというのが一番の理由。
    const roomMessagesFontSizeDelta = useAtomSelector(
        userConfigAtom,
        state => state?.roomMessagesFontSizeDelta
    );
    const fontSize = UserConfigUtils.getRoomMessagesFontSize(roomMessagesFontSizeDelta ?? 0);
    const participants = useParticipants();
    const selectedParticipantsBase = React.useMemo(
        () =>
            _([...participantIdsOfSendTo])
                .map(id => {
                    const found = participants?.get(id);
                    if (found == null) {
                        return null;
                    }
                    return [id, found] as const;
                })
                .compact()
                .sort(([, x], [, y]) => (x.name ?? '').localeCompare(y.name ?? ''))
                .value(),
        [participantIdsOfSendTo, participants]
    );
    const selectedParticipants = React.useMemo(
        () => selectedParticipantsBase.map(([, participant]) => participant.name ?? ''),
        [selectedParticipantsBase]
    );
    const placeholder = `秘話 (${
        selectedParticipants.length === 0
            ? '自分のみ'
            : selectedParticipants.reduce((seed, elem, i) => {
                  if (i === 0) {
                      return elem;
                  }
                  return `${seed}, ${elem}`;
              }, '' as string)
    }) へ投稿`;

    const onPost = (text: string) => {
        if (isPosting || text.trim() === '') {
            return;
        }
        let characterStateId: string | undefined;
        if (selectedCharacterType === some) {
            characterStateId = config.selectedCharacterStateId;
        } else {
            characterStateId = undefined;
        }
        let customNameVariable: string | undefined;
        if (selectedCharacterType === custom) {
            customNameVariable = config.customCharacterName;
        } else {
            customNameVariable = undefined;
        }
        setIsPosting(true);
        writePrivateMessage({
            variables: {
                roomId,
                text,
                textColor: config.selectedTextColor,
                visibleTo: [...participantIdsOfSendTo],
                characterStateId,
                customName: customNameVariable,
                gameType: config.selectedGameSystem,
            },
        })
            .then(res => {
                switch (res.data?.result.__typename) {
                    case 'RoomPrivateMessage':
                        setText('');
                        return;
                    case 'WriteRoomPrivateMessageFailureResult':
                        addRoomNotification({
                            type: Notification.text,
                            notification: {
                                type: 'error',
                                message: `書き込みの際にエラーが発生しました: ${res.data.result.failureType}`,
                                createdAt: new Date().getTime(),
                            },
                        });
                        return;
                    case 'RoomMessageSyntaxError':
                        addRoomNotification({
                            type: Notification.text,
                            notification: {
                                type: 'error',
                                message: `文法エラーがあります: ${res.data.result.errorMessage}`,
                                createdAt: new Date().getTime(),
                            },
                        });
                        return;
                }
            })
            .finally(() => {
                setIsPosting(false);
                textAreaRef.current?.focus();
            });
    };
    const onPostRef = useReadonlyRef(onPost);

    React.useEffect(() => {
        if (autoSubmitter == null) {
            return;
        }
        const subscription = autoSubmitter.subscribe(text => onPostRef.current(text));
        return () => subscription.unsubscribe();
    }, [autoSubmitter, onPostRef]);

    return (
        <div
            style={{
                flex: 1,
                padding: '0 0 6px 0',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Input.TextArea
                ref={textAreaRef}
                style={{
                    fontSize,
                    resize: 'none',
                    height,
                }}
                disabled={isPosting}
                value={text}
                placeholder={placeholder}
                onChange={e => {
                    setText(e.target.value);
                }}
                onPressEnter={e => (e.shiftKey ? undefined : onPost(text))}
            />
            <Button
                style={{ width: 80 }}
                disabled={isPosting || text.trim() === ''}
                onClick={() => onPost(text)}
            >
                {isPosting ? <Icon.LoadingOutlined /> : '投稿'}
            </Button>
        </div>
    );
};

type PublicMessageElementProps = {
    roomId: string;
    config: ChatPalettePanelConfig | MessagePanelConfig;
    selectedCharacterType: SelectedCharacterType | null;
    autoSubmitter?: Observable<string>;
};

const PublicMessageElement: React.FC<PublicMessageElementProps> = ({
    roomId,
    config,
    selectedCharacterType,
    autoSubmitter,
}: PublicMessageElementProps) => {
    const addRoomNotification = useUpdateAtom(roomNotificationsAtom);
    const [text, setText] = useAtom(roomPublicMessageInputAtom);
    const [writePublicMessage] = useMutation(WritePublicMessageDocument);
    const textAreaRef = React.useRef<TextAreaRef | null>(null);
    const [isPosting, setIsPosting] = React.useState(false); // 現状、並列投稿は「PublicMessage1つとPrivateMessage1つの最大2つまで」という制限になっているが、これは単に実装が楽だからというのが一番の理由。
    const roomMessagesFontSizeDelta = useAtomSelector(
        userConfigAtom,
        state => state?.roomMessagesFontSizeDelta
    );
    const fontSize = UserConfigUtils.getRoomMessagesFontSize(roomMessagesFontSizeDelta ?? 0);
    const publicChannelNames = usePublicChannelNames();
    let selectedPublicChannelKey: PublicChannelKey.Without$System.PublicChannelKey = $free;
    if (PublicChannelKey.Without$System.isPublicChannelKey(config.selectedPublicChannelKey)) {
        selectedPublicChannelKey = config.selectedPublicChannelKey;
    }

    let placeholder: string;
    switch (selectedPublicChannelKey) {
        case $free:
            placeholder = '雑談へ投稿';
            break;
        default:
            placeholder = `${
                publicChannelNames == null
                    ? '?'
                    : publicChannelNames[`publicChannel${selectedPublicChannelKey}Name` as const]
            }へ投稿`;
            break;
    }

    const onPost = (text: string) => {
        if (isPosting || text.trim() === '') {
            return;
        }
        let characterStateId: string | undefined;
        if (selectedCharacterType === some) {
            characterStateId = config.selectedCharacterStateId;
        } else {
            characterStateId = undefined;
        }
        let customNameVariable: string | undefined;
        if (selectedCharacterType === custom) {
            customNameVariable = config.customCharacterName;
        } else {
            customNameVariable = undefined;
        }

        setIsPosting(true);
        writePublicMessage({
            variables: {
                roomId,
                text,
                textColor: config.selectedTextColor,
                channelKey: selectedPublicChannelKey,
                characterStateId,
                customName: customNameVariable,
                gameType: config.selectedGameSystem,
            },
        })
            .then(res => {
                switch (res.data?.result.__typename) {
                    case 'RoomPublicMessage':
                        setText('');
                        return;
                    case 'WriteRoomPublicMessageFailureResult':
                        switch (res.data.result.failureType) {
                            case WriteRoomPublicMessageFailureType.NotAuthorized:
                                addRoomNotification({
                                    type: Notification.text,
                                    notification: {
                                        type: 'error',
                                        message: '観戦者は雑談チャンネル以外には投稿できません。',
                                        createdAt: new Date().getTime(),
                                    },
                                });
                                return;
                            default:
                                addRoomNotification({
                                    type: Notification.text,
                                    notification: {
                                        type: 'error',
                                        message: `書き込みの際にエラーが発生しました: ${res.data.result.failureType}`,
                                        createdAt: new Date().getTime(),
                                    },
                                });
                                return;
                        }
                    case 'RoomMessageSyntaxError':
                        addRoomNotification({
                            type: Notification.text,
                            notification: {
                                type: 'error',
                                message: `文法エラーがあります: ${res.data.result.errorMessage}`,
                                createdAt: new Date().getTime(),
                            },
                        });
                        return;
                }
            })
            .finally(() => {
                setIsPosting(false);
                textAreaRef.current?.focus();
            });
    };
    const onPostRef = useReadonlyRef(onPost);

    React.useEffect(() => {
        if (autoSubmitter == null) {
            return;
        }
        const subscription = autoSubmitter.subscribe(text => onPostRef.current(text));
        return () => subscription.unsubscribe();
    }, [autoSubmitter, onPostRef]);

    return (
        <div
            style={{
                flex: 1,
                padding: '0 0 6px 0',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Input.TextArea
                ref={textAreaRef}
                style={{
                    fontSize,
                    resize: 'none',
                    height: 70 /* react-virtuosoはおそらくheightを指定しなければ正常に動作しないため、もしこれが可変だとheightの指定が無理とは言わないまでも面倒になる。そのため、70pxという適当な値で固定している */,
                }}
                disabled={isPosting}
                value={text}
                placeholder={placeholder}
                onChange={e => {
                    setText(e.target.value);
                }}
                onPressEnter={e => (e.shiftKey ? undefined : onPost(text))}
            />
            <Button
                style={{ width: 80 }}
                disabled={isPosting || text.trim() === ''}
                onClick={() => onPost(text)}
            >
                {isPosting ? <Icon.LoadingOutlined /> : '投稿'}
            </Button>
        </div>
    );
};

export const publicChannel = 'publicChannel';
export const privateChannel = 'privateChannel';
export type SelectedChannelType = typeof publicChannel | typeof privateChannel;

type Props = {
    roomId: string;
    selectedChannelType: SelectedChannelType;
    onSelectedChannelTypeChange: (newValue: SelectedChannelType) => void;
    config: ChatPalettePanelConfig | MessagePanelConfig;
    onConfigUpdate: (
        recipe: (draft: Draft<ChatPalettePanelConfig> | Draft<MessagePanelConfig>) => void
    ) => void;
    // ChatPalettePanelConfigにselectedCharacterTypeは存在しないので、独立させている
    selectedCharacterType: SelectedCharacterType | null;

    // SubmitMessage内部でsubscribeされ、変更があったら自動的に現在の設定で投稿される。
    // depsに渡されるので、useMemoなどを使うことを強く推奨。
    autoSubmitter?: Observable<string>;
};

export const SubmitMessage: React.FC<Props> = (props: Props) => {
    const [participantIdsOfSendTo, setParticipantIdsOfSendTo] = React.useState<ReadonlySet<string>>(
        new Set()
    );

    const privateMessageElement = (
        <>
            <PrivateMessageChannelSelector
                {...props}
                participantIdsOfSendTo={participantIdsOfSendTo}
                onParticipantIdsOfSendToChange={setParticipantIdsOfSendTo}
            />
            <PrivateMessageElement {...props} participantIdsOfSendTo={participantIdsOfSendTo} />
        </>
    );

    const publicMessageElement = (
        <>
            <PublicMessageChannelSelector {...props} />
            <PublicMessageElement {...props} />
        </>
    );

    return (
        <UISelector
            keys={[publicChannel, privateChannel] as const}
            getName={key => (key === privateChannel ? '秘話' : '通常')}
            className={classNames(flexNone, flex, flexColumn)}
            render={key => (key === privateChannel ? privateMessageElement : publicMessageElement)}
            activeKey={props.selectedChannelType}
            onChange={x => props.onSelectedChannelTypeChange(x)}
        />
    );
};
