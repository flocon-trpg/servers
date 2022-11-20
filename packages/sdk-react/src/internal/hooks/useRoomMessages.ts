import { GetMessagesQueryStatus, RoomClient } from '@flocon-trpg/sdk';
import { Diff, Message } from '@flocon-trpg/web-server-utils';
import { useEffect, useMemo, useState } from 'react';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

export const useRoomMessages = <TCustomMessage, TGraphQLError>(
    roomClient: Pick<RoomClient<TCustomMessage, TGraphQLError>, 'messages'>,
    filter?: (message: Message<TCustomMessage>) => boolean
) => {
    type ResultType = {
        /** メッセージの配列です。作成日時によって昇順にソートされています。 */
        value: readonly Message<TCustomMessage>[];

        /** 追加、変更、削除されたメッセージです。ブラウザで通知を出す際などに用いられます。 */
        diff?: Diff<TCustomMessage> | undefined;

        queryStatus: GetMessagesQueryStatus<TGraphQLError>;
    };

    const queryStatus = useReadonlyBehaviorEvent(roomClient.messages.queryStatus);

    const messages = useMemo(() => {
        return filter == null
            ? roomClient.messages.messages
            : roomClient.messages.messages.filter(filter);
    }, [filter, roomClient.messages.messages]);

    const [result, setResult] = useState<ResultType>(() => ({
        value: messages?.getCurrent() ?? [],
        queryStatus,
    }));

    useEffect(() => {
        if (messages == null) {
            return;
        }
        const subscription = messages.changed.subscribe({
            next: e => {
                setResult(prevState => ({
                    ...prevState,
                    value: e.current,
                    diff: e.type === 'event' ? e.diff ?? undefined : undefined,
                }));
            },
        });
        return () => subscription.unsubscribe();
    }, [messages]);

    return result;
};
