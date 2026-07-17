import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// IMPORTANTE: strings en minúsculas, igual que estadoSolicitud en UsuarioService.
// La columna "estado" en Postgres es VARCHAR, no enum nativo — así evitamos
// el mismo problema de cast que tuvimos en HU-05.
export type EstadoPeticion = 'activa' | 'atendida' | 'eliminada';

// Único lugar donde viven los valores textuales de estado. Si el equipo decide
// cambiar a mayúsculas (para calzar con el estado de "sesiones"), solo se
// edita este objeto — nada más en el código debería tener el string suelto.
export const ESTADO_PETICION = {
  ACTIVA: 'activa' as EstadoPeticion,
  ATENDIDA: 'atendida' as EstadoPeticion,
  ELIMINADA: 'eliminada' as EstadoPeticion,
} as const;

export interface PeticionRequestDto {
  materia: string;
  descripcion: string;
}

// HU-34/35/36: tarjeta del tablero de peticiones
export interface Peticion {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  materia: string;
  descripcion: string;
  estado: EstadoPeticion;
  tutorAtendioId: string | null;
  tutorAtendioNombre: string | null;
  creadoEn: string;
  // true si el usuario logueado es quien creó la petición (la calcula el backend)
  propia: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PeticionService {
  // API Gateway
  private apiUrl = `${environment.apiGatewayUrl}/core/peticiones`;

  constructor(private http: HttpClient) {}

  // HU-33: crear una nueva petición (Alumno)
  public crearPeticion(dto: PeticionRequestDto): Observable<Peticion> {
    return this.http.post<Peticion>(this.apiUrl, dto);
  }

  // HU-34: tablero general de peticiones activas/atendidas
  public listarTablero(): Observable<Peticion[]> {
    return this.http.get<Peticion[]>(this.apiUrl);
  }

  // HU-35: eliminar (lógicamente) una petición propia
  public eliminarPeticion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // HU-36: marcar una petición como atendida (Tutor)
  public marcarComoAtendida(id: string): Observable<Peticion> {
    return this.http.patch<Peticion>(`${this.apiUrl}/${id}/atender`, {});
  }
}
