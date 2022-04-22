import { ApolloError, useLazyQuery } from '@apollo/client';
import React from 'react';
import {
    RoomMessageEventFragment,
    RoomEventSubscription,
    GetRoomMessagesFailureType,
    GetMessagesDocument,
} from '@flocon-trpg/typed-document-node';
import {
    loading,
    Message,
    RoomMessagesClient,
    AllRoomMessages,
    onEvent,
    onQuery,
} from '@flocon-trpg/web-server-utils';
import { useMyUserUid } from './useMyUserUid';
import { useLatest } from 'react-use';
import { Result } from '@kizahasi/result';
import { atom, useAtom, useAtomValue } from 'jotai';
import { appConsole } from '../utils/appConsole';

export const apolloError = 'apolloError';
export const failure = 'failure';

type Error =
    | {
          type: typeof apolloError;
          error: ApolloError;
      }
    | {
          type: typeof failure;
          failureType: GetRoomMessagesFailureType;
      };

export const noref = 'noref';

type RoomMessageChangeEvent = Result<AllRoomMessages, Error> | typeof noref;

const changeEventAtom = atom<RoomMessageChangeEvent>(noref);

// 使い方:
// 1. どこかでuseStartFetchingRoomMessagesを1回だけ呼ぶ。
// 2. useRoomMesagesを呼ぶ。こちらは複数箇所で同時に呼び出してもいい。

export const useStartFetchingRoomMessages = ({
    roomId,
    roomEventSubscription,
    beginFetch,
}: {
    roomId: string;
    roomEventSubscription: RoomEventSubscription | undefined;

    // もしこれがないと、Room作成者以外がRoomに入室するとき、まだnonJoinedの段階でuseGetMessagesLazyQueryを呼び出してしまうためNotParticipantエラーが返され、メッセージウィンドウがエラーになる。これはブラウザを更新するだけで直る軽微なバグではあるが、beginFetchを設けることでuseGetMessagesLazyQueryが呼び出されるタイミングを遅らせることでバグを回避している。
    beginFetch: boolean;
}): void => {
    const myUserUid = useMyUserUid();
    const messagesClient = React.useRef(new RoomMessagesClient());
    const [result, setResult] = useAtom(changeEventAtom);
    const resultRef = useLatest(result);
    const [getMessages, messages] = useLazyQuery(GetMessagesDocument, {
        fetchPolicy: 'network-only',
    });

    React.useEffect(() => {
        if (resultRef.current !== noref) {
            appConsole.warn(
                '`useSubscribeRoomMessages` tried to subscribe multiple times at once.'
            );
            return;
        }
        const client = new RoomMessagesClient();
        messagesClient.current = client;
        setResult(Result.ok(client.messages));
        return () => setResult(noref);
    }, [roomId, myUserUid, setResult, resultRef]);

    React.useEffect(() => {
        if (myUserUid == null || !beginFetch) {
            return;
        }
        getMessages({ variables: { roomId } });
    }, [roomId, myUserUid, beginFetch, getMessages]);

    React.useEffect(() => {
        const messagesData = messages.data;
        if (messagesData != null) {
            switch (messagesData.result.__typename) {
                case 'GetRoomMessagesFailureResult':
                    setResult(
                        Result.error({
                            type: failure,
                            failureType: messagesData.result.failureType,
                        })
                    );
                    return;
                case 'RoomMessages': {
                    messagesClient.current.onQuery(messagesData.result);
                    return;
                }
                default:
                    return;
            }
        }
        const messagesError = messages.error;
        if (messagesError != null) {
            setResult(Result.error({ type: apolloError, error: messagesError }));
        }
    }, [messages.data, messages.error, setResult]);

    React.useEffect(() => {
        const messageEvent: RoomMessageEventFragment | null | undefined =
            roomEventSubscription?.roomEvent?.roomMessageEvent;
        if (messageEvent != null) {
            messagesClient.current.onEvent(messageEvent);
        }
    }, [roomEventSubscription]);
};

export const filterUpdate = 'filterUpdate';

type RoomMessages =
    | {
          type: typeof loading;
          current?: undefined;
          event: RoomMessageEventFragment | undefined;
      }
    | {
          type: typeof onEvent;
          current: readonly Message[];
          event: RoomMessageEventFragment;
      }
    | {
          type: typeof onQuery | typeof filterUpdate;
          current: readonly Message[];
          event?: undefined;
      };

type RoomMessagesResult = Result<RoomMessages, Error> | typeof noref;

export const useRoomMesages = ({
    filter,
}: {
    filter?: (message: Message) => boolean;
}): RoomMessagesResult => {
    const [result, setResult] = React.useState<RoomMessagesResult>(noref);
    const changeEvent = useAtomValue(changeEventAtom);
    const filterRef = useLatest(filter);

    React.useEffect(() => {
        setResult(oldValue => {
            if (oldValue === noref) {
                return oldValue;
            }
            if (oldValue.isError) {
                return oldValue;
            }
            if (oldValue.value.type === loading) {
                return oldValue;
            }
            return Result.ok({
                type: filterUpdate,
                current:
                    filter == null ? oldValue.value.current : oldValue.value.current.filter(filter),
            });
        });
    }, [filter]);

    React.useEffect(() => {
        if (changeEvent === noref) {
            setResult(noref);
            return;
        }
        if (changeEvent.isError) {
            setResult(changeEvent);
            return;
        }
        const eventValue =
            filterRef.current == null
                ? changeEvent.value
                : changeEvent.value.filter(filterRef.current);
        setResult(
            Result.ok({
                type: onQuery,
                current: eventValue.getCurrent() ?? [],
            })
        );
        const subscription = eventValue.changed.subscribe(msg => setResult(Result.ok(msg)));
        return () => subscription.unsubscribe();
    }, [changeEvent, filterRef]);

    return result;
};

export const useRoomMessageEvent = () => {
    const messages = useRoomMesages({});
    const [result, setResult] = React.useState<RoomMessageEventFragment>();

    React.useEffect(() => {
        if (messages === noref || messages.isError) {
            return;
        }
        setResult(messages.value.event);
    }, [messages]);

    return result;
};
