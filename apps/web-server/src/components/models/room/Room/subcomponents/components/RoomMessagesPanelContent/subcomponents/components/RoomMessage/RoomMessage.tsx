import {
    $free,
    State,
    parseDicePiece,
    parseStringPiece,
    participantTemplate,
    replace,
} from '@flocon-trpg/core';
import {
    PieceLogFragmentDoc,
    PieceLogType,
    RoomPrivateMessageFragmentDoc,
    RoomPublicMessageFragmentDoc,
} from '@flocon-trpg/graphql-documents';
import { recordToMap } from '@flocon-trpg/utils';
import {
    CustomMessage,
    PrivateChannelSet,
    pieceLog,
    privateMessage,
    publicMessage,
} from '@flocon-trpg/web-server-utils';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { CombinedError } from 'urql';
import { isDeleted, toText } from '../../../../../utils/message';
import { IconView } from '@/components/models/file/IconView/IconView';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';
import { Jdenticon } from '@/components/ui/Jdenticon/Jdenticon';
import { NewTabLinkify } from '@/components/ui/NewTabLinkify/NewTabLinkify';
import { flex, flexRow, itemsCenter } from '@/styles/className';
import { PublicChannelNames } from '@/utils/types';

type PieceLogFragment = ResultOf<typeof PieceLogFragmentDoc>;
type RoomPrivateMessageFragment = ResultOf<typeof RoomPrivateMessageFragmentDoc>;
type RoomPublicMessageFragment = ResultOf<typeof RoomPublicMessageFragmentDoc>;

type ParticipantState = State<typeof participantTemplate>;

// 改行荒らし対策として、maxHeightを設けている。200pxという値は適当
export const messageContentMaxHeight = 200;

export namespace RoomMessage {
    export type MessageState =
        | {
              type: typeof privateMessage;
              value: Omit<RoomPrivateMessageFragment, 'createdAt'> & { createdAt?: number };
          }
        | {
              type: typeof publicMessage;
              value: Omit<RoomPublicMessageFragment, 'createdAt'> & { createdAt?: number };
          }
        | {
              type: typeof pieceLog;
              value: Omit<PieceLogFragment, 'createdAt'> & { createdAt?: number };
          };

    type ContentProps = {
        style: React.CSSProperties;
        message: MessageState;
    };

