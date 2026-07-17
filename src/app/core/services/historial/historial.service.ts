import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SesionResponseDto } from '../../models/sesion.model';

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private apiUrl = `${environment.apiGatewayUrl}/core/sesiones-tutorias/historial`;

  constructor(private http: HttpClient) {}

  public obtenerHistorial(): Observable<SesionResponseDto[]> {
    return this.http.get<SesionResponseDto[]>(`${this.apiUrl}`);
  }
}
