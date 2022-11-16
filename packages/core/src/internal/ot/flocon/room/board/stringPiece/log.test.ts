import { Type, ofOperation } from './log';
import { template } from './types';
import { updateType } from '@/ot/flocon/piece/log';
import { State, diff as d } from '@/ot/generator';

type StringPieceState = State<typeof template>;

const diff = d(template);

describe('stringPiece log', () => {
    it('tests isValueChanged to be false', () => {
        const prevState: StringPieceState = {
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
            isValuePrivate: false,
            value: 'test-value-1',
            valueInputType: 'String',
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: StringPieceState = { ...prevState, x: 11 };
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            isValueChanged: false,
            x: { newValue: 11 },
        };

        expect(actual).toEqual(expected);
    });

    it('tests isValueChanged to be true', () => {
        const prevState: StringPieceState = {
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
            isValuePrivate: false,
            value: 'test-value-1',
            valueInputType: 'String',
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: StringPieceState = { ...prevState, value: 'test-value-2' };
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            isValueChanged: true,
        };

        expect(actual).toEqual(expected);
    });

    it('should show value when isValuePrivate becomes false', () => {
        const prevState: StringPieceState = {
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
            isValuePrivate: true,
            value: 'test-value-1',
            valueInputType: 'String',
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: StringPieceState = { ...prevState, isValuePrivate: false };
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            isValueChanged: false,
            isValuePrivateChanged: { newValue: 'test-value-1' },
        };

        expect(actual).toEqual(expected);
    });

    it('should hide value when isValuePrivate becomes true', () => {
        const prevState: StringPieceState = {
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
            isValuePrivate: false,
            value: 'test-value-1',
            valueInputType: 'String',
            memo: 'test-memo',
            name: 'test-name',
        };
        const nextState: StringPieceState = { ...prevState, isValuePrivate: true };
        const d = diff({ prevState, nextState });
        const actual = ofOperation(d!, nextState);

        const expected: Type = {
            $v: 2,
            $r: 1,
            type: updateType,
            isValueChanged: false,
            isValuePrivateChanged: { newValue: undefined },
        };

        expect(actual).toEqual(expected);
    });
});
