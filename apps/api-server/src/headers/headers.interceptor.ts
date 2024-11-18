import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';
import { Observable } from 'rxjs';

// https://stackoverflow.com/questions/70969402/how-to-add-header-to-all-responses-in-nestjs-v8-graphql を参考に作成
export abstract class HeadersInterceptorBase implements NestInterceptor {
    abstract headers: { [key: string]: string };

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const setHeaders = (response: Response) => {
            for (const headerName in this.headers) {
                const headerValue = this.headers[headerName];
                if (typeof headerValue === 'string') {
                    response.setHeader(headerName, headerValue);
                }
            }
        };

        // When the request is GraphQL
        if (context.getType<string>() === 'graphql') {
            const gqlExecutionContext = GqlExecutionContext.create(context);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const response: Response = gqlExecutionContext.getContext().res;
            setHeaders(response);
        }
        // When the request is HTTP
        else if (context.getType() === 'http') {
            const http = context.switchToHttp();
            const response: Response = http.getResponse();
            setHeaders(response);
        }

        return next.handle();
    }
}
