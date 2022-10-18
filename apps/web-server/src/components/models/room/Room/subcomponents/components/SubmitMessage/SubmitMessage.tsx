/** @jsxImportSource @emotion/react */
import * as Icon from '@ant-design/icons';
import { $free, PublicChannelKey } from '@flocon-trpg/core';
import {
    WritePrivateMessageDocument,
    WritePublicMessageDocument,
    WriteRoomPublicMessageFailureType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { Button, Input } from 'antd';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import classNames from 'classnames';
import { Draft } from 'immer';
import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import _ from 'lodash';
import React from 'react';
import { useLatest } from 'react-use';
import { Observable } from 'rxjs';
import { useMutation } from 'urql';
import { roomPrivateMessageInputAtom } from '../../atoms/roomPrivateMessageInputAtom/roomPrivateMessageInputAtom';
import { roomPublicMessageInputAtom } from '../../atoms/roomPublicMessageInputAtom/roomPublicMessageInputAtom';
import { useParticipants } from '../../hooks/useParticipants';
import { usePublicChannelNames } from '../../hooks/usePublicChannelNames';
import { SelectedCharacterType, custom, some } from '../ChatInput/getSelectedCharacterType';
import { PrivateMessageChannelSelector } from './subcomponents/components/PrivateMessageChannelSelector/PrivateMessageChannelSelector';
import { PublicMessageChannelSelector } from './subcomponents/components/PublicMessageChannelSelector/PublicMessageChannelSelector';
import { roomNotificationsAtom } from '@/atoms/roomAtom/roomAtom';
import { ChatPalettePanelConfig } from '@/atoms/roomConfigAtom/types/chatPalettePanelConfig';
import { MessagePanelConfig } from '@/atoms/roomConfigAtom/types/messagePanelConfig';
import { userConfigAtom } from '@/atoms/userConfigAtom/userConfigAtom';
import { UserConfigUtils } from '@/atoms/userConfigAtom/utils';
import { UISelector } from '@/components/ui/UISelector/UISelector';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { flex, flexColumn, flexNone } from '@/styles/className';

/* react-virtuosoはおそらくheightを指定しなければ正常に動作しないため、もしこれが可変だとheightの指定が無理とは言わないまでも面倒になる。そのため、70pxという適当な値で固定している */
const height = 70;

/*
次のコードでonSubmitを実行すると、最後にfocus()を実行しているのにもかかわらずTextAreaにfocusされない。理由は、disabled===trueのときにfocusしようとしても無視されるため。


const [isPosting, setIsPosting] = React.useState<boolean>(false);
const textAreaRef = React.useRef(null);

const onSubmit = async () => {
    setIsPosting(true);
    await 投稿する();
    setIsPosting(false);
    textAreaRef.current?.focus();
}

<Input.TextArea ref={textAreaRef} disabled={isPosting} />


それを防ぐため、isPostingの型をbooleanではなくIsPostingStateにして、focusがtrueに変わったタイミングでuseEffectを用いてfocus()を実行するようにしている。
*/
type IsPostingState =
    | {
          isPosting: false;
          focus: boolean;
      }
    | {
          isPosting: true;
          focus: false;
      };

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
    const [, writePrivateMessage] = useMutation(WritePrivateMessageDocument);
    const textAreaRef = React.useRef<TextAreaRef | null>(null);
    const [isPostingState, setIsPostingState] = React.useState<IsPostingState>({
        isPosting: false,
        focus: false,
    });
    React.useEffect(() => {
        if (isPostingState.focus) {
            textAreaRef.current?.focus();
        }
    }, [isPostingState.focus]);
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

    const onPost = (text: string, focusOnFinish: boolean) => {
        if (isPostingState.isPosting || text.trim() === '') {
            return;
        }
        let characterId: string | undefined;
        if (selectedCharacterType === some) {
            characterId = config.selectedCharacterId;
        } else {
            characterId = undefined;
        }
        let customNameVariable: string | undefined;
        if (selectedCharacterType === custom) {
            customNameVariable = config.customCharacterName;
        } else {
            customNameVariable = undefined;
        }
        setIsPostingState({ isPosting: true, focus: false });
        writePrivateMessage({
            roomId,
            text,
            textColor: config.selectedTextColor,
            visibleTo: [...participantIdsOfSendTo],
            characterId,
            customName: customNameVariable,
            gameType: config.selectedGameSystem,
        })
            .then(res => {
                if (res.error != null) {
                    addRoomNotification({
                        type: 'error',
                        error: res.error,
                        createdAt: new Date().getTime(),
                    });
                }

                switch (res.data?.result.__typename) {
                    case 'RoomPrivateMessage':
                        setText('');
                        return;
                    case 'WriteRoomPrivateMessageFailureResult':
                        addRoomNotification({
                            type: 'text',
                            notification: {
                                type: 'error',
                                message: `書き込みの際にエラーが発生しました: ${res.data.result.failureType}`,
                                createdAt: new Date().getTime(),
                            },
                        });
                        return;
                    case 'RoomMessageSyntaxError':
                        addRoomNotification({
                            type: 'text',
                            notification: {
                                type: 'error',
                                message: `文法エラーがあります: ${res.data.result.errorMessage}`,
                                createdAt: new Date().getTime(),
                            },
                        });
                        return;
                    case undefined:
                        return;
                }
            })
            .finally(() => {
                setIsPostingState({ isPosting: false, focus: focusOnFinish });
            });
    };
    const onPostRef = useLatest(onPost);

    React.useEffect(() => {
        if (autoSubmitter == null) {
            return;
        }
        const subscription = autoSubmitter.subscribe(text => onPostRef.current(text, false));
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
                disabled={isPostingState.isPosting}
                value={text}
                placeholder={placeholder}
                onChange={e => {
                    setText(e.target.value);
                }}
                onPressEnter={e => (e.shiftKey ? undefined : onPost(text, true))}
            />
            <Button
                style={{ width: 80 }}
                disabled={isPostingState.isPosting || text.trim() === ''}
                onClick={() => onPost(text, true)}
            >
                {isPostingState.isPosting ? <Icon.LoadingOutlined /> : '投稿'}
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
    const [, writePublicMessage] = useMutation(WritePublicMessageDocument);
    const textAreaRef = React.useRef<TextAreaRef | null>(null);
    const [isPostingState, setIsPostingState] = React.useState<IsPostingState>({
        isPosting: false,
        focus: false,
    });
    React.useEffect(() => {
        if (isPostingState.focus) {
            textAreaRef.current?.focus();
        }
    }, [isPostingState.focus]);
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

    const onPost = (text: string, focusOnFinish: boolean) => {
        if (isPostingState.isPosting || text.trim() === '') {
            return;
        }
        let characterId: string | undefined;
        if (selectedCharacterType === some) {
            characterId = config.selectedCharacterId;
        } else {
            characterId = undefined;
        }
        let customNameVariable: string | undefined;
        if (selectedCharacterType === custom) {
            customNameVariable = config.customCharacterName;
        } else {
            customNameVariable = undefined;
        }

        setIsPostingState({ isPosting: true, focus: false });
        writePublicMessage({
            roomId,
            text,
            textColor: config.selectedTextColor,
            channelKey: selectedPublicChannelKey,
            characterId,
            customName: customNameVariable,
            gameType: config.selectedGameSystem,
        })
            .then(res => {
                if (res.error != null) {
                    addRoomNotification({
                        type: 'error',
                        error: res.error,
                        createdAt: new Date().getTime(),
                    });
                }

                switch (res.data?.result.__typename) {
                    case 'RoomPublicMessage':
                        setText('');
                        return;
                    case 'WriteRoomPublicMessageFailureResult':
                        switch (res.data.result.failureType) {
                            case WriteRoomPublicMessageFailureType.NotAuthorized:
                                addRoomNotification({
                                    type: 'text',
                                    notification: {
                                        type: 'error',
                                        message: '観戦者は雑談チャンネル以外には投稿できません。',
                                        createdAt: new Date().getTime(),
                                    },
                                });
                                return;
                            default:
                                addRoomNotification({
                                    type: 'text',
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
                            type: 'text',
                            notification: {
                                type: 'error',
                                message: `文法エラーがあります: ${res.data.result.errorMessage}`,
                                createdAt: new Date().getTime(),
                            },
                        });
                        return;
                    case undefined:
                        return;
                }
            })
            .finally(() => {
                setIsPostingState({ isPosting: false, focus: focusOnFinish });
            });
    };
    const onPostRef = useLatest(onPost);

    React.useEffect(() => {
        if (autoSubmitter == null) {
            return;
        }
        const subscription = autoSubmitter.subscribe(text => onPostRef.current(text, false));
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
                disabled={isPostingState.isPosting}
                value={text}
                placeholder={placeholder}
                onChange={e => {
                    setText(e.target.value);
                }}
                onPressEnter={e => (e.shiftKey ? undefined : onPost(text, true))}
            />
            <Button
                style={{ width: 80 }}
                disabled={isPostingState.isPosting || text.trim() === ''}
                onClick={() => onPost(text, true)}
            >
                {isPostingState.isPosting ? <Icon.LoadingOutlined /> : '投稿'}
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
    descriptionStyle?: React.CSSProperties;

    // ChatPalettePanelConfigにselectedCharacterTypeは存在しないので、独立させている
    selectedCharacterType: SelectedCharacterType | null;

    // SubmitMessage内部でsubscribeされ、変更があったら自動的に現在の設定で投稿される。
    // depsに渡されるので、useMemoなどを使うことを強く推奨。
    autoSubmitter?: Observable<string>;
};

export const SubmitMessage: React.FC<Props> = ({
    roomId,
    selectedChannelType,
    onSelectedChannelTypeChange,
    config,
    onConfigUpdate,
    descriptionStyle,
    selectedCharacterType,
    autoSubmitter,
}: Props) => {
    const [participantIdsOfSendTo, setParticipantIdsOfSendTo] = React.useState<ReadonlySet<string>>(
        new Set()
    );

    const privateMessageElement = (
        <>
            <PrivateMessageChannelSelector
                participantIdsOfSendTo={participantIdsOfSendTo}
                onParticipantIdsOfSendToChange={setParticipantIdsOfSendTo}
                descriptionStyle={descriptionStyle}
            />
            <PrivateMessageElement
                roomId={roomId}
                config={config}
                selectedCharacterType={selectedCharacterType}
                participantIdsOfSendTo={participantIdsOfSendTo}
                autoSubmitter={autoSubmitter}
            />
        </>
    );

    const publicMessageElement = (
        <>
            <PublicMessageChannelSelector
                config={config}
                onConfigUpdate={onConfigUpdate}
                descriptionStyle={descriptionStyle}
            />
            <PublicMessageElement
                roomId={roomId}
                config={config}
                selectedCharacterType={selectedCharacterType}
                autoSubmitter={autoSubmitter}
            />
        </>
    );

    return (
        <UISelector
            keys={[publicChannel, privateChannel] as const}
            getName={key => (key === privateChannel ? '秘話' : '通常')}
            className={classNames(flexNone, flex, flexColumn)}
            render={key => (key === privateChannel ? privateMessageElement : publicMessageElement)}
            activeKey={selectedChannelType}
            onChange={x => onSelectedChannelTypeChange(x)}
        />
    );
};
