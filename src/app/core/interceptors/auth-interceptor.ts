import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio de OAuth2 directamente en la función
  const oauthService = inject(OAuthService);

  // Verificamos si la petición va dirigida a nuestro Gateway
  const isApiRequest = req.url.startsWith(environment.apiGatewayUrl);

  const conToken = (token: string | null) =>
    token && isApiRequest ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(conToken(oauthService.getAccessToken())).pipe(
    catchError((error: unknown) => {
      // HU-08: respaldo por si el usuario recibe un 403 en algo de Tutor
      // porque su JWT todavía no reflejaba el ascenso (ej. no pasó por el
      // Layout todavía para disparar el refresh silencioso normal).
      // Refrescamos el token una vez y reintentamos la misma petición.
      if (isApiRequest && error instanceof HttpErrorResponse && error.status === 403) {
        return from(oauthService.refreshToken()).pipe(
          switchMap(() => next(conToken(oauthService.getAccessToken()))),
          catchError(() => throwError(() => error)),
        );
      }
      return throwError(() => error);
    }),
  );
};
