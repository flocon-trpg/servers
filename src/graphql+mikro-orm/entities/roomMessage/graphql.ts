import { $free, $system } from '@kizahasi/util';
import { createUnionType, Field, InputType, ObjectType } from 'type-graphql';
import { DeleteMessageFailureType } from '../../../enums/DeleteMessageFailureType';
import { EditMessageFailureType } from '../../../enums/EditMessageFailureType';
import { GetRoomLogFailureType } from '../../../enums/GetRoomLogFailureType';
import { GetRoomMessagesFailureType } from '../../../enums/GetRoomMessagesFailureType';
import { MakeMessageNotSecretFailureType } from '../../../enums/MakeMessageNotSecretFailureType';
import { PieceValueLogType as PieceValueLogTypeEnum } from '../../../enums/PieceValueLogType';
import { WriteRoomPrivateMessageFailureType } from '../../../enums/WriteRoomPrivateMessageFailureType';
import { WriteRoomPublicMessageFailureType } from '../../../enums/WriteRoomPublicMessageFailureType';
import { WriteRoomSoundEffectFailureType } from '../../../enums/WriteRoomSoundEffectFailureType';
import { FilePath } from '../filePath/graphql';

// messageIdは、Reactのkeyとして使われる

/*
# initText, updatedText, commandResult, altTextToSecret, isSecretについて

## (initText, altTextToSecret) = (nullish, nullish)
この状態になることはない。

## (initText, altTextToSecret) = (non-nullish, nullish)
常に公開されるメッセージを表す。

## (initText, altTextToSecret) = (nullish, non-nullish)
Secret設定であり、本文が非公開になっていて閲覧できない状態。自分が投稿したメッセージであればこの状態になることはない。

## (initText, altTextToSecret) = (non-nullish, non-nullish)
下のいずれか
- Secret設定であり、メッセージの投稿者が公開した
- Secret設定であり、自分が投稿した

## updatedText
initTextがnullishならば、updatedTextもnullish。逆や裏は必ずしも成り立たない。

## commandResult
コマンドの実行結果を表す文字列。textのほうは実行結果に関わらず投稿された文字列がそのまま入る。
コマンドでないとみなされていた場合はnullish。
公開条件はtextと同様。altCommandResultToSecretは、今のところ使える場面が思いつかないので定義していない。

## isSecret
Secret設定であり、本文が非公開の状態だとtrue。公開しているならばfalse。もしこれがなければ自分がしたSecret発言を公開したかどうかがわからない。
*/

@ObjectType()
export class CommandResult {
    @Field()
    public text!: string;

    @Field({
        nullable: true,
        description:
            '成功判定のないコマンドの場合はnullish。成功判定のあるコマンドの場合はその結果。',
    })
    public isSuccess?: boolean;
}

export const RoomPublicChannelType = 'RoomPublicChannel';

@ObjectType()
export class RoomPublicChannel {
    public __tstype!: typeof RoomPublicChannelType;

    @Field({
        description: `現在の仕様では、${$system}, ${$free}, '1', … , '10' の12個のみをサポートしている。このうち、${$system}はシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、${$free}はSpectatorも書き込むことができる。`,
    })
    public key!: string;

    @Field({ nullable: true })
    public name?: string;
}

@ObjectType()
export class CharacterValueForMessage {
    @Field()
    public stateId!: string;

    @Field()
    public isPrivate!: boolean;

    @Field()
    public name!: string;

    @Field(() => FilePath, { nullable: true })
    public image?: FilePath;

    @Field(() => FilePath, { nullable: true })
    public tachieImage?: FilePath;
}

@ObjectType()
export class UpdatedText {
    @Field({ nullable: true })
    public currentText?: string;

    @Field()
    public updatedAt!: number;
}

export const RoomPublicMessageType = 'RoomPublicMessage';

@ObjectType()
export class RoomPublicMessage {
    public __tstype!: typeof RoomPublicMessageType;

    @Field()
    public messageId!: string;

    @Field()
    public channelKey!: string;

    @Field({ nullable: true })
    public initText?: string;

    @Field({ nullable: true })
    public initTextSource?: string;

    @Field({ nullable: true })
    public updatedText?: UpdatedText;

    @Field({ nullable: true })
    public textColor?: string;

    @Field({ nullable: true })
    public commandResult?: CommandResult;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    @Field()
    public isSecret!: boolean;

    @Field({
        nullable: true,
        description: `channelKeyが${$system}以外のときは、システムメッセージならばnullishで、そうでないならばnullishではない。${$system}のとき、原則として全てシステムメッセージであるため常にnullishになる。`,
    })
    public createdBy?: string;

    @Field({
        nullable: true,
        description:
            '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。',
    })
    public character?: CharacterValueForMessage;

    @Field({ nullable: true })
    public customName?: string;

    @Field()
    public createdAt!: number;

    @Field({ nullable: true })
    public updatedAt?: number;
}

export const RoomPrivateMessageType = 'RoomPrivateMessage';

@ObjectType()
export class RoomPrivateMessage {
    public __tstype!: typeof RoomPrivateMessageType;

