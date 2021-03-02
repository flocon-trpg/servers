import produce from 'immer';
import { StrIndex5 } from '../../@shared/indexes';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import { ReplaceRoomBgmOperationInput, RoomBgmOperationInput, RoomBgmsOperationInput, RoomBgmValueState, UpdateRoomBgmOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { OperationElement, replace } from './types';
import { ReplaceNullableValueOperationModule, ReplaceValueOperationModule } from './utils/replaceValueOperation';

export namespace RoomBgm {
    export type State = Omit<RoomBgmValueState, '__typename'>;
    export type PostOperation = RoomBgmOperationInput;
    export type GetOperation = PostOperation;

    export const toGraphQLInput = (source: ReadonlyMap<StrIndex5, OperationElement<State, PostOperation>>): RoomBgmsOperationInput => {
        const replaces: ReplaceRoomBgmOperationInput[] = [];
        const updates: UpdateRoomBgmOperationInput[] = [];
        for (const [key, value] of source) {
            if (value.type === replace) {
                replaces.push({ channelKey: key, newValue: value.newValue });
                continue;
            }
            updates.push({ channelKey: key, operation: value.operation });
        }
        return { replace: replaces, update: updates };
    };

    export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
        return produce(state, state => {
            if (operation.files != null) {
                state.files = operation.files.newValue;
            }
            if (operation.volume != null) {
                state.volume = operation.volume.newValue;
            }
        });
    };

    export const compose = ({
        first,
        second
    }: {
        first: PostOperation;
        second: PostOperation;
    }): PostOperation => {
        const result: PostOperation = { ...first };

        result.files = ReplaceValueOperationModule.compose(first.files, second.files);
        result.volume = ReplaceValueOperationModule.compose(first.volume, second.volume);

        return result;
    };

    export const transform = ({
        first,
        second
    }: {
        first: GetOperation;
        second: PostOperation;
    }): { firstPrime: GetOperation; secondPrime: PostOperation } => {
        const firstPrime: PostOperation = {};
        const secondPrime: PostOperation = {};

        firstPrime.files = transformReplace({ first: first.files, second: second.files }).firstPrime;
        secondPrime.files = transformReplace({ first: first.files, second: second.files }).secondPrime;

        firstPrime.volume = transformReplace({ first: first.volume, second: second.volume }).firstPrime;
        secondPrime.volume = transformReplace({ first: first.volume, second: second.volume }).secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation => {
        const result: GetOperation = {};

        if (prev.files != next.files) {
            result.files = { newValue: next.files };
        }
        if (prev.volume != next.volume) {
            result.volume = { newValue: next.volume };
        }

        return result;
    };
}