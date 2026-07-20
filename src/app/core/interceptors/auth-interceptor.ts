import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio de OAuth2 directamente en la función
  const oauthService = inject(OAuthService);
  const token = oauthService.getAccessToken();

  // Verificamos si la petición va dirigida a nuestro Gateway
  const isApiRequest = req.url.startsWith(environment.apiGatewayUrl);

  // Si tenemos token y es nuestra API, clonamos la petición y le pegamos el Header
  if (token && isApiRequest) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Dejamos pasar la petición modificada
    return next(clonedRequest);
  }

  // Si no hay token o va a otra API externa, pasa la petición original tal cual
  return next(req);
};
