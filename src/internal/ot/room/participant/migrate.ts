import * as Types from './types';
import * as Character from './character/migrate';
import { mapRecord } from '@kizahasi/util';
import { mapRecordDownOperation, mapRecordUpOperation } from '../../util/recordOperation';

export const migrateState = (source: Types.State | Types.StateV1): Types.State => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
                characters: mapRecord(source.characters, Character.migrateState),
            };
    }
};

export const migrateDbState = (source: Types.DbState | Types.DbStateV1): Types.DbState => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
                characters: mapRecord(source.characters, Character.migrateState),
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
    source: Types.DownOperation | Types.DownOperationV1
): Types.DownOperation => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
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
