import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Context } from 'graphql-ws';
import { z } from 'zod';

export type TypedExecutionContext =
    | {
          type: 'graphql-ws';
          // CONSIDER: Context という型で合っているかは要確認
          request: Context;
      }
    | {
          type: 'graphql' | 'http';
          // CONSIDER: Request という型で合っているかは要確認
          request: Request;
      }
    | {
          type: 'ws' | 'rpc';
          // 現時点では使用されていないため、type 以外のプロパティは未実装
      };

const wsContextSchema = z.object({
    connectionInitReceived: z.boolean(),
    acknowledged: z.boolean(),
    subscriptions: z.record(z.unknown()),
});

const isGqlSubscription = (context: GqlExecutionContext): boolean => {
    // 下の GitHub の URL を見るに、getContext メソッドには副作用はない。そのため、型が any である値を引数にしないように、代わりに GqlExecutionContext 型にして、この関数内部で getContext メソッドを呼び出す形にしているが問題ない。
    // https://github.com/nestjs/graphql/blob/480fe4585c2480bd0ff7ecdfeef82a8c86434f61/packages/graphql/lib/services/gql-execution-context.ts#L37
    // https://github.com/nestjs/nest/blob/9719731c11c4467311a9d5519b9189c786da89d7/packages/core/helpers/execution-context-host.ts#L40

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const request = context.getContext().req;
    return wsContextSchema.safeParse(request).success;
};

export const parseExecutionContext = (context: ExecutionContext): TypedExecutionContext => {
    const contextType = context.getType<GqlContextType>();
    switch (contextType) {
        case 'http': {
            const httpContext = context.switchToHttp();
            return {
                type: 'http',
                request: httpContext.getRequest() satisfies Request,
            };
        }
        case 'graphql': {
            const graphqlContext = GqlExecutionContext.create(context);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const req: unknown = graphqlContext.getContext().req;
            if (isGqlSubscription(graphqlContext)) {
                return {
                    type: 'graphql-ws',
                    request: req as Context,
                };
            } else {
                return {
                    type: 'graphql',
                    request: req as Request,
                };
            }
        }
        default: {
            return { type: contextType };
        }
    }
};
