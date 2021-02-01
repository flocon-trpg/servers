import { createUnionType, Field, InputType, ObjectType } from 'type-graphql';
import { $free, $system } from '../../../@shared/Constants';
import { DeleteMessageFailureType } from '../../../enums/DeleteMessageFailureType';
import { EditMessageFailureType } from '../../../enums/EditMessageFailureType';
import { GetRoomMessagesFailureType } from '../../../enums/GetRoomMessagesFailureType';
import { MakeMessageNotSecretFailureType } from '../../../enums/MakeMessageNotSecretFailureType';
import { WritePrivateRoomMessageFailureType } from '../../../enums/WritePrivateRoomMessageFailureType';
import { WritePublicRoomMessageFailureType } from '../../../enums/WritePublicRoomMessageFailureType';
import { WriteRoomSoundEffectFailureType } from '../../../enums/WriteRoomSoundEffectFailureType';
import { FilePath } from '../filePath/graphql';

// messageIdは、Reactのkeyとして使われる

/*
# text, commandResult, altTextToSecret, isSecretについて

## (text, altTextToSecret) = (nullish, nullish)
そのメッセージは削除されたことを表す。このときはcommandResultもnullish。

## (text, altTextToSecret) = (non-nullish, nullish)
常に公開されるメッセージを表す。

## (text, altTextToSecret) = (nullish, non-nullish)
Secret設定であり、本文が非公開になっていて閲覧できない状態。自分が投稿したメッセージであればこの状態になることはない。

## (text, altTextToSecret) = (non-nullish, non-nullish)
下のいずれか
- Secret設定であり、メッセージの投稿者が公開した
- Secret設定であり、自分が投稿した

## commandResult
コマンドの実行結果を表す文字列。textのほうは実行結果に関わらず投稿された文字列がそのまま入る。
コマンドでないとみなされていた場合はnullish。
公開条件はtextと同様。altCommandResultToSecretは、今のところ使える場面が思いつかないので定義していない。

## isSecret
Secret設定であり、本文が非公開の状態だとtrue。公開しているならばfalse。もしこれがなければ自分がしたSecret発言を公開したかどうかがわからない。
*/

export const RoomPublicChannelType = 'RoomPublicChannel';

@ObjectType()
export class RoomPublicChannel {
    public __tstype!: typeof RoomPublicChannelType;


    @Field({ description: `現在の仕様では、${$system}, ${$free}, '1', … , '10' の12個のみをサポートしている。このうち、${$system}はシステムメッセージ専用チャンネルであるため誰も書き込むことができない。'1', …, '10'はSpectatorが書き込むことはできないが、${$free}はSpectatorも書き込むことができる。` })
    public key!: string;


    @Field({ nullable: true })
    public name?: string;
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
    public text?: string;

    @Field({ nullable: true })
    public commandResult?: string;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    @Field()
    public isSecret!: boolean;

    @Field({ nullable: true, description: `channelKeyが${$system}以外のときは、システムメッセージならばnullishで、そうでないならばnullishではない。${$system}のとき、原則として全てシステムメッセージであるため常にnullishになる。` })
    public createdBy?: string;

    @Field({ nullable: true, description: '発言がCharacterと紐付いているときはnon-nullish。PLとしての発言、もしくはcreatedByがnullishのときはnullish。' })
    public characterStateId?: string;

    @Field({ nullable: true })
    public characterName?: string;

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
    public text?: string;

    @Field({ nullable: true })
    public commandResult?: string;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    @Field()
    public isSecret!: boolean;

    @Field({ nullable: true })
    public createdBy?: string;

    @Field({ nullable: true })
    public characterStateId?: string;

    @Field({ nullable: true })
    public characterName?: string;

    @Field({ nullable: true })
    public customName?: string;

    @Field()
    public createdAt!: number;

    @Field({ nullable: true })
    public updatedAt?: number;
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
    types: () => [RoomPublicMessage, RoomPrivateMessage, RoomPublicChannel, RoomSoundEffect] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return RoomPrivateMessage;
            case RoomPublicChannelType:
                return RoomPublicMessage;
            case RoomPublicMessageType:
                return RoomPublicChannel;
            case RoomSoundEffectType:
                return RoomSoundEffect;
        }
    }
});

export const RoomMessagesType = 'RoomMessages';

@ObjectType()
export class RoomMessages {
    public __tstype!: typeof RoomMessagesType;


    @Field(() => [RoomPublicMessage])
    public publicMessages!: RoomPublicMessage[];

    @Field(() => [RoomPrivateMessage])
    public privateMessages!: RoomPrivateMessage[];

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
    }
});

export const WritePrivateRoomMessageFailureResultType = 'WritePrivateRoomMessageFailureResult';

@ObjectType()
export class WritePrivateRoomMessageFailureResult {
    public __tstype!: typeof WritePrivateRoomMessageFailureResultType;

    @Field(() => WritePrivateRoomMessageFailureType)
    public failureType!: WritePrivateRoomMessageFailureType;
}

export const WritePrivateRoomMessageResult = createUnionType({
    name: 'WritePrivateRoomMessageResult',
    types: () => [RoomPrivateMessage, WritePrivateRoomMessageFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return RoomPrivateMessage;
            case WritePrivateRoomMessageFailureResultType:
                return WritePrivateRoomMessageFailureResult;
        }
    }
});

export const WritePublicRoomMessageFailureResultType = 'WritePublicRoomMessageFailureResult';

@ObjectType()
export class WritePublicRoomMessageFailureResult {
    public __tstype!: typeof WritePublicRoomMessageFailureResultType;

    @Field(() => WritePublicRoomMessageFailureType)
    public failureType!: WritePublicRoomMessageFailureType;
}

export const WritePublicRoomMessageResult = createUnionType({
    name: 'WritePublicRoomMessageResult',
    types: () => [RoomPublicMessage, WritePublicRoomMessageFailureResult] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPublicMessageType:
                return RoomPublicMessage;
            case WritePublicRoomMessageFailureResultType:
                return WritePublicRoomMessageFailureResult;
        }
    }
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
    }
});

@ObjectType()
export class MakeMessageNotSecretResult {
    @Field(() => MakeMessageNotSecretFailureType, {nullable: true})
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
    public text?: string;

    @Field({ nullable: true })
    public commandResult?: string;

    @Field({ nullable: true })
    public altTextToSecret?: string;

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
    public text?: string;

    @Field({ nullable: true })
    public commandResult?: string;

    @Field({ nullable: true })
    public altTextToSecret?: string;

    @Field()
    public isSecret!: boolean;

    @Field({ nullable: true })
    public updatedAt?: number;
}

export const RoomMessageEvent = createUnionType({
    name: 'RoomMessageEvent',
    types: () => [RoomPublicMessage, RoomPrivateMessage, RoomPublicChannel, RoomSoundEffect, RoomPublicChannelUpdate, RoomPublicMessageUpdate, RoomPrivateMessageUpdate ] as const,
    resolveType: value => {
        switch (value.__tstype) {
            case RoomPrivateMessageType:
                return RoomPrivateMessage;
            case RoomPublicChannelType:
                return RoomPublicChannel;
            case RoomPublicMessageType:
                return RoomPublicMessage;
            case RoomSoundEffectType:
                return RoomSoundEffect;
            case RoomPublicChannelUpdateType:
                return RoomPublicChannelUpdate;
            case RoomPublicMessageUpdateType:
                return RoomPublicMessageUpdate;
            case RoomPrivateMessageUpdateType:
                return RoomPrivateMessageUpdate;
        }
    }
});