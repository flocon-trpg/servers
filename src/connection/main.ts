import { PubSub } from 'apollo-server-express';
import { PubSubEngine } from 'graphql-subscriptions';
import { DecodedIdToken } from '../graphql+mikro-orm/utils/Contexts';

export const pubSub = new PubSub();

class InMemoryConnectionManager {
    public constructor() {

    }

    public onConnectToRoom({}: {connectionId: string; decodedIdToken: DecodedIdToken; roomId: string}) {

    }

    public onWriteStart({}: {connectionId: string; decodedIdToken: DecodedIdToken; roomId: string}) {

    }

    public onLeaveRoom({connectionId}: {connectionId: string}) {

    }
}

export const connectionManager = new InMemoryConnectionManager();