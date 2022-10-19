import * as t from 'io-ts';

export const path = 'path';

const $path = t.type({
    type: t.literal(path),

    // SVG pathのdと同様の値
    data: t.string,
});

export const shape = $path;
