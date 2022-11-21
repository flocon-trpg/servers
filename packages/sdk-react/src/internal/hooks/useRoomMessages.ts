import { RoomClient } from '@flocon-trpg/sdk';
import { Diff, Message } from '@flocon-trpg/web-server-utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useReadonlyBehaviorEvent } from './useReadonlyBehaviorEvent';

/**
 * 部屋に投稿されたメッセージ(秘話およびログも含む)およびカスタムメッセージのリストと変更点を返します。
 *
 * @param filter function が渡された場合、true を返すメッセージのみを抽出します。変更されるたびに全てのメッセージの抽出処理が行われるため、function を渡す場合は useCallback などを用いる必要があります。
 */
export const useRoomMessages = <TCustomMessage, TGraphQLError>(
    roomClient: Pick<RoomClient<TCustomMessage, TGraphQLError>, 'messages'>,
    filter?: (message: Message<TCustomMessage>) => boolean
) => {
    type MessagesType = {
        /** メッセージの配列です。作成日時によって昇順にソートされています。 */
        current: readonly Message<TCustomMessage>[];

        /**
         * 追加、変更、削除されたメッセージです。ただし、メッセージの多くが変更されたとき(Query による更新など)はundefined になります。
         *
         * ブラウザでの通知に用いられることを想定しています。
         */
        diff?: Diff<TCustomMessage> | undefined;
    };

    const queryStatus = useReadonlyBehaviorEvent(roomClient.messages.queryStatus);

    const messagesSource = useMemo(() => {
        return filter == null
            ? roomClient.messages.messages
            : roomClient.messages.messages.filter(filter);
    }, [filter, roomClient.messages.messages]);

    const [messages, setMessages] = useState<MessagesType>(() => ({
        current: messagesSource?.getCurrent() ?? [],
    }));

    useEffect(() => {
        if (messagesSource == null) {
            return;
        }
        setMessages({ current: messagesSource.getCurrent() });
        const subscription = messagesSource.changed.subscribe({
            next: e => {
                setMessages({
                    current: e.current,
                    diff: e.type === 'event' ? e.diff ?? undefined : undefined,
                });
            },
        });
        return () => subscription.unsubscribe();
    }, [messagesSource]);

    return React.useMemo(() => ({ messages, queryStatus }), [messages, queryStatus]);
};
