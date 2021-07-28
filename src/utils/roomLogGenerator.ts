import {
    FileSourceType,
    RoomMessages,
    RoomPrivateMessage,
    RoomPublicChannelFragment,
    RoomPublicMessage,
} from '../generated/graphql';
import { PrivateChannelSet } from './PrivateChannelSet';
import { escape } from 'html-escaper';
import moment from 'moment';
import { PublicChannelNames } from './types';
import { messageContentMaxHeight, RoomMessage } from '../pageComponents/room/RoomMessage';
import { isDeleted, toText } from './message';
import { ParticipantState } from '@kizahasi/flocon-core';
import { Color } from './color';
import { FilePath } from './filePath';
import axios from 'axios';
import JSZip from 'jszip';
import { Config } from '../config';
import { analyzeUrl } from './analyzeUrl';
import { simpleId } from './generators';
import { ExpiryMap } from './expiryMap';
import { htmPreact } from './richLogResource/htmPreact';
import { logCss } from './richLogResource/logCss';
import { richLogRenderJs } from '../generated/richLogRenderJs';
import { logHtml } from './richLogResource/logHtml';

const privateMessage = 'privateMessage';
const publicMessage = 'publicMessage';

type CreatedBy = { rolePlayPart?: string; participantNamePart: string; characterImage?: FilePath };

type RoomMessage =
    | {
          type: typeof privateMessage;
          deleted: true;
          createdAt: number;
          value: {
              messageId: string;
              text: null;
              channelName: string;
              createdBy: CreatedBy;
              commandResult: string | null;
              textColor: string | null;
          };
      }
    | {
          type: typeof privateMessage;
          deleted: false;
          createdAt: number;
          value: {
              messageId: string;
              text: string;
              channelName: string;
              createdBy: CreatedBy | null;
              commandResult: string | null;
              textColor: string | null;
          };
      }
    | {
          type: typeof publicMessage;
          deleted: true;
          createdAt: number;
          value: {
              messageId: string;
              text: null;
              channelName: string;
              createdBy: CreatedBy;
              commandResult: string | null;
              textColor: string | null;
          };
      }
    | {
          type: typeof publicMessage;
          deleted: false;
          createdAt: number;
          value: {
              messageId: string;
              text: string;
              channelName: string;
              createdBy: CreatedBy | null;
              commandResult: string | null;
              textColor: string | null;
          };
      };

type RoomMessageFilter = {
    privateMessage: (value: RoomPrivateMessage) => boolean;
    publicMessage: (value: RoomPublicMessage) => boolean;
};

const createRoomMessageArray = (
    props: {
        messages: RoomMessages;
        participants: ReadonlyMap<string, ParticipantState>;
        filter: RoomMessageFilter;
    } & PublicChannelNames
): RoomMessage[] => {
    const { messages, participants, filter } = props;

    const result: RoomMessage[] = [];
    const publicChannels = new Map<string, RoomPublicChannelFragment>();
    messages.publicChannels.forEach(ch => publicChannels.set(ch.key, ch));

    const createCreatedBy = ({
        createdBy,
        characterName,
        customName,
        characterImage,
    }: {
        createdBy: string;
        characterName?: string;
        customName?: string;
        characterImage?: FilePath;
    }): CreatedBy => {
        const participantNamePart = participants.get(createdBy)?.name ?? createdBy;
        if (customName != null) {
            return { rolePlayPart: customName, participantNamePart, characterImage };
        }
        if (characterName != null) {
            return { rolePlayPart: characterName, participantNamePart, characterImage };
        }
        return { participantNamePart, characterImage };
    };

    messages.privateMessages
        .filter(msg => filter.privateMessage(msg))
        .forEach(msg => {
            const privateChannelSet = new PrivateChannelSet(new Set(msg.visibleTo));
            const channelName = privateChannelSet
                .toChannelNameBase(participants)
                .reduce((seed, elem, i) => (i === 0 ? elem : `${seed}, ${elem}`), '');
            if (isDeleted(msg)) {
                if (msg.createdBy == null) {
                    return;
                }
                result.push({
                    type: privateMessage,
                    deleted: true,
                    createdAt: msg.createdAt,
                    value: {
                        messageId: msg.messageId,
                        text: null,
                        createdBy: createCreatedBy({
                            createdBy: msg.createdBy,
                            characterName: msg.character?.name,
                            characterImage: msg.character?.image ?? undefined,
                            customName: msg.customName ?? undefined,
                        }),
                        channelName,
                        commandResult: msg.commandResult?.text ?? null,
                        textColor: msg.textColor ?? null,
                    },
                });
                return;
            }
            result.push({
                type: privateMessage,
                deleted: false,
                createdAt: msg.createdAt,
                value: {
                    messageId: msg.messageId,
                    text: toText(msg) ?? '',
                    createdBy:
                        msg.createdBy == null
                            ? null
                            : createCreatedBy({
                                  createdBy: msg.createdBy,
                                  characterName: msg.character?.name,
                                  characterImage: msg.character?.image ?? undefined,
                                  customName: msg.customName ?? undefined,
                              }),
                    channelName,
                    commandResult: msg.commandResult?.text ?? null,
                    textColor: msg.textColor ?? null,
                },
            });
        });

    messages.publicMessages
        .filter(msg => filter.publicMessage(msg))
        .forEach(msg => {
            const channelName = RoomMessage.toChannelName(
                { type: publicMessage, value: msg },
                props,
                new Map()
            );

            if (isDeleted(msg)) {
                if (msg.createdBy == null) {
                    return;
                }
                result.push({
                    type: publicMessage,
                    deleted: true,
                    createdAt: msg.createdAt,
                    value: {
                        messageId: msg.messageId,
                        text: null,
                        createdBy: createCreatedBy({
                            createdBy: msg.createdBy,
                            characterName: msg.character?.name,
                            characterImage: msg.character?.image ?? undefined,
                            customName: msg.customName ?? undefined,
                        }),
                        channelName,
                        commandResult: msg.commandResult?.text ?? null,
                        textColor: msg.textColor ?? null,
                    },
                });
                return;
            }
            result.push({
                type: publicMessage,
                deleted: false,
                createdAt: msg.createdAt,
                value: {
                    messageId: msg.messageId,
                    text: toText(msg) ?? '',
                    createdBy:
                        msg.createdBy == null
                            ? null
                            : createCreatedBy({
                                  createdBy: msg.createdBy,
                                  characterName: msg.character?.name,
                                  characterImage: msg.character?.image ?? undefined,
                                  customName: msg.customName ?? undefined,
                              }),
                    channelName,
                    commandResult: msg.commandResult?.text ?? null,
                    textColor: msg.textColor ?? null,
                },
            });
        });

    return result;
};

