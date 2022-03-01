import { renderHook } from '@testing-library/react-hooks';
import { useCreateStateMap } from './useCreateStateMap';

const character1 = { name: 'CHARACTER1' };
const character2 = { name: 'CHARACTER2' };
const character3 = { name: 'CHARACTER3' };
const character4 = { name: 'CHARACTER4' };
const character5 = { name: 'CHARACTER5' };

const record = {
    participantId0: {
        characters: {
            characterId0: character1,
            characterId1: character2,
        },
    },
    participantId1: {
        characters: {
            characterId0: character3,
            characterId2: character4,
        },
    },
};

it('tests init render', () => {
    const { result } = renderHook(() => useCreateStateMap(record, x => x.characters));
    expect(result.current?.size).toBe(4);
});

it('tests rerender same reference record', () => {
    const { result, rerender } = renderHook(() => useCreateStateMap(record, x => x.characters));
    const prevResult = result.current;
    rerender(record);
    expect(result.current).toBe(prevResult);
});

it('tests rerender same record', () => {
    const { result, rerender } = renderHook(
        ({ record }) => useCreateStateMap(record, x => x.characters),
        { initialProps: { record } }
    );
    const prevResult = result.current;
    rerender({
        record: {
            participantId0: {
                characters: {
                    characterId0: character1,
                    characterId1: character2,
                },
            },
            participantId1: {
                characters: {
                    characterId0: character3,
                    characterId2: character4,
                },
            },
        },
    });
    expect(result.current).toBe(prevResult);
});

it('tests rerender updated record', () => {
    const { result, rerender } = renderHook(
        ({ record }) => useCreateStateMap(record, x => x.characters),
        { initialProps: { record } }
    );
    rerender({
        record: {
            participantId0: {
                characters: {
                    characterId0: character1,
                    characterId1: character2,
                },
            },
            participantId1: {
                characters: {
                    characterId0: character3,
                    characterId2: character5,
                },
            },
        },
    });
    expect(result.current?.size).toBe(4);
    expect(result.current?.get({ createdBy: 'participantId1', id: 'characterId0' })).toBe(
        character3
    );
    expect(result.current?.get({ createdBy: 'participantId1', id: 'characterId2' })).toBe(
        character5
    );
});
