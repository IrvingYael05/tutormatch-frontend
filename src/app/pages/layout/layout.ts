import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth';
import { NotificacionService, Notificacion } from '../../core/services/notificacion/notificacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  mostrarNotificaciones = false;

  // Variables reactivas para el HTML
  notificaciones$: Observable<Notificacion[]>;
  sinLeer$: Observable<number>;
  marcandoComoLeidaId$: Observable<string | null>;

  constructor(
    public authService: AuthService,
    private notificacionService: NotificacionService,
  ) {
    this.notificaciones$ = this.notificacionService.notificaciones$;
    this.marcandoComoLeidaId$ = this.notificacionService.marcandoComoLeidaId$;
    // Calculamos cuántas notificaciones no han sido leídas
    this.sinLeer$ = this.notificaciones$.pipe(
      map((notificaciones) => notificaciones.filter((n) => !n.leida).length),
    );
  }

  ngOnInit() {
    // Arrancamos el motor de polling de notificaciones cuando el usuario entra a la app
    this.notificacionService.iniciarPolling();
  }

  ngOnDestroy() {
    // Apagamos el motor poolling para evitar fugas de memoria si cierra sesión
    this.notificacionService.detenerPolling();
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (!this.mostrarNotificaciones) {
      this.notificacionService.limpiarLeidasLocal();
    }
  }

  marcarVista(id: string, event: Event) {
    event.stopPropagation();
    this.notificacionService.marcarComoLeida(id).subscribe();
  }

  onLogout(): void {
    this.notificacionService.detenerPolling();
    this.authService.logout();
  }
}
