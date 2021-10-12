import * as Types from './types';
import * as Participant from './participant/migrate';
import { mapRecord } from '@kizahasi/util';
import { mapRecordDownOperation, mapRecordUpOperation } from '../util/recordOperation';

// 引数にRoom.Stateを含めることで、Room.State.$rの間違いを検出する狙いがある。DbState,UpOperationなども同様。
export const migrateState = (source: Types.State | Types.StateRev1): Types.State => {
    switch (source.$r) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $r: 2,
                participants: mapRecord(source.participants, Participant.migrateState),
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
                participants: mapRecord(source.participants, Participant.migrateDbState),
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
                participants:
                    source.participants == null
                        ? undefined
                        : mapRecordUpOperation({
                              source: source.participants,
                              mapState: Participant.migrateState,
                              mapOperation: Participant.migrateUpOperation,
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
                participants:
                    source.participants == null
                        ? undefined
                        : mapRecordDownOperation({
                              source: source.participants,
                              mapState: Participant.migrateState,
                              mapOperation: Participant.migrateDownOperation,
                          }),
            };
    }
};
