import * as Types from './types';

export const migrateState = (source: Types.State | Types.StateV1): Types.State => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
                stringPieceValues: {},
            };
    }
};

export const migrateUpOperation = (
    source: Types.UpOperation | Types.UpOperationV1
): Types.UpOperation => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
            };
    }
};

export const migrateDownOperation = (
    source: Types.DownOperation | Types.DownOperationV1
): Types.DownOperation => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
            };
    }
};
