export interface RecursoRequestDto {
  titulo: string;
  url: string;
}

export interface RecursoResponseDto {
  id: string;
  sesionId: string;
  titulo: string;
  url: string;
  creadoEn: string;
}
