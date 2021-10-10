import * as Types from './types';
import * as Character from './character/migrate';
import { mapRecord } from '@kizahasi/util';
import { mapRecordDownOperation, mapRecordUpOperation } from '../../util/recordOperation';

export const migrateState = (source: Types.State | Types.StateRev1): Types.State => {
    switch (source.$r) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $r: 2,
                characters: mapRecord(source.characters, Character.migrateState),
            };
    }
};

export const migrateDbState = (source: Types.DbState | Types.DbStateRev1): Types.DbState => {
    switch (source.$r) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $r: 2,
                characters: mapRecord(source.characters, Character.migrateState),
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
                characters:
                    source.characters == null
                        ? undefined
                        : mapRecordUpOperation({
                              source: source.characters,
                              mapState: Character.migrateState,
                              mapOperation: Character.migrateUpOperation,
                          }),
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
                characters:
                    source.characters == null
                        ? undefined
                        : mapRecordDownOperation({
                              source: source.characters,
                              mapState: Character.migrateState,
                              mapOperation: Character.migrateDownOperation,
                          }),
            };
    }
};
