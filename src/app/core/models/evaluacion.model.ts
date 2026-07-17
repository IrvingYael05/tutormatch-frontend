export interface EvaluacionRequestDto {
  sesionId: string;
  tutorId: string;
  calificacion: number;
  comentario: string;
}

export interface EvaluacionResponseDto {
  id: string;
  sesionId: string;
  calificacion: number;
  comentario: string;
  creadoEn: string;
}
