import * as t from 'io-ts';

export const createOperation = <
    TVersion extends string | number,
    TRevision extends string | number,
    TProps extends t.Props
>(
    version: TVersion,
    revision: TRevision,
    props: TProps
) =>
    t.intersection([
        t.type({
            $v: t.literal(version),
            $r: t.literal(revision),
        }),
        t.partial(props),
    ]);
