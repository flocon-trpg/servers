import { useApolloClient, useMutation, useSubscription } from '@apollo/client';
import { Button, InputNumber } from 'antd';
import { GraphQLError } from 'graphql';
import React from 'react';
import {
    PingDocument,
    PongDocument,
    PongSubscription,
    PongSubscriptionVariables,
} from '@flocon-trpg/typed-document-node';

type PongObservableResultState =
    | {
          type: 'success';
          value: {
              createdBy?: string | null;
              value: number;
          };
      }
    | {
          type: 'errors';
          errors: readonly GraphQLError[];
      }
    | {
          type: 'observableError';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: any;
      }
    | {
          type: 'complete';
      };

const PingPongCore: React.FC = () => {
    const apolloClient = useApolloClient();
    const [pingMutation, pingMutationResult] = useMutation(PingDocument);
    const pongSubscription = useSubscription(PongDocument);
    const [postValue, setPostValue] = React.useState(0);
    const [pongObservableResult, setPongObservableResult] =
        React.useState<PongObservableResultState>();

    React.useEffect(() => {
        const subscription = apolloClient
            .subscribe<PongSubscription, PongSubscriptionVariables>({ query: PongDocument })
            .subscribe(
                pong => {
                    if (pong.data != null) {
                        setPongObservableResult({ type: 'success', value: pong.data.pong });
                        return;
                    }
                    if (pong.errors != null) {
                        setPongObservableResult({ type: 'errors', errors: pong.errors });
                    }
                },
                error => setPongObservableResult({ type: 'observableError', error }),
                () => setPongObservableResult({ type: 'complete' })
            );
        return () => subscription.unsubscribe();
    }, [apolloClient]);

    const pingMutationResponse: JSX.Element | null = (() => {
        if (pingMutationResult.error != null) {
            return <div>{pingMutationResult.error.message}</div>;
        }
        if (pingMutationResult.data != null) {
            return (
                <>
                    <div>{pingMutationResult.data.result.value}</div>
                    <div>{pingMutationResult.data.result.createdBy ?? '(anonymous)'}</div>
                </>
            );
        }
        return null;
    })();

    const pongObservableResponse: JSX.Element | JSX.Element[] | null = (() => {
        if (pongObservableResult == null) {
            return <div>no value</div>;
        }
        switch (pongObservableResult.type) {
            case 'success':
                return (
                    <>
                        <div>{pongObservableResult.value.value}</div>
                        <div>{pongObservableResult.value.createdBy ?? '(anonymous)'}</div>
                    </>
                );
            case 'errors':
                return pongObservableResult.errors.map((error, index) => (
                    <div key={index}>{error.message}</div>
                ));
            case 'observableError':
                return <div>{pongObservableResult.error}</div>;
            case 'complete':
                return <div>complete</div>;
        }
    })();

    const pongHooksResponse: JSX.Element | null = (() => {
        if (pongSubscription.error != null) {
            return <div>{pongSubscription.error.message}</div>;
        }
        if (pongSubscription.loading) {
            return <div>loading</div>;
        }
        if (pongSubscription.data != null) {
            return (
                <>
                    <div>{pongSubscription.data.pong.value}</div>
                    <div>{pongSubscription.data.pong.createdBy ?? '(anonymous)'}</div>
                </>
            );
        }
        return null;
    })();

    return (
        <div>
            <h2>ping pong test</h2>
            <div>You can do simple tests of GraphQL subscription here.</div>
            <div>This subscribes pongs invoked by other users.</div>
            <InputNumber
                value={postValue}
                onChange={value => (typeof value === 'number' ? setPostValue(value) : undefined)}
            />
            <Button
                onClick={() => pingMutation({ variables: { value: postValue } })}
                type='primary'
            >
                Ping
            </Button>
            <h3>ping response (mutation)</h3>
            {pingMutationResponse}
            <h3>pong (observable)</h3>
            {pongObservableResponse}
            <h3>pong (hooks)</h3>
            {pongHooksResponse}
        </div>
    );
};

const PingPong: React.FC = () => {
    return <PingPongCore />;
};

export default PingPong;
