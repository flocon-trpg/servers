import * as Types from './types';
import * as Participant from './participant/migrate';
import { mapRecord } from '@kizahasi/util';
import { mapRecordDownOperation, mapRecordUpOperation } from '../util/recordOperation';

// 引数にRoom.Stateを含めることで、Room.State.$vの間違いを検出する狙いがある。DbState,UpOperationなども同様。
export const migrateState = (source: Types.State | Types.StateV1): Types.State => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
                participants: mapRecord(source.participants, Participant.migrateState),
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
                participants: mapRecord(source.participants, Participant.migrateDbState),
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
    source: Types.DownOperation | Types.DownOperationV1
): Types.DownOperation => {
    switch (source.$v) {
        case 2:
            return source;
        case 1:
            return {
                ...source,
                $v: 2,
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