    @Field()
    public messageId!: string;

    @Field(() => [String])
    public visibleTo!: string[];

    @Field({ nullable: true })
    public initText?: string;

    @Field({ nullable: true })
    public initTextSource?: string;

    @Field({ nullable: true })
    public updatedText?: UpdatedText;

    @Field({ nullable: true })
    public textColor?: string;

    @Field({ nullable: true })
    public commandResult?: CommandResult;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    @Field()
    public isSecret!: boolean;

    @Field({ nullable: true })
    public createdBy?: string;

    @Field({
        nullable: true,
        description:
            '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。後からCharacterの値が更新されても、この値が更新されることはない。',
    })
    public character?: CharacterValueForMessage;

    @Field({ nullable: true })
    public customName?: string;

    @Field()
    public createdAt!: number;

    @Field({ nullable: true })
    public updatedAt?: number;
}

export const PieceValueLogType = 'PieceValueLog';

@ObjectType()
export class PieceValueLog {
    public __tstype!: typeof PieceValueLogType;

    @Field()
    public messageId!: string;

    @Field()
    public characterCreatedBy!: string;

    @Field()
    public characterId!: string;

    @Field()
    public stateId!: string;

    @Field()
    public createdAt!: number;

    @Field(() => PieceValueLogTypeEnum)
    public logType!: PieceValueLogTypeEnum;

    @Field()
    public valueJson!: string;
}

export const RoomSoundEffectType = 'RoomSoundEffect';

@ObjectType()
export class RoomSoundEffect {
    public __tstype!: typeof RoomSoundEffectType;

    @Field()
    public messageId!: string;

    @Field()
    public file!: FilePath;

    @Field({ nullable: true })
    public createdBy?: string;

    @Field()
    public createdAt!: number;

    @Field()
    public volume!: number;
}

export const RoomMessage = createUnionType({
    name: 'RoomMessage',
    types: () =>
        [
            RoomPublicMessage,
            RoomPrivateMessage,
            PieceValueLog,
            RoomPublicChannel,
            RoomSoundEffect,
        ] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return RoomPrivateMessage;
            case RoomPublicChannelType:
                return RoomPublicMessage;
            case PieceValueLogType:
                return PieceValueLog;
            case RoomPublicMessageType:
                return RoomPublicChannel;
            case RoomSoundEffectType:
                return RoomSoundEffect;
        }
    },
});

export const RoomMessagesType = 'RoomMessages';

@ObjectType()
export class RoomMessages {
    public __tstype!: typeof RoomMessagesType;

    @Field(() => [RoomPublicMessage])
    public publicMessages!: RoomPublicMessage[];

    @Field(() => [RoomPrivateMessage])
    public privateMessages!: RoomPrivateMessage[];

    @Field(() => [PieceValueLog])
    public pieceValueLogs!: PieceValueLog[];

    @Field(() => [RoomPublicChannel])
    public publicChannels!: RoomPublicChannel[];

    @Field(() => [RoomSoundEffect])
    public soundEffects!: RoomSoundEffect[];
}

export const GetRoomMessagesFailureResultType = 'GetRoomMessagesFailureResult';

@ObjectType()
export class GetRoomMessagesFailureResult {
    public __tstype!: typeof GetRoomMessagesFailureResultType;

    @Field(() => GetRoomMessagesFailureType)
    public failureType!: GetRoomMessagesFailureType;
}

export const GetRoomMessagesResult = createUnionType({
    name: 'GetRoomMessagesResult',
    types: () => [RoomMessages, GetRoomMessagesFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomMessagesType:
                return RoomMessages;
            case GetRoomMessagesFailureResultType:
                return GetRoomMessagesFailureResult;
        }
    },
});

export const GetRoomLogFailureResultType = 'GetRoomLogFailureResultType';

@ObjectType()
export class GetRoomLogFailureResult {
    public __tstype!: typeof GetRoomLogFailureResultType;

    @Field(() => GetRoomLogFailureType)
    public failureType!: GetRoomLogFailureType;
}

export const GetRoomLogResult = createUnionType({
    name: 'GetRoomLogResult',
    types: () => [RoomMessages, GetRoomLogFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomMessagesType:
                return RoomMessages;
            case GetRoomLogFailureResultType:
                return GetRoomLogFailureResult;
        }
    },
});

export const WriteRoomPrivateMessageFailureResultType = 'WriteRoomPrivateMessageFailureResult';

@ObjectType()
export class WriteRoomPrivateMessageFailureResult {
    public __tstype!: typeof WriteRoomPrivateMessageFailureResultType;

    @Field(() => WriteRoomPrivateMessageFailureType)
    public failureType!: WriteRoomPrivateMessageFailureType;
}

export const WriteRoomPrivateMessageResult = createUnionType({
    name: 'WriteRoomPrivateMessageResult',
    types: () => [RoomPrivateMessage, WriteRoomPrivateMessageFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return RoomPrivateMessage;
            case WriteRoomPrivateMessageFailureResultType:
                return WriteRoomPrivateMessageFailureResult;
        }
    },
});

