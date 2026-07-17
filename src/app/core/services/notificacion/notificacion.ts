import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { switchMap, tap, finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth';

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionService implements OnDestroy {
  private apiUrl = `${environment.apiGatewayUrl}/notificaciones`;

  // Estado reactivo para las notificaciones
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  // Estado para saber qué notificación se está marcando como leída
  private marcandoComoLeidaId = new BehaviorSubject<string | null>(null);
  public marcandoComoLeidaId$ = this.marcandoComoLeidaId.asObservable();

  private pollingSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // Inicia la consulta periódica cada 30 segundos
  public iniciarPolling() {
    const userId = this.authService.userId;
    if (!userId) return;

    // Hacemos una primera carga inmediata
    this.cargarHistorial(userId).subscribe();

    // Luego configuramos el intervalo
    this.pollingSubscription = interval(30000)
      .pipe(switchMap(() => this.cargarHistorial(userId)))
      .subscribe();
  }

  public detenerPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Petición GET al microservicio
  private cargarHistorial(userId: string): Observable<Notificacion[]> {
    return this.http
      .get<Notificacion[]>(`${this.apiUrl}/historial/${userId}`)
      .pipe(tap((notificaciones) => this.notificacionesSubject.next(notificaciones)));
  }

  // Petición PUT para marcar como leída
  public marcarComoLeida(notificacionId: string): Observable<any> {
    this.marcandoComoLeidaId.next(notificacionId);

    return this.http.put(`${this.apiUrl}/${notificacionId}/leer`, {}).pipe(
      tap(() => {
        // 1. Cambiamos visualmente el estado a leída (el badge se actualiza aquí)
        const actualizadas = this.notificacionesSubject.value.map((n) =>
          n.id === notificacionId ? { ...n, leida: true } : n,
        );
        this.notificacionesSubject.next(actualizadas);
      }),
      finalize(() => {
        this.marcandoComoLeidaId.next(null); // Limpiamos el estado de carga
      }),
    );
  }

  // Método para borrar físicamente las leídas de la lista local
  public limpiarLeidasLocal(): void {
    const soloSinLeer = this.notificacionesSubject.value.filter((n) => !n.leida);
    this.notificacionesSubject.next(soloSinLeer);
  }

  // ==========================================
  // 🛠️ MÉTODO TEMPORAL DE PRUEBA (BORRAR DESPUÉS)
  // ==========================================
  public enviarNotificacionPrueba(): Observable<any> {
    const userEmail = this.authService.userEmail;

    const payload = {
      usuarioId: this.authService.userId,
      correoDestino: userEmail,
      titulo: '¡Tu solicitud fue aprobada!',
      mensaje:
        "¡Felicidades! Tu solicitud ha sido <strong style='color: #16a34a;'>APROBADA</strong> por la administración.<br><br>A partir de este momento eres un <strong style='color: #2563eb;'>Tutor Oficial</strong> de la comunidad. Ya puedes acceder a la plataforma para configurar tu disponibilidad en la agenda y comenzar a compartir tu conocimiento.",
    };

    // responseType: 'text' porque tu controlador devuelve un String (ResponseEntity.ok("..."))
    return this.http.post(`${this.apiUrl}/enviar`, payload, { responseType: 'text' });
  }

  ngOnDestroy() {
    this.detenerPolling();
  }
}
