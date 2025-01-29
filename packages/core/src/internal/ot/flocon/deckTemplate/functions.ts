import { Result } from '@kizahasi/result';
import { State, TwoWayOperation, UpOperation } from '../../generator/types';
import * as NullableTextOperation from '../../nullableTextOperation';
import { isIdRecord } from '../../record';
import * as RecordOperation from '../../recordOperation';
import { ServerTransform } from '../../util/type';
import * as Card from './card/functions';
import { template } from './types';

export const serverTransform: ServerTransform<
    State<typeof template>,
    TwoWayOperation<typeof template>,
    UpOperation<typeof template>
> = ({
    stateBeforeServerOperation,
    stateAfterServerOperation,
    clientOperation,
    serverOperation,
}) => {
    const cards = RecordOperation.serverTransform({
        first: serverOperation?.cards,
        second: clientOperation.cards,
        stateBeforeFirst: stateBeforeServerOperation.cards ?? {},
        stateAfterFirst: stateAfterServerOperation.cards ?? {},
        innerTransform: ({ first, second, prevState, nextState }) =>
            Card.serverTransform({
                stateBeforeServerOperation: prevState,
                stateAfterServerOperation: nextState,
                serverOperation: first,
                clientOperation: second,
            }),
        toServerState: state => state,
        cancellationPolicy: {},
    });
    if (cards.isError) {
        return cards;
    }

    const twoWayOperation: TwoWayOperation<typeof template> = {
        $v: 1,
        $r: 1,
        cards: cards.value,
    };

    const description = NullableTextOperation.serverTransform({
        first: serverOperation?.description,
        second: clientOperation.description,
        prevState: stateBeforeServerOperation.description,
    });
    if (description.error) {
        return description;
    }
    twoWayOperation.description = description.value;

    const name = NullableTextOperation.serverTransform({
        first: serverOperation?.name,
        second: clientOperation.name,
        prevState: stateBeforeServerOperation.name,
    });
    if (name.error) {
        return name;
    }
    twoWayOperation.name = name.value;

    if (isIdRecord(twoWayOperation)) {
        return Result.ok(undefined);
    }

    return Result.ok(twoWayOperation);
};
