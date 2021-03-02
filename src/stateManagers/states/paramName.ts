import produce from 'immer';
import { CustomDualKeyMap, KeyFactory, ReadonlyCustomDualKeyMap } from '../../@shared/CustomDualKeyMap';
import { DualKeyMap, DualKeyMapSource } from '../../@shared/DualKeyMap';
import { StrIndex100, StrIndex5 } from '../../@shared/indexes';
import { ParamNameOperationInput, ParamNamesOperationInput, ParamNameValueState, ReplaceParamNameOperationInput, RoomParameterNameType, UpdateParamNameOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { OperationElement, replace } from './types';
import { ReplaceValueOperationModule } from './utils/replaceValueOperation';

export namespace ParamName {
    export type State = Omit<ParamNameValueState, '__typename'>;
    export type PostOperation = ParamNameOperationInput;
    export type GetOperation = PostOperation;

    export type Key = {
        type: RoomParameterNameType;
        key: StrIndex100;
    }

    export const keyFactory: KeyFactory<Key, RoomParameterNameType, StrIndex100> = {
        createDualKey: x => ({ first: x.type, second: x.key }),
        createKey: x => ({ type: x.first, key: x.second }),
    };

    export type StateMap<T> = CustomDualKeyMap<Key, RoomParameterNameType, StrIndex100, T>;
    export type ReadonlyStateMap<T> = ReadonlyCustomDualKeyMap<Key, RoomParameterNameType, StrIndex100, T>;

    export const createStateMap = <T>(source?: DualKeyMapSource<RoomParameterNameType, StrIndex100, T> | DualKeyMap<RoomParameterNameType, StrIndex5,T>): StateMap<T> => {
        return new CustomDualKeyMap({ ...keyFactory, sourceMap: source });
    };

    export const toGraphQLInput = (source: ReadonlyStateMap<OperationElement<State, PostOperation>>): ParamNamesOperationInput => {
        const replaces: ReplaceParamNameOperationInput[] = [];
        const updates: UpdateParamNameOperationInput[] = [];
        for (const [key, value] of source) {
            if (value.type === replace) {
                replaces.push({ key: key.key, type: key.type, newValue: value.newValue });
                continue;
            }
            updates.push({ key: key.key, type: key.type, operation: value.operation });
        }
        return { replace: replaces, update: updates };
    };

    export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
        return produce(state, state => {
            if (operation.name != null) {
                state.name = operation.name.newValue;
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
        result.name = ReplaceValueOperationModule.compose(first.name, second.name);
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

        firstPrime.name = transformReplace({ first: first.name, second: second.name }).firstPrime;
        secondPrime.name = transformReplace({ first: first.name, second: second.name }).secondPrime;

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

        if (prev.name != next.name) {
            result.name = { newValue: next.name };
        }

        return result;
    };
}