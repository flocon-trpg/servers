import { ApolloError, useSubscription } from '@apollo/client';
import React from 'react';
import { Observable, Subject } from 'rxjs';
import { RoomEventDocument, RoomEventSubscription } from '@flocon-trpg/typed-document-node-v0.7.1';

type Result = {
    observable: Observable<RoomEventSubscription>;
    data?: RoomEventSubscription;
    loading: boolean;
    error?: ApolloError;
};

// 1つのSubscriptionのみで、複数の場所でsubscribeできるようにするHook。Rxにおけるpublishのようなことをしている。ただ、現状では必要ないかもしれない。
export function usePublishRoomEventSubscription(roomId: string): Result {
    const { data, loading, error } = useSubscription(RoomEventDocument, {
        variables: { id: roomId },
    });
    const [subject, setSubject] = React.useState(new Subject<RoomEventSubscription>());
    const subjectRef = React.useRef(subject);

    React.useEffect(() => {
        subjectRef.current = subject;
    }, [subject]);
    React.useEffect(() => {
        setSubject(subject => {
            subject.complete();
            return new Subject();
        });
    }, [roomId]);
    React.useEffect(() => {
        if (data == null) {
            return;
        }
        subjectRef.current.next(data);
    }, [data]);

    React.useEffect(() => {
        if (error == null) {
            return;
        }
        subjectRef.current.error(error);
    }, [error]);

    return {
        observable: subject,
        data,
        loading,
        error,
    };
}
