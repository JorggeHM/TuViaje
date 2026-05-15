# Integración con Stripe — Guía de configuración

Esta guía explica cómo activar el flujo de pago real con Stripe en modo Test. El código ya está implementado; solo hay que configurar credenciales y, para desarrollo local, redirigir los webhooks con Stripe CLI.

## Cómo funciona el flujo

```
 [Usuario]                    [Frontend]                 [Backend]               [Stripe]
     │   click "Reservar"        │                          │                       │
     │ ────────────────────────► │                          │                       │
     │                           │  POST /api/reservas      │                       │
     │                           │ ───────────────────────► │                       │
     │                           │                          │  Crea reserva         │
     │                           │                          │  en estado Pendiente  │
     │                           │                          │  + decrementa cupos   │
     │                           │                          │                       │
     │                           │                          │  POST checkout/sessions
     │                           │                          │ ────────────────────► │
     │                           │                          │ ◄──────────────────── │
     │                           │                          │  { id, url }          │
     │                           │  { reserva_id, url }     │                       │
     │                           │ ◄─────────────────────── │                       │
     │   redirige a Stripe       │                          │                       │
     │ ◄──────────────────────── │                          │                       │
     │                                                                              │
     │   paga con tarjeta de prueba                                                 │
     │ ───────────────────────────────────────────────────────────────────────────► │
     │                                                                              │
     │   Stripe redirige a /pago/exito                                              │
     │ ◄─────────────────────────────────────────────────────────────────────────── │
     │                                                      │                       │
     │                                                      │  POST /api/stripe/webhook
     │                                                      │ ◄──────────────────── │
     │                                                      │  checkout.session.completed
     │                                                      │                       │
     │                                                      │  ✓ Reserva → Confirmada
     │                                                      │  ✓ Crea Venta         │
     │                                                      │  ✓ Envía email        │
```

Estados posibles de la reserva:
- `Pendiente` — usuario fue redirigido a Stripe pero todavía no pagó.
- `Confirmada` — Stripe envió `checkout.session.completed` y se confirmó la reserva.
- `Cancelada` — Stripe envió `checkout.session.expired` o `async_payment_failed`. Cupos liberados.

El webhook es **idempotente**: si Stripe lo reintenta, el segundo intento detecta que la reserva ya está confirmada/cancelada y no hace nada.

## Lo que ya está implementado

Backend:
- `viaje.api/helpers/Stripe.php` — cliente con cURL (sin SDK), verificación HMAC del webhook.
- `viaje.api/controllers/ReservasController.php::store` — crea reserva Pendiente + Checkout Session, hace rollback (libera cupos + borra reserva) si Stripe falla.
- `viaje.api/controllers/StripeWebhookController.php` — verifica firma y procesa eventos.
- `viaje.api/models/Reserva.php` — `setStripeSession()`, `findByStripeSessionId()`.
- DB: columna `stripe_session_id` en `reservas` (`migration_stripe_sessions.sql`).

Frontend:
- `infrastructure/services/reservas.service.ts::crear` — devuelve `{ reserva_id, url }`.
- `web.public/pages/ViajeDetalle.tsx` — modal de confirmación que redirige a Stripe.
- `web.public/pages/PagoExito.tsx` y `PagoCancelado.tsx`.

## Setup paso a paso

### 1. Aplicar la migración SQL

Si la BD ya existe (instalación anterior):

```bash
mysql -u root -p tuviaje_db < viaje.database/migration_stripe_sessions.sql
```

Si recién la estás creando, `schema.sql` ya incluye la columna `stripe_session_id`.

### 2. Crear cuenta y obtener claves de Test

1. Crear cuenta en https://dashboard.stripe.com/register (gratis, sin tarjeta).
2. Asegurarte de estar en **modo Test** (toggle arriba a la derecha del dashboard, debe decir "Test mode").
3. Ir a https://dashboard.stripe.com/test/apikeys y copiar:
   - **Publishable key** — `pk_test_...` (no se usa en este proyecto, solo en frontend con Stripe.js que acá no usamos).
   - **Secret key** — `sk_test_...` ← **esta es la que vas a usar**.

### 3. Configurar el `.env` del backend

Editar `viaje.api/.env` (si no existe, copiarlo de `.env.example`):

```ini
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_WEBHOOK_SECRET=
APP_URL=http://localhost:5173
```

`STRIPE_WEBHOOK_SECRET` queda vacío por ahora — lo llenamos en el paso 5.

`APP_URL` es la URL del frontend. Stripe redirige al usuario a `${APP_URL}/pago/exito` y `${APP_URL}/pago/cancelado` después del checkout.

### 4. Instalar Stripe CLI

Stripe envía los webhooks desde sus servidores hacia una URL pública. Como tu localhost no es accesible desde internet, hay dos opciones:

- **Opción A (recomendada para desarrollo)**: Stripe CLI hace de túnel y reenvía los eventos a tu localhost.
- **Opción B (producción)**: configurar el endpoint en el dashboard apuntando a tu URL pública.

Para desarrollo, instalá Stripe CLI:

- **Windows (Scoop)**: `scoop install stripe`
- **Windows (descarga directa)**: https://github.com/stripe/stripe-cli/releases — descargar `stripe_X.Y.Z_windows_x86_64.zip`, descomprimir y agregar al PATH.
- **macOS (Homebrew)**: `brew install stripe/stripe-cli/stripe`
- **Linux**: ver https://docs.stripe.com/stripe-cli

Verificar que está instalado:

```bash
stripe --version
```

### 5. Conectar Stripe CLI y obtener `STRIPE_WEBHOOK_SECRET`

```bash
stripe login
```

Esto abre el navegador, te pide confirmar y vincula el CLI a tu cuenta.

