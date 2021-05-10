"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterActionSchema = void 0;
var Util;
(function (Util) {
    Util.whereNumSchema = {
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
    Util.whereStrSchema = {
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
    Util.whereIdSchema = {
        oneOf: [
            ...Util.whereStrSchema.oneOf,
            {
                type: 'object',
                properties: { userId: Util.whereStrSchema, mainId: Util.whereStrSchema },
                additionalProperties: false,
                required: ['userId', 'mainId'],
            }
        ]
    };
    Util.setImageSchema = {
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
})(Util || (Util = {}));
var Character;
(function (Character) {
    const requiredCharacterWhereSchema = {
        type: 'object',
        properties: {
            id: Util.whereIdSchema,
            name: Util.whereStrSchema,
        },
        additionalProperties: false,
        required: ['id', 'name']
    };
    const characterWhereSchema = Object.assign(Object.assign({}, requiredCharacterWhereSchema), { required: undefined });
    const setSchema = {
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
    Character.actionSchema = {
        type: 'object',
        properties: {
            set: Object.assign(Object.assign({}, setSchema), { nullable: true }),
        },
        additionalProperties: false,
    };
})(Character || (Character = {}));
var Message;
(function (Message) {
    const writeSchema = {
        type: 'object',
        properties: {
            text: { type: 'string' }
        },
        required: ['text'],
        additionalProperties: false,
    };
    Message.actionSchema = {
        type: 'object',
        properties: {
            write: Object.assign(Object.assign({}, writeSchema), { nullable: true }),
        },
        additionalProperties: false,
    };
})(Message || (Message = {}));
exports.characterActionSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', nullable: true },
        character: Object.assign(Object.assign({}, Character.actionSchema), { nullable: true }),
        message: Object.assign(Object.assign({}, Message.actionSchema), { nullable: true }),
    },
    additionalProperties: false,
};
