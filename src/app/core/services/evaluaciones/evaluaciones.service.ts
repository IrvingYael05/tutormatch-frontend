import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EvaluacionRequestDto, EvaluacionResponseDto } from '../../models/evaluacion.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionesService {
  private apiUrl = `${environment.apiGatewayUrl}/evaluaciones`;

  constructor(private http: HttpClient) {}

  public calificarSesion(evaluacion: EvaluacionRequestDto): Observable<EvaluacionResponseDto> {
    return this.http.post<EvaluacionResponseDto>(`${this.apiUrl}`, evaluacion);
  }
}