type GenerateLogParams = {
    messages: RoomMessages;
    participants: ReadonlyMap<string, ParticipantState>;
    filter: RoomMessageFilter;
} & PublicChannelNames;

export const generateAsStaticHtml = (params: GenerateLogParams) => {
    const elements = createRoomMessageArray(params)
        .sort((x, y) => x.createdAt - y.createdAt)
        .map(msg => {
            const left =
                msg.value.createdBy == null
                    ? '<span>システムメッセージ</span>'
                    : `<span>${escape(msg.value.createdBy.rolePlayPart ?? '')}</span>
${msg.value.createdBy.rolePlayPart == null ? '' : '<span> - </span>'}
<span>${escape(msg.value.createdBy.participantNamePart)}</span>
<span> (${escape(msg.value.channelName)})</span>
<span> </span>`;

            return `<div class="message" style="${
                msg.value.textColor == null ? '' : `color: ${escape(msg.value.textColor)}`
            }">
${left}
<span> @ ${moment(new Date(msg.createdAt)).format('MM/DD HH:mm:ss')} </span>
${
    msg.value.text == null
        ? '<span class="text gray">(削除済み)</span>'
        : `<span class="text">${escape(msg.value.text ?? '')} ${escape(
              msg.value.commandResult ?? ''
          )}</span>`
}
</div>`;
        })
        .reduce((seed, elem) => seed + '\r\n' + elem, '');

    return `<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <style>
            html {
                background-color: ${Color.chatBackgroundColor};
                color: white;
            }
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
                white-space: pre-wrap;
                max-height: ${messageContentMaxHeight}px;
                overflow-y: auto;
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

type ImageResult = {
    blob: Blob;
    filename: string;
};

class ImageDownloader {
    // keyはgetDownloadURL()する前のpath
    // valueがnullの場合はnot foundなどを表し、二度とダウンロードを試みない
    private readonly firebaseImages = new Map<string, ImageResult | null>();

    // keyはdirectLink
    // valueがnullの場合はnot foundなどを表し、二度とダウンロードを試みない
    private readonly defaultImages = new Map<string, ImageResult | null>();

    public constructor(
        private readonly config: Config,
        private readonly firebaseStorageUrlCache: ExpiryMap<string, string>
    ) {}

    public async download(filePath: FilePath): Promise<ImageResult | null> {
        if (filePath.sourceType === FileSourceType.FirebaseStorage) {
            const cache = this.firebaseImages.get(filePath.path);
            if (cache !== undefined) {
                return cache;
            }
        } else {
            const cache = this.defaultImages.get(analyzeUrl(filePath.path).directLink);
            if (cache !== undefined) {
                return cache;
            }
        }

        const imgUrl = await FilePath.getUrl(filePath, this.config, this.firebaseStorageUrlCache);
        if (imgUrl == null) {
            if (filePath.sourceType === FileSourceType.FirebaseStorage) {
                this.firebaseImages.set(filePath.path, null);
            } else {
                throw new Error(thisShouldNotHappen);
            }
            // CONSIDER: 何らかの通知をしたほうがいいか？
            return null;
        }
        const { directLink, fileExtension } = analyzeUrl(imgUrl);
        const image = await axios.get(directLink, { responseType: 'blob' }).catch(() => null);
        if (image == null) {
            if (filePath.sourceType === FileSourceType.FirebaseStorage) {
                this.firebaseImages.set(filePath.path, null);
            } else {
                this.defaultImages.set(directLink, null);
            }
            // CONSIDER: 何らかの通知をしたほうがいいか？
            return null;
        }
        const result: ImageResult = {
            // Firebase Storageのファイル名は長すぎる上に%などの文字が含まれており、imgのsrcに渡すと正常に動作しない、messages.jsのファイルサイズが大きくなるという2つの問題点があるため、ランダムな文字列に置き換えている。
            // image1, image2... のように番号を順に割り振ったファイル名のほうがユーザーによるカスタマイズが行いやすいためこちらのほうが良いが、少し面倒なので現時点では却下している。
            filename: fileExtension == null ? `${simpleId()}` : `${simpleId()}.${fileExtension}`,
            blob: new Blob([image.data]),
        };
        if (filePath.sourceType === FileSourceType.FirebaseStorage) {
            this.firebaseImages.set(filePath.path, result);
        } else {
            this.defaultImages.set(directLink, result);
        }
        return result;
    }
}

// preactのコードとすり合わせて決めなければならない
type RichLogMessageProps = {
    id: string;
    characterName: string | undefined;
    userName: string;
    textColor: string;
    text: string;
    avatar: string | undefined;
};

const thisShouldNotHappen = 'This should not happen';

export const generateAsRichLog = async (
    params: GenerateLogParams,
    config: Config,
    firebaseStorageUrlCache: ExpiryMap<string, string>
): Promise<Blob> => {
    const imageDownloader = new ImageDownloader(config, firebaseStorageUrlCache);
    const zip = new JSZip();

    const cssFolder = zip.folder('css');
    if (cssFolder == null) {
        throw new Error(thisShouldNotHappen);
    }
    cssFolder.file('main.css', logCss);

    const imgFolder = zip.folder('img');
    if (imgFolder == null) {
        throw new Error(thisShouldNotHappen);
    }
    const nonameImage = await axios
        .get('/log/noname.png', { responseType: 'blob' })
        .catch(() => null);
    if (nonameImage != null) {
        imgFolder.file('noname.png', nonameImage.data);
    }

    const imgAvatarFolder = imgFolder.folder('avatar');
    if (imgAvatarFolder == null) {
        throw new Error(thisShouldNotHappen);
    }
    const messageProps: RichLogMessageProps[] = [];
    for (const msg of createRoomMessageArray(params).sort((x, y) => x.createdAt - y.createdAt)) {
        if (msg.type === privateMessage) {
            // TODO: 実装する
            continue;
        }
        if (msg.deleted) {
            continue;
        }
        if (msg.value.createdBy == null) {
            // 単なるシステムメッセージは無視してcontinueしている
            continue;
        }
        let avatar: string | undefined = undefined;
        if (msg.value.createdBy.characterImage != null) {
            const image = await imageDownloader.download(msg.value.createdBy.characterImage);
            if (image != null) {
                imgAvatarFolder.file(image.filename, image.blob);
                avatar = `./img/avatar/${image.filename}`;
            }
        }
        messageProps.push({
            id: msg.value.messageId,
            text: msg.value.text,
            textColor: msg.value.textColor ?? 'white',
            characterName: msg.value.createdBy.rolePlayPart,
            userName: msg.value.createdBy.participantNamePart,
            avatar,
        });
    }

    const jsFolder = zip.folder('js');
    if (jsFolder == null) {
        throw new Error(thisShouldNotHappen);
    }
    jsFolder.file('htmPreact.js', htmPreact);
    jsFolder.file('renderToBody.js', richLogRenderJs);
    jsFolder.file('preactProps.js', `const preactProps = ${JSON.stringify({ messages: messageProps })}`);
    jsFolder.file(
        'source.txt',
        'htmPreact.js: https://unpkg.com/htm@3.1.0/preact/standalone.umd.js'
    );

    zip.file('index.html', logHtml);

    return await zip.generateAsync({ type: 'blob' });
};
