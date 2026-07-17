import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth';
import {
  PeticionService,
  Peticion,
  PeticionRequestDto,
  ESTADO_PETICION,
} from '../../core/services/peticion/peticion';
import { ToastService } from '../../core/services/toast/toast';
import { CrearPeticionModal } from '../../shared/components/crear-peticion-modal/crear-peticion-modal';

@Component({
  selector: 'app-peticiones',
  standalone: true,
  imports: [CommonModule, CrearPeticionModal],
  templateUrl: './peticiones.html',
  styleUrl: './peticiones.css',
})
export class Peticiones implements OnInit {
  // Expuesto para el template: peticion.estado === ESTADO.ACTIVA, etc.
  // Único punto de referencia — si cambian el formato del estado, el
  // template no se toca, solo ESTADO_PETICION en peticion.ts.
  readonly ESTADO = ESTADO_PETICION;

  peticiones: Peticion[] = [];
  cargando = true;
  error = false;

  mostrarModalCrear = false;
  creando = false;

  // ids de peticiones que están procesando una acción (eliminar/atender),
  // para deshabilitar esos botones mientras responde el backend
  procesando = new Set<string>();

  constructor(
    public authService: AuthService,
    private peticionService: PeticionService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.cargarTablero();
  }

  cargarTablero(): void {
    this.cargando = true;
    this.error = false;
    this.peticionService.listarTablero().subscribe({
      next: (peticiones) => {
        this.peticiones = peticiones;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = true;
        this.toastService.mostrar('No se pudo cargar el tablero de peticiones', 'error');
      },
    });
  }

  // ============= HU-33: Crear petición =============

  abrirModalCrear(): void {
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
  }

  crearPeticion(dto: PeticionRequestDto): void {
    this.creando = true;
    this.peticionService.crearPeticion(dto).subscribe({
      next: (nueva) => {
        this.creando = false;
        this.mostrarModalCrear = false;
        // La insertamos al inicio: el tablero ya está ordenado más reciente primero
        this.peticiones = [nueva, ...this.peticiones];
        this.toastService.mostrar('Tu petición fue publicada en el tablero', 'success');
      },
      error: (err) => {
        this.creando = false;
        this.toastService.mostrar(err.error || 'No se pudo publicar la petición', 'error');
      },
    });
  }

  // ============= HU-35: Eliminar petición propia =============

  eliminarPeticion(peticion: Peticion): void {
    this.toastService.preguntar(
      `¿Eliminar tu petición de "${peticion.materia}"? Esta acción no se puede deshacer.`,
      () => {
        this.procesando.add(peticion.id);
        this.peticionService.eliminarPeticion(peticion.id).subscribe({
          next: () => {
            this.peticiones = this.peticiones.filter((p) => p.id !== peticion.id);
            this.procesando.delete(peticion.id);
            this.toastService.mostrar('Petición eliminada', 'info');
          },
          error: () => {
            this.procesando.delete(peticion.id);
            this.toastService.mostrar('No se pudo eliminar la petición', 'error');
          },
        });
      },
    );
  }

  // ============= HU-36: Marcar como atendida (Tutor) =============

  marcarComoAtendida(peticion: Peticion): void {
    this.procesando.add(peticion.id);
    this.peticionService.marcarComoAtendida(peticion.id).subscribe({
      next: (actualizada) => {
        this.procesando.delete(peticion.id);
        this.peticiones = this.peticiones.map((p) => (p.id === actualizada.id ? actualizada : p));
        this.toastService.mostrar(`Marcaste "${peticion.materia}" como atendida`, 'success');
      },
      error: (err) => {
        this.procesando.delete(peticion.id);
        this.toastService.mostrar(err.error || 'No se pudo marcar como atendida', 'error');
      },
    });
  }
}
