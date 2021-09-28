import * as t from 'io-ts';
import { Maybe, maybe } from '../../../maybe';
import { createOperation } from '../../util/createOperation';
import * as ReplaceOperation from '../../util/replaceOperation';
import * as TextOperation from '../../util/textOperation';

export const Plain = 'Plain';
export const Markdown = 'Markdown';

const textType = t.union([t.literal(Plain), t.literal(Markdown)]);
type TextType = t.TypeOf<typeof textType>;

export const state = t.type({
    $v: t.literal(1),

    name: t.string,
    dirId: maybe(t.string),
    text: t.string,
    textType,
});

export type State = t.TypeOf<typeof state>;

export const downOperation = createOperation(1, {
    name: t.type({ oldValue: t.string }),
    dirId: t.type({ oldValue: maybe(t.string) }),
    text: TextOperation.downOperation,
    textType: t.type({ oldValue: textType }),
});

export type DownOperation = t.TypeOf<typeof downOperation>;

export const upOperation = createOperation(1, {
    name: t.type({ newValue: t.string }),
    dirId: t.type({ newValue: maybe(t.string) }),
    text: TextOperation.upOperation,
    textType: t.type({ newValue: textType }),
});

export type UpOperation = t.TypeOf<typeof upOperation>;

export type TwoWayOperation = {
    $v: 1;

    name?: ReplaceOperation.ReplaceValueTwoWayOperation<string>;
    dirId?: ReplaceOperation.ReplaceValueTwoWayOperation<Maybe<string>>;
    text?: TextOperation.TwoWayOperation;
    textType?: ReplaceOperation.ReplaceValueTwoWayOperation<TextType>;
};
