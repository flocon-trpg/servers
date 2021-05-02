import produce from 'immer';
import React from 'react';
import { Subject } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import useConstant from 'use-constant';
import { $free } from '../@shared/Constants';
import { PublicChannelKey } from '../@shared/publicChannelKey';
import { useUpdateWritingMessageStatusMutation, WritingMessageStatusInputType } from '../generated/graphql';
import { VisibleTo } from '../utils/visibleTo';
import { useMap } from './useMap';

type MessagePair = {
    prevMessage: string | undefined;
    currentMessage: string | undefined;
}

export type UseRoomMessageInputTextsResult = {
    publicMessageInputTexts: ReadonlyMap<PublicChannelKey.Without$System.PublicChannelKey, string>;
    privateMessageInputTexts: ReadonlyMap<string, string>;
    setPublicMessageInputText: (newMessage: string | undefined, key: PublicChannelKey.Without$System.PublicChannelKey) => void;
    setPrivateMessageInputText: (newMessage: string | undefined, visibleTo: ReadonlyArray<string> | ReadonlySet<string>) => void;
}

export function useRoomMessageInputTexts({ roomId }: { roomId: string }): UseRoomMessageInputTextsResult {
    const [publicMessageInputTexts, setPublicMessageInputTexts] = React.useState<ReadonlyMap<PublicChannelKey.Without$System.PublicChannelKey, string>>(new Map());
    const [privateMessageInputTexts, setPrivateMessageInputTexts] = React.useState<ReadonlyMap<string, string>>(new Map());

    const [writingMessageStatusMutation] = useUpdateWritingMessageStatusMutation();

    const subject1 = useConstant(() => new Subject<MessagePair>());
    const subject2 = useConstant(() => new Subject<MessagePair>());
    const subject3 = useConstant(() => new Subject<MessagePair>());
    const subject4 = useConstant(() => new Subject<MessagePair>());
    const subject5 = useConstant(() => new Subject<MessagePair>());
    const subject6 = useConstant(() => new Subject<MessagePair>());
    const subject7 = useConstant(() => new Subject<MessagePair>());
    const subject8 = useConstant(() => new Subject<MessagePair>());
    const subject9 = useConstant(() => new Subject<MessagePair>());
    const subject10 = useConstant(() => new Subject<MessagePair>());
    const subject$free = useConstant(() => new Subject<MessagePair>());

    const subjects = useConstant(() => {
        return new Map([
            ['1', subject1],
            ['2', subject2],
            ['3', subject3],
            ['4', subject4],
            ['5', subject5],
            ['6', subject6],
            ['7', subject7],
            ['8', subject8],
            ['9', subject9],
            ['10', subject10],
            [$free, subject$free],
        ] as const);
    });

    React.useEffect(() => {
        let unsubscribed = false;

        const subscriptions = [...subjects].map(([publicChannelKey, subject]) => {
            return subject.pipe(bufferTime(2000)).subscribe(ary => {
                if (unsubscribed) {
                    return;
                }

                const messagePair = ary.reduce((seed, elem) => {
                    if (seed == null) {
                        return elem;
                    }
                    return { ...seed, currentMessage: elem.currentMessage };
                }, null as MessagePair | null);
                if (messagePair == null) {
                    return;
                }
                const prevMessage = messagePair.prevMessage ?? '';
                const currentMessage = messagePair.currentMessage ?? '';
                let newStatus: WritingMessageStatusInputType;
                if (prevMessage === '') {
                    if (currentMessage === '') {
                        newStatus = WritingMessageStatusInputType.KeepWriting;
                    } else {
                        newStatus = WritingMessageStatusInputType.StartWriting;
                    }
                } else {
                    if (currentMessage === '') {
                        newStatus = WritingMessageStatusInputType.Cleared;
                    } else {
                        newStatus = WritingMessageStatusInputType.KeepWriting;
                    }
                }
                writingMessageStatusMutation({ variables: { roomId, newStatus, publicChannelKey } });
            });
        });

        return (() => {
            unsubscribed = true;
            subscriptions.forEach(s => s.unsubscribe());
        });
    }, [roomId, subjects, writingMessageStatusMutation]);

    const setPublicMessageInputText = React.useCallback((newMessage: string | undefined, key: PublicChannelKey.Without$System.PublicChannelKey) => {
        setPublicMessageInputTexts(oldMap => produce(oldMap, draft => {
            const oldMessage = draft.get(key);
            if (newMessage == null) {
                draft.delete(key);
            } else {
                draft.set(key, newMessage);
            }
            if (oldMessage !== newMessage) {
                subjects.get(key)?.next({ prevMessage: oldMessage, currentMessage: newMessage });
            }
        }));
    }, [setPublicMessageInputTexts, subjects]);

    const setPrivateMessageInputText = React.useCallback((newMessage: string | undefined, visibleTo: ReadonlyArray<string> | ReadonlySet<string>) => {
        setPrivateMessageInputTexts(oldMap => produce(oldMap, draft => {
            const key = VisibleTo.toString(visibleTo);
            if (newMessage == null) {
                draft.delete(key);
            } else {
                draft.set(key, newMessage);
            }
        }));
    }, [setPrivateMessageInputTexts]);

    const result = React.useMemo(() => ({
        publicMessageInputTexts,
        privateMessageInputTexts,
        setPublicMessageInputText,
        setPrivateMessageInputText,
    }), [publicMessageInputTexts, privateMessageInputTexts, setPublicMessageInputText, setPrivateMessageInputText]);

    return result;
}