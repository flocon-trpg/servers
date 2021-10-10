import * as t from 'io-ts';
import { createOperation } from '../../util/createOperation';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as TextOperation from '../../util/textOperation';

export const Plain = 'Plain';
export const Markdown = 'Markdown';

const textType = t.union([t.literal(Plain), t.literal(Markdown)]);
type TextType = t.TypeOf<typeof textType>;

export const state = t.type({
    $v: t.literal(1),
    $r: t.literal(1),

    name: t.string,
    dir: t.array(t.string),
    text: t.string,
    textType,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, 1, {
    name: TextOperation.downOperation,
    dir: t.type({ oldValue: t.array(t.string) }),
    text: TextOperation.downOperation,
    textType: t.type({ oldValue: textType }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, 1, {
    name: TextOperation.upOperation,
    dir: t.type({ newValue: t.array(t.string) }),
    text: TextOperation.upOperation,
    textType: t.type({ newValue: textType }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;
    $r: 1;

    name?: TextOperation.TwoWayOperation;
    dir?: ReplaceOperation.ReplaceValueTwoWayOperation<string[]>;
    text?: TextOperation.TwoWayOperation;
    textType?: ReplaceOperation.ReplaceValueTwoWayOperation<TextType>;
};
