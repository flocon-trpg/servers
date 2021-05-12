import { Popover, Tooltip } from 'antd';
import React from 'react';
import { $free } from '../../@shared/Constants';
import { FilePathFragment, MyValueLogFragment, RoomPrivateMessageFragment, RoomPublicMessageFragment } from '../../generated/graphql';
import { useFirebaseStorageUrl } from '../../hooks/firebaseStorage';
import { myValueLog, privateMessage, publicMessage } from '../../hooks/useRoomMessages';
import { Participant } from '../../stateManagers/states/participant';
import { PrivateChannelSet } from '../../utils/PrivateChannelSet';
import { PublicChannelNames } from '../../utils/types';
import * as Icon from '@ant-design/icons';
import Jdenticon from '../../foundations/Jdenticon';
import { compositeKeyToString } from '../../@shared/StateMap';
import { isDeleted, toText } from '../../utils/message';

export namespace RoomMessage {
    const Image: React.FC<{ filePath: FilePathFragment | undefined }> = ({ filePath }: { filePath: FilePathFragment | undefined }) => {
        const src = useFirebaseStorageUrl(filePath);
        if (src == null) {
            return <Icon.UserOutlined style={({ width: 16, height: 16 })} />;
        }
        return (<img src={src} width={16} height={16} />);
    };

    export type MessageState = {
        type: typeof privateMessage;
        value: Omit<RoomPrivateMessageFragment, 'createdAt'> & { createdAt?: number };
    } | {
        type: typeof publicMessage;
        value: Omit<RoomPublicMessageFragment, 'createdAt'> & { createdAt?: number };
    } | {
        type: typeof myValueLog;
        value: Omit<MyValueLogFragment, 'createdAt'> & { createdAt?: number };
    }

    type ContentProps = {
        style: React.CSSProperties;
        message: MessageState;
    }

    export const Content: React.FC<ContentProps> = ({ style, message }: ContentProps) => {
        if (message.type === myValueLog) {
            const key = compositeKeyToString({ createdBy: message.value.stateUserUid, id: message.value.stateId });

            if (message.value.replaceType === true) {
                return (<div style={style}>
                    {`数値コマ(${key})が新規作成されました`}
                </div>);
            }
            if (message.value.replaceType === false) {
                return (<div style={style}>
                    {`数値コマ(${key})が削除されました`}
                </div>);
            }

            // 現在、どのコマが変更されたかまでは通知していない。
            const changed = [
                message.value.valueChanged ? '値' : null,
                message.value.isValuePrivateChanged ? '公開状態' : null,
                message.value.createdPieces.length === 0 ? null : 'コマ作成',
                message.value.deletedPieces.length === 0 ? null : 'コマ削除',
                message.value.movedPieces.length === 0 ? null : 'コマ移動',
                message.value.resizedPieces.length === 0 ? null : 'コマのリサイズ',
            ].reduce((seed, elem) => {
                if (elem == null) {
                    return seed;
                }
                return seed === '' ? elem : `${seed},${elem}`;
            }, '');

            return (<div style={style}>
                {`数値コマ(${key})において次の変更がありました: ${changed}`}
            </div>);
        }
        if (isDeleted(message.value)) {
            // 当初、削除された場合斜体にして表そうと考えたが、現状はボツにしている。
            // まず、italicなどでは対応してない日本語フォントの場合斜体にならない（対応しているフォントを選べばいいだけの話だが）。なのでtransform: skewX(-15deg)を使おうとしたが、文字列が斜めになることで横幅が少し増えるため、横のスクロールバーが出てしまう問題が出たので却下（x方向のスクロールバーを常に非表示にすれば解決しそうだが、x方向のスクロールバーを表示させたい場合は困る）。
            // ただ、解決策はありそうなのでのちのち斜体にするかもしれない。
            return (<div style={{ ...style, opacity: 0.7 }}>(このメッセージは削除されました)</div>);
        } else {
            return (
                <div style={{ ...style, color: message.value.textColor ?? undefined }}>
                    <Popover content={message.value.initTextSource}>
                        {toText(message.value) ?? message.value.altTextToSecret}</Popover>
                    <span> </span>
                    {message.value.commandResult != null && <span style={({ fontWeight: 'bold' })}>{`${message.value.commandResult.text}${message.value.commandResult.isSuccess === true ? ' (成功)' : ''}${message.value.commandResult.isSuccess === false ? ' (失敗)' : ''}`}</span>}
                    <span> </span>
                    <span style={({ fontWeight: 'bold' })}>{message.value.isSecret ? 'Secret' : ''}</span>
                </div>
            );
        }

    };

    export const userName = (message: MessageState, participants: ReadonlyMap<string, Participant.State>) => {
        if (message.type === myValueLog || message.value.createdBy == null) {
            return null;
        }
        let participantName: string | null = null;
        if (participants != null) {
            participantName = participants.get(message.value.createdBy)?.name ?? null;
        }

        const jdenticon = message.value.createdBy == null ? null : <Jdenticon hashOrValue={message.value.createdBy} size={16} tooltipMode={{ type: 'userUid', userName: participants.get(message.value.createdBy)?.name }} />;

        if (message.value.character == null) {
            if (message.value.customName == null) {
                return (
                    <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                        {jdenticon}
                        <Tooltip title={participantName ?? message.value.createdBy}>
                            {participantName ?? message.value.createdBy}
                        </Tooltip>
                    </div>);
            }
            return (
                <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                    {jdenticon}
                    <Tooltip title={participantName ?? message.value.createdBy}>
                        {message.value.customName}
                    </Tooltip>
                </div>);
        }
        return (
            <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                {jdenticon}
                <Image filePath={message.value.character.image ?? undefined} />
                <Tooltip title={participantName ?? message.value.createdBy}>
                    {message.value.character.name}
                </Tooltip>
            </div>);
    };

    export const toChannelName = (message: MessageState, publicChannelNames: PublicChannelNames, participants: ReadonlyMap<string, Participant.State>) => {
        if (message.type === myValueLog || message.value.createdBy == null) {
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
                const userNames = new PrivateChannelSet(message.value.visibleTo).toChannelNameBase(participants ?? new Map());
                if (userNames.length === 0) {
                    return '秘話:(自分のみ)';
                }
                return userNames.reduce((seed, userName, i) => i === 0 ? `${seed}${userName}` : `${seed},${userName}`, '秘話:');
            }
        }
    };
}