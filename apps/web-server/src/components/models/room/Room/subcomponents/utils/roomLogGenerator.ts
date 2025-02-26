import { FirebaseStorage as FirebaseStorageType } from '@firebase/storage';
import {
    Default,
    FirebaseStorage,
    State,
    Uploader,
    participantTemplate,
    simpleId,
} from '@flocon-trpg/core';
import {
    FileSourceType,
    GetMessagesDoc,
    RoomPublicChannelFragmentDoc,
} from '@flocon-trpg/graphql-documents';
import { PrivateChannelSet } from '@flocon-trpg/web-server-utils';
import { ResultOf } from '@graphql-typed-document-node/core';
import { escape } from 'html-escaper';
import JSZip from 'jszip';
import moment from 'moment';
import { RoomMessageFilter } from '../components/RoomMenu/subcomponents/components/GenerageLogModal/subcomponents/components/ChannelsFilter/ChannelsFilter';
import {
    RoomMessage,
    messageContentMaxHeight,
} from '../components/RoomMessagesPanelContent/subcomponents/components/RoomMessage/RoomMessage';
import { HtmlObject, div, generateHtml, span } from './generateHtml';
import { isDeleted, toText } from './message';
import { MockableWebConfig } from '@/configType';
import { Styles } from '@/styles';
import { analyzeUrl } from '@/utils/analyzeUrl';
import { FilePath, FilePathModule } from '@/utils/file/filePath';
import { idTokenIsNull } from '@/utils/file/getFloconUploaderFile';
import { PublicChannelNames } from '@/utils/types';

type RoomPublicChannelFragment = ResultOf<typeof RoomPublicChannelFragmentDoc>;
type RoomMessages = Omit<
    Extract<ResultOf<typeof GetMessagesDoc>['result'], { __typename?: 'RoomMessages' }>,
    '__typename'
>;

const logHtml = (messageDivs: string[]) => `
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" charset="UTF-8">
<link rel="stylesheet" type="text/css" href="./css/main.css">
</head>
<body>
<div class="container flex flex-column">
${messageDivs.reduce((seed, elem) => (seed === '' ? elem : `${seed}\r\n${elem}`), '')}
</div>
</body>
</html>
`;

export const logCss = `
html {
    background-color: ${Styles.chatBackgroundColor};
    color: white;
}

* {
    scrollbar-color: #686868 ${Styles.backgroundColor};
    scrollbar-width: thin;
}
::-webkit-scrollbar {
    background-color: ${Styles.backgroundColor};
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-corner {
    background-color: ${Styles.backgroundColor};
}
::-webkit-scrollbar-thumb {
    background-color: #686868;
}

body {
    margin: 0;
}

.header {
    background-color: #303030;
    position: fixed;
    top: 0;
    width: 100%;
    height: 50px;
    padding: 0 8px;
}

.container {
    padding: 8px;
}

.flex {
    display: flex;
}

.flex-row {
    flex-direction: row;
}

.flex-column {
    flex-direction: column;
}

.flex-none {
    flex: none;
}

.flex-1 {
    flex: 1;
}

.message {
    border-bottom: solid 1px #505050;
    padding: 5px 0;
}
.message.is-command {
    background-color: #FFFFFF10;
}
.message .text {
    white-space: pre-wrap;
}

.avatar {
    align-self: center;
    margin-right: 6px;
    min-height: 40px;
    height: 40px;
    min-width: 40px;
    width: 40px;
}

.name {
    font-weight: bold;
}
`;

