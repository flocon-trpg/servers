import Observable from 'zen-observable';
import { FetchResult } from '@apollo/client';
import { RoomEventSubscription } from './graphql';
import _ from 'lodash';

export class TestRoomEventSubscription {
    private values: FetchResult<RoomEventSubscription>[] = [];

    public constructor(source: Observable<FetchResult<RoomEventSubscription>>) {
        source.subscribe(
            value => this.values.push(value),
            err => {
                throw err;
            }
        );
    }

    public clear() {
        this.values = [];
    }

    public toBeEmpty() {
        expect(this.values).toEqual([]);
    }

    public toBeExactlyOneRoomConnectionEvent({
        event,
        userUid,
    }: {
        event: 'connect' | 'disconnect';
        userUid: string;
    }) {
        expect(this.values.length).toBe(1);
        const roomConnectionEvents = _(this.values)
            .map(x => x.data?.roomEvent?.roomConnectionEvent)
            .compact()
            .value();
        expect(roomConnectionEvents.length).toBe(1);
        const actualEvent = roomConnectionEvents[0];
        expect(actualEvent.isConnected ? 'connect' : 'disconnect').toBe(event);
        expect(actualEvent.userUid).toBe(userUid);
    }

    public toBeExactlyOneRoomOperationEvent() {
        expect(this.values.length).toBe(1);
        const roomOperationEvents = _(this.values)
            .map(x => x.data?.roomEvent?.roomOperation)
            .compact()
            .value();
        expect(roomOperationEvents.length).toBe(1);
        return roomOperationEvents[0];
    }

    public toBeExactlyOneRoomPrivateMessageEvent() {
        expect(this.values.length).toBe(1);
        const roomPrivateMessages = _(this.values)
            .map(x => {
                const roomMessageEvent = x.data?.roomEvent?.roomMessageEvent;
                if (roomMessageEvent?.__typename !== 'RoomPrivateMessage') {
                    return undefined;
                }
                return roomMessageEvent;
            })
            .compact()
            .value();
        expect(roomPrivateMessages.length).toBe(1);
        return roomPrivateMessages[0];
    }

    public toBeExactlyOnePieceValueLogEvent() {
        expect(this.values.length).toBe(1);
        const pieceValueLogs = _(this.values)
            .map(x => {
                const roomMessageEvent = x.data?.roomEvent?.roomMessageEvent;
                if (roomMessageEvent?.__typename !== 'PieceValueLog') {
                    return undefined;
                }
                return roomMessageEvent;
            })
            .compact()
            .value();
        expect(pieceValueLogs.length).toBe(1);
        return pieceValueLogs[0];
    }
}

export class CompositeTestRoomEventSubscription {
    public constructor(private readonly instances: TestRoomEventSubscription[]) {}

    public clear() {
        this.instances.forEach(x => x.clear());
    }

    public toBeEmpty() {
        this.instances.forEach(x => x.toBeEmpty());
    }

    public except(...instances: TestRoomEventSubscription[]): CompositeTestRoomEventSubscription {
        const newSubscriptions = [...this.instances];
        instances.forEach(x => {
            const index = newSubscriptions.indexOf(x);
            if (index < 0) {
                throw new Error('the subscription not found');
            }
            newSubscriptions.splice(index, 1);
        });
        return new CompositeTestRoomEventSubscription(newSubscriptions);
    }
}
