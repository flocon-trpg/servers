import { Injectable } from '@nestjs/common';
import { HeadersInterceptorBase } from '../headers/headers.interceptor';

@Injectable()
export class AccessControlAllowHeadersInterceptor extends HeadersInterceptorBase {
    get headers(): { [key: string]: string } {
        return {
            'Access-Control-Allow-Headers':
                'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        };
    }
}
