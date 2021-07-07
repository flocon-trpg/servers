import { ApolloError } from '@apollo/client';
import { AnyAction, Reducer } from '@reduxjs/toolkit';
import { GraphQLError } from 'graphql';
import { RoomEventSubscription } from '../generated/graphql';
import { AllRoomMessagesResult } from '../hooks/useRoomMessages';
import { RoomState } from '../hooks/useRoomState';

export namespace Notification {
    export const text = 'text';
    export const graphQLErrors = 'graphQLErrors';
    export const apolloError = 'apolloError';

    export type StateElement = {
        type: 'success' | 'info' | 'warning' | 'error';
        message: string;
        description?: string;
        createdAt: number;
    }

    // systemMessageなどとマージするので、createdAtの型はそれに合わせてnumberにしている。
    export type Payload = {
        type: typeof text;
        notification: StateElement;
    } | {
        type: typeof graphQLErrors;
        errors: ReadonlyArray<GraphQLError>;
        createdAt: number;
    } | {
        type: typeof apolloError;
        error: ApolloError;
        createdAt: number;
    }

    export const toTextNotification = (source: Payload): StateElement => {
        if (source.type === text) {
            return source.notification;
        }
        if (source.type === apolloError) {
            return {
                type: 'error',
                message: 'Apollo error',
                description: source.error.message,
                createdAt: source.createdAt,
            };
        }
        const firstError = source.errors[0];
        return {
            type: 'error',
            message: 'GraqhQL error',
            description: firstError == null ? undefined : firstError.message,
            createdAt: source.createdAt,
        };
    };

    export type State = {
        readonly values: ReadonlyArray<StateElement>;
        readonly newValue: StateElement | null;
    }

    export const initialState: State = { values: [], newValue: null };
}



// 例えばRoomのルートに近い方でContext.ProviderでroomState.stateなどを渡してから下階層の各地でuseContextで取得する方法は、roomState.stateの一部が変わるだけでRoomほぼ全体が再レンダリングされるため、非常に重くなると思われる。そのため、Reduxを使うことで高速化を狙っている。
// Room.State のオブジェクトは複雑であり、パフォーマンスの低下を招きそうなので immer を使いたくない(そもそもTypescriptの型チェックを通らないため、不具合も生じる可能性がある)ため、createSliceを避けて直接書いている。
namespace roomModule {
    export type State = {
        roomId?: string;
        roomState?: RoomState;
        roomEventSubscription?: RoomEventSubscription;
        allRoomMessagesResult?: AllRoomMessagesResult;
        notifications: Notification.State;
    }

    const initialState: State = {
        notifications: Notification.initialState,
    };

    type SetRoomAction = Partial<Omit<State, 'notification'>>;

    const setRoomType = 'roomModule:setRoom';
    const addNotificationType = 'roomModule:addNotification';
    const resetType = 'roomModule:reset';

    export const reducer: Reducer<State, AnyAction> = (state, action): State => {
        switch (action.type) {
            case setRoomType: {
                const payload: SetRoomAction = action.payload;
                return {
                    roomId: payload.roomId ?? state?.roomId,
                    roomState: payload.roomState ?? state?.roomState,
                    roomEventSubscription: payload.roomEventSubscription ?? state?.roomEventSubscription,
                    allRoomMessagesResult: payload.allRoomMessagesResult ?? state?.allRoomMessagesResult,
                    notifications: state?.notifications ?? Notification.initialState,
                };
            }
            case addNotificationType: {
                const payload: Notification.Payload = action.payload;
                const textNotification = Notification.toTextNotification(payload);
                return {
                    ...(state ?? initialState),
                    notifications: {
                        values: state == null ? [textNotification] : [...state.notifications.values, textNotification],
                        newValue: textNotification,
                    },
                };
            }
            case resetType: {
                return initialState;
            }
            default:
                return state ?? initialState;
        }
    };

    export namespace actions {
        export const setRoom = (payload: SetRoomAction) => {
            return {
                type: setRoomType,
                payload,
            };
        };

        export const addNotification = (payload: Notification.Payload) => {
            return {
                type: addNotificationType,
                payload,
            };
        };

        export const reset = () => {
            return {
                type: resetType,
                payload: null,
            };
        };
    }
}

export default roomModule;