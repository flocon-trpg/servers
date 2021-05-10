import { ReadonlyStateMap } from '../@shared/StateMap';
import { RoomMessages, RoomPrivateMessage, RoomPublicChannelFragment, RoomPublicMessage } from '../generated/graphql';
import { PrivateChannelSet } from './PrivateChannelSet';
import { escape } from 'html-escaper';
import { $free, $system } from '../@shared/Constants';
import moment from 'moment';
import { Participant } from '../stateManagers/states/participant';
import { Character } from '../stateManagers/states/character';
import { PublicChannelNames } from './types';
import { RoomMessage } from '../components/room/RoomMessage';
import { isDeleted, toText } from './message';

const privateMessage = 'privateMessage';
const publicMessage = 'publicMessage';

type CreatedBy = { rolePlayPart?: string; participantNamePart: string }

type RoomMessage = {
    type: typeof privateMessage;
    deleted: true;
    createdAt: number;
    value: {
        text: null;
        channelName: string;
        createdBy: CreatedBy;
        commandResult: string | null;
        textColor: string | null;
    };
} | {
    type: typeof privateMessage;
    deleted: false;
    createdAt: number;
    value: {
        text: string;
        channelName: string;
        createdBy: CreatedBy | null;
        commandResult: string | null;
        textColor: string | null;
    };
} | {
    type: typeof publicMessage;
    deleted: true;
    createdAt: number;
    value: {
        text: null;
        channelName: string;
        createdBy: CreatedBy;
        commandResult: string | null;
        textColor: string | null;
    };
} | {
    type: typeof publicMessage;
    deleted: false;
    createdAt: number;
    value: {
        text: string;
        channelName: string;
        createdBy: CreatedBy | null;
        commandResult: string | null;
        textColor: string | null;
    };
};

const createRoomMessageArray = (props: {
    messages: RoomMessages;
    participants: ReadonlyMap<string, Participant.State>;
    characters: ReadonlyStateMap<Character.State>;
} & PublicChannelNames) => {
    const {
        messages,
        participants,
        characters,
    } = props;

    const result: RoomMessage[] = [];
    const publicChannels = new Map<string, RoomPublicChannelFragment>();
    messages.publicChannels.forEach(ch => publicChannels.set(ch.key, ch));

    const createCreatedBy = ({ createdBy, characterStateId, customName }: { createdBy: string; characterStateId?: string; customName?: string }): { rolePlayPart?: string; participantNamePart: string } => {
        const participantNamePart = participants.get(createdBy)?.name ?? createdBy;
        if (customName != null) {
            return { rolePlayPart: customName, participantNamePart };
        }
        if (characterStateId != null) {
            const characterName = characters.get({ createdBy, id: characterStateId })?.name ?? characterStateId;
            return { rolePlayPart: characterName, participantNamePart };
        }
        return { participantNamePart };
    };

    messages.privateMessages.forEach(msg => {
        const privateChannelSet = new PrivateChannelSet(new Set(msg.visibleTo));
        const channelName = privateChannelSet.toChannelNameBase(participants).reduce((seed, elem, i) => i === 0 ? elem : `${seed}, ${elem}`, '');
        if (isDeleted(msg)) {
            if (msg.createdBy == null) {
                return;
            }
            result.push({
                type: privateMessage,
                deleted: true,
                createdAt: msg.createdAt,
                value: {
                    text: null,
                    createdBy: createCreatedBy({ createdBy: msg.createdBy, characterStateId: msg.character?.stateId ?? undefined, customName: msg.customName ?? undefined }),
                    channelName,
                    commandResult: msg.commandResult?.text ?? null,
                    textColor: msg.textColor ?? null,
                }
            });
            return;
        }
        result.push({
            type: privateMessage,
            deleted: false,
            createdAt: msg.createdAt,
            value: {
                text: toText(msg) ?? '',
                createdBy: msg.createdBy == null ? null : createCreatedBy({ createdBy: msg.createdBy, characterStateId: msg.character?.stateId ?? undefined, customName: msg.customName ?? undefined }),
                channelName,
                commandResult: msg.commandResult?.text ?? null,
                textColor: msg.textColor ?? null,
            }
        });
    });

    messages.publicMessages.forEach(msg => {
        const channelName = RoomMessage.toChannelName({ type: publicMessage, value: msg }, props, new Map());

        if (isDeleted(msg)) {
            if (msg.createdBy == null) {
                return;
            }
            result.push({
                type: publicMessage,
                deleted: true,
                createdAt: msg.createdAt,
                value: {
                    text: null,
                    createdBy: createCreatedBy({ createdBy: msg.createdBy, characterStateId: msg.character?.stateId ?? undefined, customName: msg.customName ?? undefined }),
                    channelName,
                    commandResult: msg.commandResult?.text ?? null,
                    textColor: msg.textColor ?? null,
                }
            });
            return;
        }
        result.push({
            type: publicMessage,
            deleted: false,
            createdAt: msg.createdAt,
            value: {
                text: toText(msg) ?? '',
                createdBy: msg.createdBy == null ? null : createCreatedBy({ createdBy: msg.createdBy, characterStateId: msg.character?.stateId ?? undefined, customName: msg.customName ?? undefined }),
                channelName,
                commandResult: msg.commandResult?.text ?? null,
                textColor: msg.textColor ?? null,
            }
        });
    });

    return result;
};

export const generateAsStaticHtml = (params: {
    messages: RoomMessages;
    participants: ReadonlyMap<string, Participant.State>;
    characters: ReadonlyStateMap<Character.State>;
} & PublicChannelNames) => {
    const elements = createRoomMessageArray(params).sort((x, y) => x.createdAt - y.createdAt).map(msg => {
        const left = msg.value.createdBy == null ?
            '<span>システムメッセージ</span>' :
            `<span>${escape(msg.value.createdBy.rolePlayPart ?? '')}</span>
${(msg.value.createdBy.rolePlayPart == null) ? '' : '<span> - <span>'}
<span>${escape(msg.value.createdBy.participantNamePart)}</span>
<span> (${escape(msg.value.channelName)})</span>
<span> <span>`;

        return `<div class="message" style="${msg.value.textColor == null ? '' : `color: ${msg.value.textColor}`}">
${left}
<span> @ ${moment(new Date(msg.createdAt)).format('MM/DD HH:mm:ss')} </span>
${msg.value.text == null ? '<span class="text gray">(削除済み)</span>' : `<span class="text">${escape(msg.value.text ?? '')} ${escape(msg.value.commandResult ?? '')}</span>`}
</div>`;
    }).reduce((seed, elem) => seed + elem, '');

    return `<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <style>
            .message {
                font-size: small;
                white-space: nowrap;
                margin-bottom: 4;
            }
            .gray {
                color: gray;
            }
            .text {
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div style="display: flex; flex-direction: column">
        ${elements}
        </div>
    </body>
</html>`;
};