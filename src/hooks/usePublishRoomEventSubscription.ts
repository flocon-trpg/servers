import { ApolloError } from '@apollo/client';
import React from 'react';
import { Observable, Subject } from 'rxjs';
import { RoomEventSubscription, useRoomEventSubscription } from '../generated/graphql';

type Result = {
    observable: Observable<RoomEventSubscription>;
    data?: RoomEventSubscription;
    loading: boolean;
    error?: ApolloError;
}

// 1つのSubscriptionのみで、複数の場所でsubscribeできるようにするHook。Rxにおけるpublishのようなことをしている。ただ、現状では必要ないかもしれない。
export function usePublishRoomEventSubscription(roomId: string): Result {
    const { data, loading, error } = useRoomEventSubscription({ variables: { id: roomId } });
    const subjectRef = React.useRef(new Subject<RoomEventSubscription>());

    React.useEffect(() => {
        subjectRef.current.complete();
        subjectRef.current.unsubscribe();
        subjectRef.current = new Subject();
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
        observable: subjectRef.current,
        data,
        loading,
        error,
    };
}