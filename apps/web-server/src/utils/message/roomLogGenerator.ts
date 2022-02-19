import {
    FileSourceType,
    RoomMessages,
    RoomPublicChannelFragment,
} from '@flocon-trpg/typed-document-node';
import { PrivateChannelSet } from './PrivateChannelSet';
import { escape } from 'html-escaper';
import moment from 'moment';
import { PublicChannelNames } from '../types';
import {
    messageContentMaxHeight,
    RoomMessage,
} from '../../components/contextual/room/message/RoomMessage';
import { isDeleted, toText } from './message';
import { Default, FirebaseStorage, ParticipantState, Uploader, simpleId } from '@flocon-trpg/core';
import { Color } from '../color';
import { FilePath } from '../file/filePath';
import axios from 'axios';
import JSZip from 'jszip';
import { analyzeUrl } from '../analyzeUrl';
import { ExpiryMap } from '../file/expiryMap';
import { logCss } from './richLogCss';
import { logHtml } from './richLogHtml';
import { RoomMessageFilter } from '../../components/contextual/room/message/ChannelsFilter';
import { WebConfig } from '../../configType';
import { FirebaseStorage as FirebaseStorageType } from '@firebase/storage';
import { div, generateHtml, HtmlObject, span } from './generateHtml';

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
                .reduce((seed, elem, i) => (i === 0 ? `秘話: ${elem}` : `${seed}, ${elem}`), '');
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

