import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeticionRequestDto } from '../../../core/services/peticion/peticion';

const MATERIA_MIN = 3;
const DESCRIPCION_MIN = 10;

@Component({
  selector: 'app-crear-peticion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-peticion-modal.html',
  styleUrl: './crear-peticion-modal.scss',
})
export class CrearPeticionModal {
  @Input() visible = false;
  @Input() enviando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() enviar = new EventEmitter<PeticionRequestDto>();

  materia = '';
  descripcion = '';

  readonly materiaMin = MATERIA_MIN;
  readonly descripcionMin = DESCRIPCION_MIN;

  get esValido(): boolean {
    return (
      this.materia.trim().length >= MATERIA_MIN && this.descripcion.trim().length >= DESCRIPCION_MIN
    );
  }

  onCerrar(): void {
    if (this.enviando) return;
    this.materia = '';
    this.descripcion = '';
    this.cerrar.emit();
  }

  onEnviar(): void {
    if (!this.esValido || this.enviando) return;
    this.enviar.emit({
      materia: this.materia.trim(),
      descripcion: this.descripcion.trim(),
    });
  }
}
