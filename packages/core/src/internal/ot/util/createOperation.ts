import { z } from 'zod';

export const createOperation = <
    TVersion extends string | number,
    TRevision extends string | number,
    TProps extends z.ZodRawShape
>(
    version: TVersion,
    revision: TRevision,
    props: TProps
) =>
    z
        .object(props)
        .partial()
        .merge(
            z.object({
                $v: z.literal(version),
                $r: z.literal(revision),
            })
        );