export const generateAsStaticHtml = (
    params: GenerateLogParams & {
        showCreatedAt: boolean;
        showUsernameAlways: boolean;
    }
) => {
    const elements = createRoomMessageArray(params)
        .sort((x, y) => x.createdAt - y.createdAt)
        .map(msg => {
            const left: HtmlObject[] = [];

            if (msg.value.createdBy == null) {
                left.push({
                    type: span,
                    children: 'システムメッセージ',
                });
            } else {
                let name: HtmlObject;
                if (msg.value.createdBy.rolePlayPart == null) {
                    name = { type: span, children: msg.value.createdBy.participantNamePart };
                } else {
                    name = {
                        type: span,
                        children: params.showUsernameAlways
                            ? `${msg.value.createdBy.rolePlayPart} - ${msg.value.createdBy.participantNamePart}`
                            : msg.value.createdBy.participantNamePart,
                    };
                }
                left.push(name);
                const channel: HtmlObject = {
                    type: span,
                    children: ` (${msg.value.channelName})`,
                };
                left.push(channel);
            }

            const result: HtmlObject = {
                type: div,
                className: 'message',
                style:
                    msg.value.textColor == null
                        ? undefined
                        : `color: ${escape(msg.value.textColor)}`,
                children: [
                    ...left,
                    {
                        type: span,
                        children: params.showCreatedAt
                            ? ` @ ${moment(new Date(msg.createdAt)).format('MM/DD HH:mm:ss')} `
                            : ' ',
                    },
                    {
                        type: span,
                        className: msg.value.text == null ? 'text gray' : 'text',
                        children:
                            msg.value.text == null
                                ? '(削除済み)'
                                : `${msg.value.text ?? ''} ${msg.value.commandResult ?? ''}`,
                    },
                ],
            };
            return generateHtml(result);
        })
        .reduce((seed, elem) => (seed === '' ? elem : `${seed}\r\n${elem}`), '');

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

    // keyはdirectLink
    // valueがnullの場合はnot foundなどを表し、二度とダウンロードを試みない
    private readonly uploaderImages = new Map<string, ImageResult | null>();

    public constructor(
        private readonly config: WebConfig,
        private readonly storage: FirebaseStorageType,
        private readonly firebaseStorageUrlCache: ExpiryMap<string, string>
    ) {}

    private findCache(filePath: FilePath) {
        switch (filePath.sourceType) {
            case FileSourceType.Default: {
                return this.defaultImages.get(analyzeUrl(filePath.path).directLink);
            }
            case FileSourceType.FirebaseStorage: {
                return this.firebaseImages.get(filePath.path);
            }
            case FileSourceType.Uploader: {
                return this.uploaderImages.get(filePath.path);
            }
        }
    }

    private analyzeUrl(url: string) {
        const { directLink, fileExtension } = analyzeUrl(url);
        return {
            directLink,
            // Firebase Storageのファイル名は長すぎる上に%などの文字が含まれており、imgのsrcに渡すと正常に動作しない、messages.jsのファイルサイズが大きくなるという2つの問題点があるため、ランダムな文字列に置き換えている。
            // image1, image2... のように番号を順に割り振ったファイル名のほうがユーザーによるカスタマイズが行いやすいためこちらのほうが良いが、少し面倒なので現時点では却下している。
            filename: fileExtension == null ? `${simpleId()}` : `${simpleId()}.${fileExtension}`,
        };
    }

    public async download(filePath: FilePath, idToken: string): Promise<ImageResult | null> {
        const cache = this.findCache(filePath);
        if (cache !== undefined) {
            return cache;
        }
        const srcResult = await FilePath.getSrc(
            filePath,
            this.config,
            this.storage,
            idToken,
            this.firebaseStorageUrlCache
        );
        switch (srcResult.type) {
            case Default:
                break;
            case FirebaseStorage:
                if (srcResult.src == null) {
                    this.firebaseImages.set(filePath.path, null);
                    // CONSIDER: 何らかの通知をしたほうがいいか？
                    return null;
                }
                break;
            case Uploader: {
                if (srcResult.src == null) {
                    this.uploaderImages.set(filePath.path, null);
                    // CONSIDER: 何らかの通知をしたほうがいいか？
                    return null;
                }
                break;
            }
        }
        if (srcResult.type === Uploader) {
            const result: ImageResult = {
                filename: this.analyzeUrl(srcResult.src).filename,
                blob: srcResult.blob,
            };
            this.uploaderImages.set(filePath.path, result);
            return result;
        }
        const { directLink, filename } = this.analyzeUrl(srcResult.src);
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
            filename,
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

class ArrayProgressCalculator {
    private nextCount = 0;

    // rangeMinとrangeMaxは0～100の範囲。
    // 例えばrangeMin=2,rangeMax=96ならば、nextの戻り値は常に2以上であり、完了したときは96になる。
    public constructor(
        private arrayCount: number,
        private rangeMin: number,
        private rangeMax: number
    ) {
        if (this.rangeMin >= this.rangeMax) {
            throw new Error('this.rangeMin >= this.rangeMax');
        }
    }

    public next(): number {
        if (this.arrayCount <= this.nextCount) {
            return this.rangeMax;
        }
        this.nextCount++;
        const progressAs0To100 = (100 * this.nextCount) / this.arrayCount;
        const resultAsFloat =
            (progressAs0To100 / 100) * (this.rangeMax - this.rangeMin) + this.rangeMin;
        return Math.floor(resultAsFloat);
    }
}

const thisShouldNotHappen = 'This should not happen';

type RichLogProgress = {
    percent: number;
};

export const generateAsRichLog = async ({
    params,
    config,
    storage,
    idToken,
    firebaseStorageUrlCache,
    onProgressChange,
}: {
    params: GenerateLogParams;
    config: WebConfig;
    storage: FirebaseStorageType;
    idToken: string;
    firebaseStorageUrlCache: ExpiryMap<string, string>;
    onProgressChange: (p: RichLogProgress) => void;
}): Promise<Blob> => {
    const imageDownloader = new ImageDownloader(config, storage, firebaseStorageUrlCache);
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
    onProgressChange({ percent: 1 });
    const nonameImage = await axios
        .get('/assets/log/noname.png', { responseType: 'blob' })
        .catch(() => null);
    if (nonameImage != null) {
        imgFolder.file('noname.png', nonameImage.data);
    }
    onProgressChange({ percent: 3 });
    const diceImage = await axios
        .get('/assets/log/dice.png', { responseType: 'blob' })
        .catch(() => null);
    if (diceImage != null) {
        imgFolder.file('dice.png', diceImage.data);
    }
    onProgressChange({ percent: 5 });

    const imgAvatarFolder = imgFolder.folder('avatar');
    if (imgAvatarFolder == null) {
        throw new Error(thisShouldNotHappen);
    }
    const roomMessageArray = createRoomMessageArray(params).sort(
        (x, y) => x.createdAt - y.createdAt
    );
    const arrayProgressCalculator = new ArrayProgressCalculator(roomMessageArray.length, 6, 93);
    const messageDivs: string[] = [];
    for (const msg of roomMessageArray) {
        onProgressChange({ percent: arrayProgressCalculator.next() });
        if (msg.deleted) {
            continue;
        }
        let avatar: string | undefined = undefined;
        if (msg.value.createdBy?.characterImage != null) {
            const image = await imageDownloader.download(
                msg.value.createdBy.characterImage,
                idToken
            );
            if (image != null) {
                imgAvatarFolder.file(image.filename, image.blob);
                avatar = `./img/avatar/${image.filename}`;
            }
        }
        const text = `${escape(msg.value.text)}${
            msg.value.commandResult == null
                ? ''
                : `
${escape(msg.value.commandResult)}`
        }`;
        messageDivs.push(`<div class="flex flex-row message ${
            msg.value.commandResult == null ? '' : 'is-command'
        }">
    <img class="avatar" src="${
        msg.value.commandResult == null ? avatar ?? './img/noname.png' : './img/dice.png'
    }">
    <div class="flex flex-column">
        <div class="flex-none flex flex-row">
            <div class="name" style="color: ${escape(msg.value.textColor ?? 'white')}">
            ${escape(
                msg.value.createdBy?.rolePlayPart ??
                    msg.value.createdBy?.participantNamePart ??
                    'システムメッセージ'
            )}
            </div>
            <div style="width: 6px"></div>
            <div style="color: gray">
                ${escape(
                    msg.type === privateMessage
                        ? `秘話: ${msg.value.channelName}`
                        : msg.value.channelName
                )}
            </div>
        </div>
        <div class="flex-1 text">${text}</div>
    </div>
</div>`);
    }

    onProgressChange({ percent: 94 });

    zip.file('index.html', logHtml(messageDivs));

    onProgressChange({ percent: 95 });

    const result = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });

    onProgressChange({ percent: 97 });
    return result;
};
