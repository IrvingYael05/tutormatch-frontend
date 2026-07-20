import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RegistroDto {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // API Gateway
  private apiUrl = `${environment.apiGatewayUrl}/usuarios`;

  // Inyectamos el HttpClient
  constructor(private http: HttpClient) {}

  // Método para registrar un nuevo usuario
  public registrar(datos: RegistroDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/registro`, datos, { responseType: 'text' });
  }
}
