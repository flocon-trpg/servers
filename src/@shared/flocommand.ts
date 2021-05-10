/* eslint-disable @typescript-eslint/no-namespace */
import { JSONSchemaType } from 'ajv';

namespace Util {
    export type WhereNum = {
        is?: number;
        isNot?: number;
    } | number;

    export const whereNumSchema: JSONSchemaType<WhereNum> = {
        oneOf: [
            {
                type: 'object',
                properties: { is: { type: 'number', nullable: true }, isNot: { type: 'number', nullable: true } },
                additionalProperties: false,
            }, {
                type: ['number'],
            }
        ]
    };

    export type WhereStr = {
        is?: string;
        isNot?: string;
    } | string;

    export const whereStrSchema: JSONSchemaType<WhereStr> = {
        oneOf: [
            {
                type: 'object',
                properties: { is: { type: 'string', nullable: true }, isNot: { type: 'string', nullable: true } },
                additionalProperties: false,
            }, {
                type: ['string'],
            }
        ],
    };

    export type WhereId = {
        userId: WhereStr;
        mainId: WhereStr;
    } | WhereStr;

    export const whereIdSchema: JSONSchemaType<WhereId> = {
        oneOf: [
            ...whereStrSchema.oneOf,
            {
                type: 'object',
                properties: { userId: whereStrSchema, mainId: whereStrSchema },
                additionalProperties: false,
                required: ['userId', 'mainId'],
            }
        ]
    };

    export type SetImage = {
        src: string;
        type: string;
    } | string;

    export const setImageSchema: JSONSchemaType<SetImage> = {
        oneOf: [{
            type: 'object',
            properties: {
                src: { type: 'string' },
                type: { type: 'string' },
            },
            required: ['src', 'type'],
        }, {
            type: ['string']
        }]
    };
}

namespace Character {
    type CharacterWhere = {
        id?: Util.WhereId;
        name?: Util.WhereStr;
    }

    const requiredCharacterWhereSchema: JSONSchemaType<Required<CharacterWhere>> = {
        type: 'object',
        properties: {
            id: Util.whereIdSchema,
            name: Util.whereStrSchema,
        },
        additionalProperties: false,
        required: ['id', 'name']
    };

    // propertyがoneOfかつnullableの場合は型チェックがうまくいかないっぽいので、まず型サポートを最大限受けられるschemaをまず書いて、それを少し調整してからasでキャストしている。
    const characterWhereSchema = {
        ...requiredCharacterWhereSchema,
        required: undefined,
    } as JSONSchemaType<CharacterWhere>;


    type Set = {
        image?: string;
        name?: string;
    }

    const setSchema: JSONSchemaType<Set> = {
        type: 'object',
        properties: {
            image: {
                type: 'string',
                nullable: true,
            },
            name: {
                type: 'string',
                nullable: true,
            }
        },
        additionalProperties: false,
    };

    export type Action = {
        set?: Set;
    }

    export const actionSchema: JSONSchemaType<Action> = {
        type: 'object',
        properties: {
            set: { ...setSchema, nullable: true },
        },
        additionalProperties: false,
    };
}

namespace Message {
    type Write = {
        text: string;
        // TODO: チャンネルも設ける
    }

    const writeSchema: JSONSchemaType<Write> = {
        type: 'object',
        properties: {
            text: { type: 'string' }
        },
        required: ['text'],
        additionalProperties: false,
    };

    export type Action = {
        write?: Write;
    }

    export const actionSchema: JSONSchemaType<Action> = {
        type: 'object',
        properties: {
            write: { ...writeSchema, nullable: true },
        },
        additionalProperties: false,
    };
}

export type CharacterAction = {
    title?: string;
    character?: Character.Action;
    // CompositeActionみたいなものを定義してそれらをグループ化するというのも考えられる。そうすることで、characterのoperateは成功したけどmessageの投稿だけ失敗したので、messageだけ再度コマンドを実行したい、ということが可能になる。
    // CharacterAction.messageは廃止して別の場所でActionを定義してそれをグループ化する、というのも考えられるが、message内でCharacterをContextとして利用できなくなるのでもしかしたら不便な場面ができてしまうかも？
    message?: Message.Action;
}

export const characterActionSchema: JSONSchemaType<CharacterAction> = {
    type: 'object',
    properties: {
        title: { type: 'string', nullable: true },
        character: { ...Character.actionSchema, nullable: true },
        message: { ...Message.actionSchema, nullable: true },
    },
    additionalProperties: false,
};