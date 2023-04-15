import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { $index, indexObjectTemplateValue, serverTransform } from './array';
import {
    State,
    TwoWayOperation,
    UpOperation,
    createObjectValueTemplate,
    createRecordValueTemplate,
    createReplaceValueTemplate,
    diff,
} from './generator';
import { isIdRecord } from './record';
import * as ReplaceOperation from './util/replaceOperation';

const $v = 1;
const $r = 1;

const template = createObjectValueTemplate(
    {
        ...indexObjectTemplateValue,
        name: createReplaceValueTemplate(z.string()),
    },
    $v,
    $r
);

type TemplateState = State<typeof template>;
type TemplateTwoWayOperation = TwoWayOperation<typeof template>;
type TemplateUpOperation = UpOperation<typeof template>;

const testTransform = ({
    stateAfterFirst,
    stateBeforeFirst,
    clientState,
    expectedState,
}: {
    stateBeforeFirst: Record<string, TemplateState | undefined>;
    stateAfterFirst: Record<string, TemplateState | undefined>;
    clientState: Record<string, TemplateState | undefined>;
    expectedState: Record<string, TemplateState | undefined>;
}) => {
    const execDiff = diff(createRecordValueTemplate(template));
    const first = execDiff({
        prevState: stateBeforeFirst,
        nextState: stateAfterFirst,
    });
    const second = execDiff({
        prevState: stateBeforeFirst,
        nextState: clientState,
    });
    const transformResult = serverTransform<
        TemplateState,
        TemplateState,
        TemplateTwoWayOperation,
        TemplateUpOperation
    >({
        stateBeforeFirst,
        stateAfterFirst,
        first,
        second,
        toServerState: (x: TemplateState) => x,
        mapOperation: x => ({ ...x, $v, $r }),
        innerTransform: ({ first, second, prevState }) => {
            const result: TemplateTwoWayOperation = { $v, $r };
            result[$index] = ReplaceOperation.serverTransform({
                first: first?.[$index],
                second: second[$index],
                prevState: prevState[$index],
            });
            result.name = ReplaceOperation.serverTransform({
                first: first?.name,
                second: second.name,
                prevState: prevState.name,
            });
            return Result.ok(isIdRecord(result) ? undefined : result);
        },
        cancellationPolicy: {},
    });
    if (transformResult.isError) {
        throw new Error(transformResult.error);
    }
    const expected = execDiff({ prevState: stateAfterFirst, nextState: expectedState });
    expect(transformResult.value).toEqual(expected);
};

describe('array transformation', () => {
    it('tests insert vs insert', () => {
        const stateBeforeFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key3: {
                $v,
                $r,
                $index: 1,
                name: 'key3',
            },
        };

        // inserts an element to [1]
        const stateAfterFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
            key3: {
                $v,
                $r,
                $index: 2,
                name: 'key3',
            },
        };

        // inserts another element to [1]
        const clientState: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key2: {
                $v,
                $r,
                $index: 1,
                name: 'key2',
            },
            key3: {
                $v,
                $r,
                $index: 2,
                name: 'key3',
            },
        };

        // OTの仕方は一意ではないため、key1とkey2の位置は逆でも問題ない
        const expectedState: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 2,
                name: 'key2',
            },
            key3: {
                $v,
                $r,
                $index: 3,
                name: 'key3',
            },
        };

        testTransform({ stateBeforeFirst, stateAfterFirst, clientState, expectedState });
    });

    it('tests deleting same elements', () => {
        const stateBeforeFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
        };

        // deletes [1]
        const stateAfterFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
        };

        const clientState: Record<string, TemplateState> = stateAfterFirst;

        const expectedState: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
        };

        testTransform({ stateBeforeFirst, stateAfterFirst, clientState, expectedState });
    });

    it('tests swap vs delete', () => {
        const stateBeforeFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 2,
                name: 'key2',
            },
        };

        // swaps key0-key1
        const stateAfterFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 1,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 0,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 2,
                name: 'key2',
            },
        };

        // deletes 0th element
        const clientState: Record<string, TemplateState> = {
            key1: {
                $v,
                $r,
                $index: 0,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 1,
                name: 'key2',
            },
        };
        const expectedState: Record<string, TemplateState> = clientState;
        testTransform({ stateBeforeFirst, stateAfterFirst, clientState, expectedState });
    });

    it('tests delete vs swap', () => {
        const stateBeforeFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 2,
                name: 'key2',
            },
        };

        // deletes [0]
        const stateAfterFirst: Record<string, TemplateState> = {
            key1: {
                $v,
                $r,
                $index: 0,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 1,
                name: 'key2',
            },
        };

        // swaps key0-key1
        const clientState: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 1,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 0,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 2,
                name: 'key2',
            },
        };

        const expectedState: Record<string, TemplateState> = {
            key1: {
                $v,
                $r,
                $index: 0,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 1,
                name: 'key2',
            },
        };

        testTransform({ stateBeforeFirst, stateAfterFirst, clientState, expectedState });
    });

    it('tests swap vs swap', () => {
        const stateBeforeFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 2,
                name: 'key2',
            },
            key3: {
                $v,
                $r,
                $index: 3,
                name: 'key3',
            },
        };

        // swaps key1-key2
        const stateAfterFirst: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 2,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 1,
                name: 'key2',
            },
            key3: {
                $v,
                $r,
                $index: 3,
                name: 'key3',
            },
        };

        // swaps key2-key3
        const clientState: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 1,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 3,
                name: 'key2',
            },
            key3: {
                $v,
                $r,
                $index: 2,
                name: 'key3',
            },
        };

        // OTの仕方は一意ではないため、この値のとおりでなくても問題ない。
        const expectedState: Record<string, TemplateState> = {
            key0: {
                $v,
                $r,
                $index: 0,
                name: 'key0',
            },
            key1: {
                $v,
                $r,
                $index: 2,
                name: 'key1',
            },
            key2: {
                $v,
                $r,
                $index: 1,
                name: 'key2',
            },
            key3: {
                $v,
                $r,
                $index: 3,
                name: 'key3',
            },
        };

        testTransform({ stateBeforeFirst, stateAfterFirst, clientState, expectedState });
    });
});
