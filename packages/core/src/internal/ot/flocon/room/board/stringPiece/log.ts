import * as t from 'io-ts';
import * as StringPieceValueTypes from './types';
import * as PieceBaseTypes from '../../../pieceBase/types';
import { createType, deleteType, updateType } from '../../../pieceBase/log';
import { maybe } from '../../../../../maybe';
import {
    IoTsOptions,
    State,
    TwoWayOperation,
    createObjectValueTemplate,
    state,
    toUpOperation,
    upOperation,
} from '../../../../generator';

const update = (options: IoTsOptions) =>
    t.intersection([
        t.type({
            $v: t.literal(2),
            $r: t.literal(1),

            type: t.literal(updateType),
        }),
        upOperation(createObjectValueTemplate(PieceBaseTypes.templateValue, 2, 1), options),
        t.partial({
            ownerCharacterId: t.type({ newValue: maybe(t.string) }),
            isValuePrivateChanged: t.type({ newValue: maybe(t.string) }),
            isValueChanged: t.boolean,
        }),
    ]);

export const type = t.union([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: state(StringPieceValueTypes.template, { exact: false }),
    }),
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: state(StringPieceValueTypes.template, { exact: false }),
    }),
    update({ exact: false }),
]);

export const exactType = t.union([
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(createType),
        value: state(StringPieceValueTypes.template, { exact: true }),
    }),
    t.type({
        $v: t.literal(2),
        $r: t.literal(1),
        type: t.literal(deleteType),
        value: state(StringPieceValueTypes.template, { exact: true }),
    }),
    update({ exact: true }),
]);

export type Type = t.TypeOf<typeof type>;

export const ofOperation = (
    operation: TwoWayOperation<typeof StringPieceValueTypes.template>,
    currentState: State<typeof StringPieceValueTypes.template>
): Type => {
    return {
        ...toUpOperation(PieceBaseTypes.template)({ ...operation, $v: undefined, $r: undefined }),
        $v: 2,
        $r: 1,
        type: updateType,
        ownerCharacterId: operation.ownerCharacterId,
        isValueChanged: operation.value != null,
        isValuePrivateChanged:
            operation.isValuePrivate == null ||
            operation.isValuePrivate.oldValue === operation.isValuePrivate.newValue
                ? undefined
                : {
                      newValue: operation.isValuePrivate.newValue ? undefined : currentState.value,
                  },
    };
};