Luego, dejá corriendo el túnel de webhooks:

```bash
stripe listen --forward-to http://localhost/AgenciaDeViajesSystem/viaje.api/api/stripe/webhook
```

(Ajustá la URL si tu servidor PHP corre en otro puerto/path. Si usás `php -S localhost:8000 -t viaje.api/`, sería `http://localhost:8000/api/stripe/webhook`.)

Al iniciar, el comando imprime algo como:

```
> Ready! Your webhook signing secret is whsec_abc123...
```

**Copiar ese `whsec_...` al `.env`**:

```ini
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

Reiniciar el backend para que tome la variable. **Mantener el comando `stripe listen` corriendo** mientras pruebes.

### 6. Probar el flujo completo

1. Asegurate de que estén corriendo:
   - Backend (`php -S` o XAMPP)
   - Frontend (`npm run dev`)
   - Stripe CLI (`stripe listen --forward-to ...`)
2. Abrí http://localhost:5173, iniciá sesión, entrá a un viaje y click en "Reservar".
3. En el modal, click "Pagar con Stripe".
4. En Stripe Checkout, ingresá una tarjeta de prueba:

| Tarjeta | Resultado |
|---|---|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0025 0000 3155` | Requiere 3D Secure (te muestra modal de autenticación) |
| `4000 0000 0000 0002` | Tarjeta declinada genérica |

CVC: cualquier 3 dígitos. Vencimiento: cualquier fecha futura. ZIP: `12345`.

5. Tras pagar, Stripe redirige a `/pago/exito`. En la terminal de `stripe listen` deberías ver:
   ```
   --> checkout.session.completed [evt_...]
   <-- [200] POST http://localhost/.../api/stripe/webhook
   ```
6. Andá a `/perfil` — la reserva debe aparecer como **Confirmada** y deberías recibir el email de confirmación (si configuraste SMTP).

### 7. Disparar eventos manualmente (debugging)

Si querés probar el webhook sin pasar por el checkout completo:

```bash
stripe trigger checkout.session.completed
```

Esto crea un evento de prueba en tu cuenta de Stripe Test y lo envía al endpoint. Útil para verificar que la firma se valida correctamente.

## Job de limpieza de reservas Pendientes

Stripe envía `checkout.session.expired` recién después de **24 horas**. Mientras tanto, si el usuario abandona el checkout sin pagar, los cupos quedan retenidos. Para acortar esa ventana hay un job que cancela reservas Pendientes viejas y libera sus cupos.

### Ejecutar manualmente

```bash
php viaje.api/jobs/cleanup_pendientes.php
# Output: [2026-05-14 10:23:11] cleanup_pendientes: 3 reserva(s) canceladas (cutoff=30min, 12ms)

# Con cutoff personalizado:
php viaje.api/jobs/cleanup_pendientes.php --minutes=15
```

### Programación automática

**Linux/macOS (cron, cada 10 min):**

```cron
*/10 * * * * /usr/bin/php /ruta/a/viaje.api/jobs/cleanup_pendientes.php >> /var/log/tuviaje_cleanup.log 2>&1
```

**Windows (Task Scheduler):**

1. Abrir "Programador de tareas" → "Crear tarea básica".
2. Trigger: Repetir cada 10 minutos, indefinidamente.
3. Acción: "Iniciar un programa".
4. Programa/script: `C:\xampp\php\php.exe`
5. Argumentos: `C:\ruta\a\viaje.api\jobs\cleanup_pendientes.php`

### Disparo manual desde admin

También hay un endpoint admin para dispararlo on-demand:

```
POST /api/admin/maintenance/cleanup-pendientes
Authorization: Bearer <jwt-de-admin>
Body (opcional): { "minutes": 30 }
```

Responde con `{ procesadas, cutoff_minutes, duracion_ms }`.

## Producción

Para deploy en producción:

1. Cambiar a las claves **Live** del dashboard (`sk_live_...`).
2. Crear el webhook desde el dashboard: https://dashboard.stripe.com/webhooks
   - URL: `https://tu-dominio.com/api/stripe/webhook`
   - Eventos a escuchar: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
3. Copiar el "Signing secret" del webhook al `.env` (también `whsec_...` pero distinto al de Stripe CLI).
4. Reiniciar el backend.

## Errores comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Stripe: No such API key` | `STRIPE_SECRET_KEY` mal copiado o vacío | Verificar `.env` y reiniciar PHP |
| `Firma inválida` (400) en el webhook | `STRIPE_WEBHOOK_SECRET` no coincide con el de `stripe listen` | Recopiar el `whsec_` que muestra `stripe listen` cuando arranca |
| `STRIPE_SECRET_KEY no está configurado` (502) | El backend no está leyendo `.env` | Confirmar que `getenv()` funciona. En XAMPP a veces hay que reiniciar Apache después de cambiar `.env` |
| El usuario paga pero la reserva queda en `Pendiente` | El webhook no llegó | Verificar que `stripe listen` está corriendo y que el path del `--forward-to` es el correcto |
| `cURL falló: SSL certificate problem` | Falta el bundle CA en PHP de XAMPP | En `php.ini`: `curl.cainfo = "C:\xampp\php\extras\ssl\cacert.pem"` y reiniciar Apache |
| Cupos quedan reservados aunque el usuario nunca pagó | Sesión de Stripe expiró sin generar evento (raro) | Stripe envía `checkout.session.expired` después de 24 h por default. Mientras tanto los cupos están "tomados" |

## Referencias

- [Stripe Checkout — Quickstart](https://docs.stripe.com/checkout/quickstart)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)
- [Webhook signatures](https://docs.stripe.com/webhooks/signatures)
- [Test cards](https://docs.stripe.com/testing#cards)
