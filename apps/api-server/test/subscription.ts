/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RoomEventSubscription } from '@flocon-trpg/typed-document-node';
import _ from 'lodash';
import { Source, pipe, subscribe } from 'wonka';
import { OperationResult } from '@urql/core';

export class TestRoomEventSubscription {
    private values: RoomEventSubscription[] = [];

    public constructor(source: Source<OperationResult<RoomEventSubscription>>) {
        pipe(
            source,
            subscribe(result => {
                if (result.error != null) {
                    throw result.error;
                }
                if (result.data != null) {
                    this.values.push(result.data);
                }
            })
        );
    }

    public clear() {
        this.values = [];
    }

    public toBeEmpty() {
        expect(this.values.every(x => x.roomEvent == null)).toBe(true);
    }

    public toBeExactlyOneRoomConnectionEvent({
        event,
        userUid,
    }: {
        event: 'connect' | 'disconnect';
        userUid: string;
    }) {
        expect(this.values).toHaveLength(1);
        const roomConnectionEvents = _(this.values)
            .map(x => x.roomEvent?.roomConnectionEvent)
            .compact()
            .value();
        expect(roomConnectionEvents).toHaveLength(1);
        const actualEvent = roomConnectionEvents[0]!;
        expect(actualEvent.isConnected ? 'connect' : 'disconnect').toBe(event);
        expect(actualEvent.userUid).toBe(userUid);
    }

    public toBeExactlyOneRoomOperationEvent() {
        expect(this.values).toHaveLength(1);
        const roomOperationEvents = _(this.values)
            .map(x => x.roomEvent?.roomOperation)
            .compact()
            .value();
        expect(roomOperationEvents).toHaveLength(1);
        return roomOperationEvents[0];
    }

    public toBeExactlyOneRoomPrivateMessageEvent() {
        expect(this.values).toHaveLength(1);
        const roomPrivateMessages = _(this.values)
            .map(x => {
                const roomMessageEvent = x.roomEvent?.roomMessageEvent;
                if (roomMessageEvent?.__typename !== 'RoomPrivateMessage') {
                    return undefined;
                }
                return roomMessageEvent;
            })
            .compact()
            .value();
        expect(roomPrivateMessages).toHaveLength(1);
        return roomPrivateMessages[0];
    }

    public toBeExactlyOnePieceLogEvent() {
        expect(this.values).toHaveLength(1);
        const pieceLogs = _(this.values)
            .map(x => {
                const roomMessageEvent = x.roomEvent?.roomMessageEvent;
                if (roomMessageEvent?.__typename !== 'PieceLog') {
                    return undefined;
                }
                return roomMessageEvent;
            })
            .compact()
            .value();
        expect(pieceLogs).toHaveLength(1);
        return pieceLogs[0];
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
