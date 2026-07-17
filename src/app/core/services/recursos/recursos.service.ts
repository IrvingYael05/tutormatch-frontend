import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RecursoRequestDto, RecursoResponseDto } from '../../models/recurso.model';

@Injectable({
  providedIn: 'root',
})
export class RecursosService {
  // API Gateway → ms-core → recursos
  private apiUrl = `${environment.apiGatewayUrl}/core/recursos`;

  // Inyectamos el HttpClient
  constructor(private http: HttpClient) {}

  // Obtener todos los recursos de una sesión
  public obtenerRecursos(sesionId: string): Observable<RecursoResponseDto[]> {
    return this.http.get<RecursoResponseDto[]>(`${this.apiUrl}/sesion/${sesionId}`);
  }

  // Agregar un nuevo recurso a una sesión
  public agregarRecurso(sesionId: string, recurso: RecursoRequestDto): Observable<RecursoResponseDto> {
    return this.http.post<RecursoResponseDto>(`${this.apiUrl}/sesion/${sesionId}`, recurso);
  }

  // Eliminar un recurso por su ID
  public eliminarRecurso(recursoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${recursoId}`);
  }
}
