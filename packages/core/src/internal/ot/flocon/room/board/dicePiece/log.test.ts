import produce from 'immer';
import { Type, ofOperation } from './log';
import { template } from './types';
import { updateType } from '@/ot/flocon/piece/log';
import { State, diff as d } from '@/ot/generator';

type DicePieceState = State<typeof template>;

const diff = d(template);

describe('stringPiece log', () => {
    it('tests isValueChanged to be false', () => {
        const prevState: DicePieceState = {
            $v: 2,
            $r: 1,
            ownerCharacterId: 'test-owner-character-id',
            x: 10,
            y: 20,
            w: 30,
            h: 40,
            opacity: 0.5,
            cellX: 1,
            cellY: 2,
            cellW: 3,
            cellH: 4,
            isCellMode: false,
            isPositionLocked: false,
            dice: {
                '1': {
                    $v: 1,
                    $r: 1,
                    value: 2,
                    dieType: 'D6',
                    isValuePrivate: false,
                },
            },
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: DicePieceState = { ...prevState, x: 11 };
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            x: { newValue: 11 },
        };

        expect(actual).toEqual(expected);
    });

    it('tests isValueChanged to be true', () => {
        const prevState: DicePieceState = {
            $v: 2,
            $r: 1,
            ownerCharacterId: 'test-owner-character-id',
            x: 10,
            y: 20,
            w: 30,
            h: 40,
            opacity: 0.5,
            cellX: 1,
            cellY: 2,
            cellW: 3,
            cellH: 4,
            isCellMode: false,
            isPositionLocked: false,
            dice: {
                '1': {
                    $v: 1,
                    $r: 1,
                    value: 2,
                    dieType: 'D6',
                    isValuePrivate: false,
                },
            },
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: DicePieceState = produce(prevState, prevState => {
            prevState.dice!['1']!.value = 3;
        });
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            dice: {
                '1': {
                    type: updateType,
                    update: {
                        $v: 1,
                        $r: 1,
                        isValueChanged: true,
                    },
                },
            },
        };

        expect(actual).toEqual(expected);
    });

    it('should show value when isValuePrivate becomes false', () => {
        const prevState: DicePieceState = {
            $v: 2,
            $r: 1,
            ownerCharacterId: 'test-owner-character-id',
            x: 10,
            y: 20,
            w: 30,
            h: 40,
            opacity: 0.5,
            cellX: 1,
            cellY: 2,
            cellW: 3,
            cellH: 4,
            isCellMode: false,
            isPositionLocked: false,
            dice: {
                '1': {
                    $v: 1,
                    $r: 1,
                    value: 2,
                    dieType: 'D6',
                    isValuePrivate: true,
                },
            },
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: DicePieceState = produce(prevState, prevState => {
            prevState.dice!['1']!.isValuePrivate = false;
        });
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            dice: {
                '1': {
                    type: updateType,
                    update: {
                        $v: 1,
                        $r: 1,
                        isValuePrivateChanged: { newValue: 2 },
                        isValueChanged: false,
                    },
                },
            },
        };

        expect(actual).toEqual(expected);
    });

    it('should hide value when isValuePrivate becomes true', () => {
        const prevState: DicePieceState = {
            $v: 2,
            $r: 1,
            ownerCharacterId: 'test-owner-character-id',
            x: 10,
            y: 20,
            w: 30,
            h: 40,
            opacity: 0.5,
            cellX: 1,
            cellY: 2,
            cellW: 3,
            cellH: 4,
            isCellMode: false,
            isPositionLocked: false,
            dice: {
                '1': {
                    $v: 1,
                    $r: 1,
                    value: 2,
                    dieType: 'D6',
                    isValuePrivate: false,
                },
            },
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: DicePieceState = produce(prevState, prevState => {
            prevState.dice!['1']!.isValuePrivate = true;
        });
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            dice: {
                '1': {
                    type: updateType,
                    update: {
                        $v: 1,
                        $r: 1,
                        isValuePrivateChanged: { newValue: undefined },
                        isValueChanged: false,
                    },
                },
            },
        };

        expect(actual).toEqual(expected);
    });
});
