import {
    GetMessagesDocument,
    GetRoomMessagesFailureType,
    RoomEventSubscription,
    RoomMessageEventFragment,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import {
    AllRoomMessages,
    Diff,
    Message,
    RoomMessagesClient,
    clear,
    event,
    query,
    reset,
} from '@flocon-trpg/web-server-utils';
import { Result } from '@kizahasi/result';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { useQuery } from 'react-query';
import { useLatest } from 'react-use';
import { CombinedError, useClient } from 'urql';
import { appConsole } from '../utils/appConsole';
import { useMyUserUid } from './useMyUserUid';

export const graphqlError = 'graphqlError';
export const failure = 'failure';

type Error =
    | {
          type: typeof graphqlError;
          error: CombinedError;
      }
    | {
          type: typeof failure;
          failureType: GetRoomMessagesFailureType;
      };

export const notFetch = 'notFetch';

type RoomMessageChangeEvent = Result<AllRoomMessages, Error> | typeof notFetch;

const changeEventAtom = atom<RoomMessageChangeEvent>(notFetch);

// 使い方:
// 1. どこかでuseStartFetchingRoomMessagesを呼ぶ。ただし同時に複数箇所で呼び出してはならない。
// 2. useRoomMessagesを呼ぶ。こちらは複数箇所で同時に呼び出してもいい。

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
    const client = useClient();
    // HACK: urqlのuseQueryでpauseを使う方法だと https://stackoverflow.com/questions/63035058/urql-usequerys-pause-option-doesnt-freezes-the-request-temporarily のようなバグ？が発生し、他の無関係のmutationなどを実行するたびにGetMessagesDocumentが実行されてしまう。これにより、通信量が多くなるといった問題が発生した。加えて、APIサーバーに大きな負荷がかかる懸念がある。そのため、とりあえずこのQueryに関してはurqlのuseQueryを使うことは避けている。
    // バグの原因を自分なりに調査してみたが、想定外のGetMessagesDocumentQueryが実行される際に次のことがわかっている。
    // - Client.executeQueryメソッドは呼び出されていない。
    // - exchangeには渡っている。
    // このことから、おそらくwonkaのshareあたりが怪しい気がする。stackoverflowの正常なサンプルとFloconのコードの違いを見るに、もしかしたらContextのclientインスタンスが途中で置き換わるのが発生要因の1つかも？ただ、完全な原因の特定はできていない。
    const messages = useQuery(['GetMessagesDocument', roomId, beginFetch], () => {
        if (!beginFetch) {
            return null;
        }
        return client.query(GetMessagesDocument, { roomId }).toPromise();
    });
    const refCount = React.useRef(0);

    React.useEffect(() => {
        if (refCount.current >= 1) {
            appConsole.warn(
                'You should not use `useStartFetchingRoomMessages` hook multiple times.'
            );
        }
        refCount.current += 1;
        messagesClient.current.clear();
        setResult(Result.ok(messagesClient.current.messages));
        return () => {
            refCount.current -= 1;
        };
    }, [roomId, myUserUid, setResult, resultRef]);

    React.useEffect(() => {
        if (messages.data == null) {
            return;
        }
        const messagesData = messages.data.data;
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
        const messagesError = messages.data.error;
        if (messagesError != null) {
            setResult(Result.error({ type: graphqlError, error: messagesError }));
        }
    }, [messages.data, setResult]);

    React.useEffect(() => {
        const messageEvent: RoomMessageEventFragment | null | undefined =
            roomEventSubscription?.roomEvent?.roomMessageEvent;
        if (messageEvent != null) {
            messagesClient.current.onEvent(messageEvent);
        }
    }, [roomEventSubscription]);
};

type RoomMessages =
    | {
          type: typeof reset;
          current?: undefined;
          diff?: undefined;
      }
    | {
          type: typeof event;
          current: readonly Message[];
          diff: Diff;
      }
    | {
          type: typeof query | typeof reset;
          current: readonly Message[];
          diff?: undefined;
      };

// Storybook用
export const useMockRoomMessages = () => {
    const setResult = useUpdateAtom(changeEventAtom);
    const messagesClient = React.useRef(new RoomMessagesClient());
    const onQuery = React.useCallback(
        (query: Parameters<typeof messagesClient.current.onQuery>[0]) => {
            messagesClient.current.onQuery(query);
            setResult(Result.ok(messagesClient.current.messages));
        },
        [setResult]
    );
    const onEvent = React.useCallback(
        (event: Parameters<typeof messagesClient.current.onEvent>[0]) => {
            messagesClient.current.onEvent(event);
            setResult(Result.ok(messagesClient.current.messages));
        },
        [setResult]
    );
    const setAsNotFetch = React.useCallback(() => {
        setResult('notFetch');
    }, [setResult]);

    return React.useMemo(
        () => ({
            onQuery,
            onEvent,
            setAsNotFetch,
        }),
        [onEvent, onQuery, setAsNotFetch]
    );
};

type RoomMessagesResult = Result<RoomMessages, Error> | typeof notFetch;

export const useRoomMessages = ({
    filter,
}: {
    filter?: (message: Message) => boolean;
}): RoomMessagesResult => {
    const [result, setResult] = React.useState<RoomMessagesResult>(notFetch);
    const changeEvent = useAtomValue(changeEventAtom);

    React.useEffect(() => {
        if (changeEvent === notFetch) {
            setResult(notFetch);
            return;
        }
        if (changeEvent.isError) {
            setResult(changeEvent);
            return;
        }
        const fileredChangeEvent =
            filter == null ? changeEvent.value : changeEvent.value.filter(filter);
        const current = fileredChangeEvent.getCurrent();
        setResult(
            Result.ok({
                type: query,
                current: current ?? [],
            })
        );
        const subscription = fileredChangeEvent.changed.subscribe(msg => {
            switch (msg.type) {
                case event: {
                    if (msg.diff == null) {
                        return;
                    }
                    setResult(Result.ok({ type: event, current: msg.current, diff: msg.diff }));
                    return;
                }
                case query: {
                    setResult(Result.ok({ type: query, current: msg.current }));
                    return;
                }
                case clear: {
                    setResult(Result.ok({ type: reset, current: msg.current }));
                    return;
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [changeEvent, filter]);

    return result;
};

export const useRoomMessageEvent = () => {
    const messages = useRoomMessages({});
    const [result, setResult] = React.useState<Diff>();

    React.useEffect(() => {
        if (messages === notFetch || messages.isError || messages.value.diff == null) {
            return;
        }
        setResult(messages.value.diff);
    }, [messages]);

    return result;
};