    export const Content: React.FC<ContentProps> = ({ style, message }: ContentProps) => {
        if (message.type === pieceLog) {
            switch (message.value.logType) {
                case PieceLogType.Dice: {
                    const key = message.value.stateId;
                    const value = parseDicePiece(message.value.valueJson);
                    if (value.type === 'create') {
                        return (
                            <div style={style}>
                                <Tooltip
                                    title={
                                        <div style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(value, null, 2)}
                                        </div>
                                    }
                                >
                                    {`ダイスコマ(${key})が新規作成されました`}
                                </Tooltip>
                            </div>
                        );
                    }
                    if (value.type === 'delete') {
                        return (
                            <div style={style}>
                                <Tooltip
                                    title={
                                        <div style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(value, null, 2)}
                                        </div>
                                    }
                                >
                                    {`ダイスコマ(${key})が削除されました`}
                                </Tooltip>
                            </div>
                        );
                    }

                    const dice = recordToMap(value.dice ?? {});

                    const changed: (string | null)[] = [];
                    ['1', '2', '3'].forEach(i => {
                        const die = dice.get(i);
                        if (die == null) {
                            return;
                        }
                        if (die.type === replace) {
                            if (die.replace.newValue == null) {
                                changed.push(`ダイス${i}の削除`);
                                return;
                            }
                            changed.push(`ダイス${i}の追加`);
                            return;
                        }
                        if (die.update.dieType != null) {
                            changed.push(`ダイス${i}が${die.update.dieType.newValue}に変更`);
                        }
                        if (die.update.isValueChanged === true) {
                            changed.push(`ダイス${i}の値`);
                        }
                        if (die.update.isValuePrivateChanged != null) {
                            changed.push(`ダイス${i}の公開状態`);
                        }
                    });

                    const changedMessage = changed.reduce((seed, elem) => {
                        if (elem == null) {
                            return seed;
                        }
                        return seed === '' ? elem : `${seed},${elem}`;
                    }, '');

                    return (
                        <div style={style}>
                            <Tooltip
                                title={
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(value, null, 2)}
                                    </div>
                                }
                            >
                                {`ダイスコマ(${key})において次の変更がありました: ${changedMessage}`}
                            </Tooltip>
                        </div>
                    );
                }
                case PieceLogType.String: {
                    const key = message.value.stateId;
                    const value = parseStringPiece(message.value.valueJson);

                    if (value.type === 'create') {
                        return (
                            <div style={style}>
                                <Tooltip
                                    title={
                                        <div style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(value, null, 2)}
                                        </div>
                                    }
                                >
                                    {`文字列コマ(${key})が新規作成されました`}
                                </Tooltip>
                            </div>
                        );
                    }
                    if (value.type === 'delete') {
                        return (
                            <div style={style}>
                                <Tooltip
                                    title={
                                        <div style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(value, null, 2)}
                                        </div>
                                    }
                                >
                                    {`文字列コマ(${key})が削除されました`}
                                </Tooltip>
                            </div>
                        );
                    }

                    const changed = [
                        value.isValueChanged ? '値' : null,
                        value.isValuePrivateChanged ? '公開状態' : null,
                    ].reduce((seed, elem) => {
                        if (elem == null) {
                            return seed;
                        }
                        return seed === '' ? elem : `${seed},${elem}`;
                    }, '');

                    return (
                        <div style={style}>
                            <Tooltip
                                title={
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(value, null, 2)}
                                    </div>
                                }
                            >
                                {`文字列コマ(${key})において次の変更がありました: ${changed}`}
                            </Tooltip>
                        </div>
                    );
                }
            }
        }
        if (isDeleted(message.value)) {
            // 当初、削除された場合斜体にして表そうと考えたが、現状はボツにしている。
            // まず、italicなどでは対応してない日本語フォントの場合斜体にならない（対応しているフォントを選べばいいだけの話だが）。なのでtransform: skewX(-15deg)を使おうとしたが、文字列が斜めになることで横幅が少し増えるため、横のスクロールバーが出てしまう問題が出たので却下（x方向のスクロールバーを常に非表示にすれば解決しそうだが、x方向のスクロールバーを表示させたい場合は困る）。
            // ただ、解決策はありそうなのでのちのち斜体にするかもしれない。
            return <div style={{ ...style, opacity: 0.7 }}>(このメッセージは削除されました)</div>;
        } else {
            return (
                <div
                    style={{
                        ...style,
                        color: message.value.textColor ?? undefined,
                        whiteSpace: 'pre-wrap',
                        maxHeight: messageContentMaxHeight,
                        overflowY: 'auto', // maxHeightを上回った場合はスクロールバーを表示する
                    }}
                >
                    <Popover content={message.value.initTextSource}>
                        <NewTabLinkify>
                            {toText(message.value) ?? message.value.altTextToSecret}
                        </NewTabLinkify>
                    </Popover>
                    <span> </span>
                    {message.value.commandResult != null && (
                        <span style={{ fontWeight: 'bold' }}>{`${message.value.commandResult.text}${
                            message.value.commandResult.isSuccess === true ? ' (成功)' : ''
                        }${
                            message.value.commandResult.isSuccess === false ? ' (失敗)' : ''
                        }`}</span>
                    )}
                    <span> </span>
                    <span style={{ fontWeight: 'bold' }}>
                        {message.value.isSecret ? 'Secret' : ''}
                    </span>
                </div>
            );
        }
    };

    type IconProps = {
        message: MessageState | CustomMessage<NotificationType<CombinedError>>;
        size: number;
    };

    export const Icon: React.FC<IconProps> = ({ message, size }: IconProps) => {
        switch (message.type) {
            case 'custom':
            case pieceLog:
                return <IconView image="Message" size={size} />;
            case privateMessage:
            case publicMessage:
                break;
        }
        if (message.value.createdBy == null) {
            return <IconView image="Message" size={size} />;
        }
        return <IconView image={message.value.character?.image ?? 'Person'} size={size} />;
    };

    export const userName = (
        message: MessageState,
        participants: ReadonlyMap<string, ParticipantState>,
    ) => {
        if (message.type === pieceLog || message.value.createdBy == null) {
            return null;
        }
        let participantName: string | null = null;
        if (participants != null) {
            participantName = participants.get(message.value.createdBy)?.name ?? null;
        }

        const jdenticon =
            message.value.createdBy == null ? null : (
                <Jdenticon
                    hashOrValue={message.value.createdBy}
                    size={16}
                    tooltipMode={{
                        type: 'userUid',
                        userName: participants.get(message.value.createdBy)?.name ?? undefined,
                    }}
                />
            );

        // TODO: 二重Popoverは直感に反しそうなので変える。
        const popoverContent = (
            <div className={classNames(flex, flexRow, itemsCenter)}>
                {jdenticon}
                {participantName ?? message.value.createdBy}
            </div>
        );

        return (
            <Popover trigger="hover" content={popoverContent}>
                <div>
                    {message.value.customName ??
                        message.value.character?.name ??
                        participantName ??
                        message.value.createdBy}
                </div>
            </Popover>
        );
    };

    export const toChannelName = (
        message: MessageState,
        publicChannelNames: PublicChannelNames,
        participants: ReadonlyMap<string, ParticipantState>,
    ) => {
        if (message.type === pieceLog || message.value.createdBy == null) {
            return 'システムメッセージ';
        }
        switch (message.type) {
            case publicMessage: {
                switch (message.value.channelKey) {
                    case $free:
                        return '雑談';
                    case '1':
                        return publicChannelNames.publicChannel1Name;
                    case '2':
                        return publicChannelNames.publicChannel2Name;
                    case '3':
                        return publicChannelNames.publicChannel3Name;
                    case '4':
                        return publicChannelNames.publicChannel4Name;
                    case '5':
                        return publicChannelNames.publicChannel5Name;
                    case '6':
                        return publicChannelNames.publicChannel6Name;
                    case '7':
                        return publicChannelNames.publicChannel7Name;
                    case '8':
                        return publicChannelNames.publicChannel8Name;
                    case '9':
                        return publicChannelNames.publicChannel9Name;
                    case '10':
                        return publicChannelNames.publicChannel10Name;
                    default:
                        return '?';
                }
            }
            case privateMessage: {
                const userNames = new PrivateChannelSet(message.value.visibleTo).toChannelNameBase(
                    participants ?? new Map(),
                );
                if (userNames.length === 0) {
                    return '秘話:(自分のみ)';
                }
                return userNames.reduce(
                    (seed, userName, i) => (i === 0 ? `${seed}${userName}` : `${seed},${userName}`),
                    '秘話:',
                );
            }
        }
    };
}
