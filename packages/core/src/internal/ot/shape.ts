import { z } from 'zod';

export const path = 'path';

const $path = z.object({
    type: z.literal(path),

    // SVG pathのdと同様の値
    data: z.string(),
});

export const shape = $path;