export const WriteRoomPublicMessageFailureResultType = 'WriteRoomPublicMessageFailureResult';

@ObjectType()
export class WriteRoomPublicMessageFailureResult {
    public __tstype!: typeof WriteRoomPublicMessageFailureResultType;

    @Field(() => WriteRoomPublicMessageFailureType)
    public failureType!: WriteRoomPublicMessageFailureType;
}

export const WriteRoomPublicMessageResult = createUnionType({
    name: 'WriteRoomPublicMessageResult',
    types: () => [RoomPublicMessage, WriteRoomPublicMessageFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPublicMessageType:
                return RoomPublicMessage;
            case WriteRoomPublicMessageFailureResultType:
                return WriteRoomPublicMessageFailureResult;
        }
    },
});

export const WriteRoomSoundEffectFailureResultType = 'WriteRoomSoundEffectFailureResult';

@ObjectType()
export class WriteRoomSoundEffectFailureResult {
    public __tstype!: typeof WriteRoomSoundEffectFailureResultType;

    @Field(() => WriteRoomSoundEffectFailureType)
    public failureType!: WriteRoomSoundEffectFailureType;
}

export const WriteRoomSoundEffectResult = createUnionType({
    name: 'WriteRoomSoundEffectResult',
    types: () => [RoomSoundEffect, WriteRoomSoundEffectFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomSoundEffectType:
                return RoomSoundEffect;
            case WriteRoomSoundEffectFailureResultType:
                return WriteRoomSoundEffectFailureResult;
        }
    },
});

@ObjectType()
export class MakeMessageNotSecretResult {
    @Field(() => MakeMessageNotSecretFailureType, { nullable: true })
    public failureType?: MakeMessageNotSecretFailureType;
}

@ObjectType()
export class DeleteMessageResult {
    @Field(() => DeleteMessageFailureType, { nullable: true })
    public failureType?: DeleteMessageFailureType;
}

@ObjectType()
export class EditMessageResult {
    @Field(() => EditMessageFailureType, { nullable: true })
    public failureType?: EditMessageFailureType;
}

export const RoomPublicChannelUpdateType = 'RoomPublicChannelUpdate';

@ObjectType()
export class RoomPublicChannelUpdate {
    public __tstype!: typeof RoomPublicChannelUpdateType;

    @Field()
    public key!: string;

    @Field({ nullable: true })
    public name?: string;
}

export const RoomPublicMessageUpdateType = 'RoomPublicMessageUpdate';

@ObjectType()
export class RoomPublicMessageUpdate {
    public __tstype!: typeof RoomPublicMessageUpdateType;

    @Field()
    public messageId!: string;

    @Field({ nullable: true })
    public initText?: string;

    @Field({ nullable: true })
    public initTextSource?: string;

    @Field({ nullable: true })
    public updatedText?: UpdatedText;

    @Field({ nullable: true })
    public commandResult?: CommandResult;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    // isSecret===falseだったものが途中からtrueに切り替わることもある。そのとき、メッセージが削除されていない限りupdatedTextがnullishになったりすることはない。
    // もしこれをnullableにすると、unionにする際に「BooleanとBoolean!が混在してしまう」というエラーが出るので注意。
    @Field()
    public isSecret!: boolean;

    @Field({ nullable: true })
    public updatedAt?: number;
}

export const RoomPrivateMessageUpdateType = 'RoomPrivateMessageUpdate';

@ObjectType()
export class RoomPrivateMessageUpdate {
    public __tstype!: typeof RoomPrivateMessageUpdateType;

    @Field()
    public messageId!: string;

    @Field({ nullable: true })
    public initText?: string;

    @Field({ nullable: true })
    public initTextSource?: string;

    @Field({ nullable: true })
    public updatedText?: UpdatedText;

    @Field({ nullable: true })
    public commandResult?: CommandResult;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    // RoomPublicMessageUpdateを参照
    @Field()
    public isSecret!: boolean;

    @Field({ nullable: true })
    public updatedAt?: number;
}

export const RoomMessageEvent = createUnionType({
    name: 'RoomMessageEvent',
    types: () =>
        [
            RoomPublicMessage,
            RoomPrivateMessage,
            RoomPublicChannel,
            PieceValueLog,
            RoomSoundEffect,
            RoomPublicChannelUpdate,
            RoomPublicMessageUpdate,
            RoomPrivateMessageUpdate,
        ] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPublicMessageType:
                return RoomPublicMessage;
            case RoomPrivateMessageType:
                return RoomPrivateMessage;
            case RoomPublicChannelType:
                return RoomPublicChannel;
            case PieceValueLogType:
                return PieceValueLog;
            case RoomSoundEffectType:
                return RoomSoundEffect;
            case RoomPublicChannelUpdateType:
                return RoomPublicChannelUpdate;
            case RoomPublicMessageUpdateType:
                return RoomPublicMessageUpdate;
            case RoomPrivateMessageUpdateType:
                return RoomPrivateMessageUpdate;
        }
    },
});