type ParticipantState = State<typeof participantTemplate>;

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
    } & PublicChannelNames,
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
                new Map(),
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
    },
) => {
    const elements = createRoomMessageArray(params)
        .sort((x, y) => x.createdAt - y.createdAt)
        .map(msg => {
            const left: HtmlObject[] = [];

            const space: HtmlObject = {
                type: span,
                children: ' ',
                className: 'space',
            };

            let authorChildren: HtmlObject[];
            {
                const user = 'user';
                const character = 'character';

                if (msg.value.createdBy == null) {
                    authorChildren = [
                        {
                            type: span,
                            children: 'システムメッセージ',
                            className: 'system-message',
                        },
                    ];
                } else if (msg.value.createdBy.rolePlayPart == null) {
                    authorChildren = [
                        {
                            type: span,
                            children: msg.value.createdBy.participantNamePart,
                            className: user,
                        },
                    ];
                } else {
                    if (params.showUsernameAlways) {
                        authorChildren = [
                            {
                                type: span,
                                children: msg.value.createdBy.rolePlayPart,
                                className: character,
                            },
                            space,
                            { type: span, children: '-', className: 'hyphen' },
                            space,
                            {
                                type: span,
                                children: msg.value.createdBy.participantNamePart,
                                className: user,
                            },
                        ];
                    } else {
                        authorChildren = [
                            {
                                type: span,
                                children: msg.value.createdBy.rolePlayPart,
                                className: character,
                            },
                        ];
                    }
                }
            }
            const author: HtmlObject = {
                type: span,
                children: authorChildren,
                className: 'author',
            };
            left.push(author);

            if (msg.value.createdBy != null) {
                left.push(space);
                const channel: HtmlObject = {
                    type: span,
                    children: `(${msg.value.channelName})`,
                    className: 'channel',
                };
                left.push(channel);
            }

            const createdAt: HtmlObject[] = params.showCreatedAt
                ? [
                      {
                          type: span,
                          className: 'created-at',
                          children: [
                              {
                                  type: span,
                                  children: '@',
                                  className: 'atmark',
                              },
                              space,
                              {
                                  type: span,
                                  children: `${moment(new Date(msg.createdAt)).format(
                                      'MM/DD HH:mm:ss',
                                  )}`,
                                  className: 'date',
                              },
                          ],
                      },
                      space,
                  ]
                : [];
            const result: HtmlObject = {
                type: div,
                className: 'message',
                style:
                    msg.value.textColor == null
                        ? undefined
                        : `color: ${escape(msg.value.textColor)}`,
                children: [
                    ...left,
                    space,
                    ...createdAt,
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
                background-color: ${Styles.chatBackgroundColor};
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

// TODO: react queryに置き換える
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
        private readonly config: MockableWebConfig,
        private readonly storage: FirebaseStorageType,
    ) {}

    private findCache(filePath: FilePath) {
        switch (filePath.sourceType) {
            case FileSourceType.Default: {
                const url = analyzeUrl(filePath.path);
                if (url == null) {
                    return undefined;
                }
                return this.defaultImages.get(url.directLink);
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
        const analyzed = analyzeUrl(url);
        if (analyzed == null) {
            return analyzed;
        }
        const { directLink, fileExtension } = analyzed;
        return {
            directLink,
            // Firebase Storageのファイル名は長すぎる上に%などの文字が含まれており、imgのsrcに渡すと正常に動作しない、messages.jsのファイルサイズが大きくなるという2つの問題点があるため、ランダムな文字列に置き換えている。
            // image1, image2... のように番号を順に割り振ったファイル名のほうがユーザーによるカスタマイズが行いやすいためこちらのほうが良いが、少し面倒なので現時点では却下している。
            filename: fileExtension == null ? `${simpleId()}` : `${simpleId()}.${fileExtension}`,
        };
    }

    public async download(
        filePath: FilePath,
        getIdToken: () => Promise<string | null>,
    ): Promise<ImageResult | null> {
        const cache = this.findCache(filePath);
        if (cache !== undefined) {
            return cache;
        }
        const srcResult = await FilePathModule.getSrc({
            path: filePath,
            config: this.config,
            storage: this.storage,
            getIdToken,
        });
        if (srcResult === idTokenIsNull) {
            return null;
        }
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
                filename: srcResult.filename,
                blob: srcResult.blob,
            };
            this.uploaderImages.set(filePath.path, result);
            return result;
        }
        const url = this.analyzeUrl(srcResult.src);
        if (url == null) {
            return null;
        }
        const { directLink, filename } = url;
        const image = await (await fetch(directLink)).blob().catch(() => null);
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
            blob: image,
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
        private rangeMax: number,
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
    getIdToken,
    onProgressChange,
}: {
    params: GenerateLogParams;
    config: MockableWebConfig;
    storage: FirebaseStorageType;
    getIdToken: () => Promise<string | null>;
    onProgressChange: (p: RichLogProgress) => void;
}): Promise<Blob> => {
    const imageDownloader = new ImageDownloader(config, storage);
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
    const nonameImage = await fetch('/assets/log/noname.png')
        .then(r => r.blob())
        .catch(() => null);
    if (nonameImage != null) {
        imgFolder.file('noname.png', nonameImage);
    }
    onProgressChange({ percent: 3 });
    const diceImage = await fetch('/assets/log/dice.png')
        .then(r => r.blob())
        .catch(() => null);
    if (diceImage != null) {
        imgFolder.file('dice.png', diceImage);
    }
    onProgressChange({ percent: 5 });

    const imgAvatarFolder = imgFolder.folder('avatar');
    if (imgAvatarFolder == null) {
        throw new Error(thisShouldNotHappen);
    }
    const roomMessageArray = createRoomMessageArray(params).sort(
        (x, y) => x.createdAt - y.createdAt,
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
                getIdToken,
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
        msg.value.commandResult == null ? (avatar ?? './img/noname.png') : './img/dice.png'
    }">
    <div class="flex flex-column">
        <div class="flex-none flex flex-row">
            <div class="name" style="color: ${escape(msg.value.textColor ?? 'white')}">
            ${escape(
                msg.value.createdBy?.rolePlayPart ??
                    msg.value.createdBy?.participantNamePart ??
                    'システムメッセージ',
            )}
            </div>
            <div style="width: 6px"></div>
            <div style="color: gray">
                ${escape(
                    msg.type === privateMessage
                        ? `秘話: ${msg.value.channelName}`
                        : msg.value.channelName,
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
