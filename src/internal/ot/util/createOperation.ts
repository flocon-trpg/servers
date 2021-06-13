import * as t from 'io-ts';

export const createOperation = <TVersion extends string | number, TProps extends t.Props>(
    version: TVersion,
    props: TProps
) =>
    t.intersection([
        t.type({
            $version: t.literal(version),
        }),
        t.partial(props),
    ]);
