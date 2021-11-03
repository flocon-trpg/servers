import * as Types from './types';

export const migrateState = (source: Types.State | Types.StateRev1): Types.State => {
    switch (source.$r) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $r: 2,
                stringPieceValues: {},
            };
    }
};

export const migrateUpOperation = (
    source: Types.UpOperation | Types.UpOperationRev1
): Types.UpOperation => {
    switch (source.$r) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $r: 2,
            };
    }
};

export const migrateDownOperation = (
    source: Types.DownOperation | Types.DownOperationRev1
): Types.DownOperation => {
    switch (source.$r) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $r: 2,
            };
    }
};
