// response-format.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadGatewayException, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const code = context.switchToHttp().getResponse().statusCode || 200;
        const message = 'Request successful';

        return {
          code,
          error: false,
          message,
          data: data || null,
        };
      }),
      catchError(error => {

        console.log(error.message || "error")
        const code = error.status || 500;
        const message = error?.message || 'Internal Server Error';

        return throwError(() =>new HttpException(
            {
              code,
              error: true,
              message,
              data: null,
            },
            code,
          ));
      }),
    );
  }
}
