export interface SesionResponseDto {
  id: string;
  tutorId: string;
  tutorNombre: string;
  titulo: string;
  descripcion: string;
  lugar?: string;
  fechaHora: string;
  cupoMaximo: number;
  cupoDisponible: number;
  inscritos: number;
  estado: string;
  creadoEn: string;
  fueEvaluada: boolean;
  promedioTutor: number | null;
}
