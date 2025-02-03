import 'isomorphic-fetch'; // node.jsでは、これがないとエラーが出る。
import { CompositeTestRoomEventSubscription, TestRoomEventSubscription } from './subscription';
import { TestClient } from './testClient';

type ConstructorParams<TUserUids extends ReadonlyArray<string>> = {
    httpGraphQLUri: string;
    wsGraphQLUri: string;
    userUids: TUserUids;
};

type Clients<TUserUids extends ReadonlyArray<string>> = { [_ in TUserUids[number]]: TestClient };
type Subscriptions<TUserUids extends ReadonlyArray<string>> = {
    [_ in TUserUids[number]]: TestRoomEventSubscription;
};

export class TestClients<TUserUids extends ReadonlyArray<string>> {
    public readonly clients: Clients<TUserUids>;

    public constructor(params: ConstructorParams<TUserUids>) {
        const { httpGraphQLUri, wsGraphQLUri, userUids } = params;

        const record: Record<string, TestClient> = {};
        for (const userUid of userUids) {
            record[userUid] = new TestClient({
                httpUrl: httpGraphQLUri,
                wsUrl: wsGraphQLUri,
                testAuthorizationHeaderValue: userUid,
            });
        }

        this.clients = record as Clients<TUserUids>;
    }

    public beginSubscriptions(roomId: string) {
        const subscriptionsRecord: Record<string, TestRoomEventSubscription> = {};
        for (const userUid in this.clients) {
            const client = (this.clients as Record<string, TestClient>)[userUid];
            if (client == null) {
                throw new Error('this should not happen');
            }

            const subscription = client.roomEventSubscription({ roomId });
            subscriptionsRecord[userUid] = subscription;
        }

        const allSubscriptions = new CompositeTestRoomEventSubscription(
            subscriptionsRecord as { [_ in TUserUids[number]]: TestRoomEventSubscription },
        );
        return { all: allSubscriptions, value: subscriptionsRecord as Subscriptions<TUserUids> };
    }
}
