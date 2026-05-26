# Documentación para Bot IA — TuViaje

Este documento reúne la documentación técnica y funcional necesaria para que un bot de IA entienda el software, las reglas de negocio, precios y preguntas frecuentes (FAQs).

---

## 1. Resumen del software

- Nombre: TuViaje
- Stack backend: PHP 8, PDO (MySQL), estructura MVC ligera (controllers, models, helpers, core).
- Frontend: React + TypeScript (viaje.platform/ui).
- Pagos: Stripe Checkout + Webhooks.
- Emails: helper `Mailer.php` con soporte SMTP y fallback a `mail()`.
- Propósito: sistema de reservas y venta de viajes/experiencias con panel admin para gestión.

## 2. Arquitectura y componentes principales

- `index.php` — punto de entrada y router central. Carga `.env`, configura CORS y registra rutas.
- `core/Router.php`, `core/Request.php`, `core/Response.php`, `core/Middleware.php` — infraestructura básica HTTP y autorización.
- `models/` — acceso a la BD (Usuario, Viaje, Reserva, Venta, etc.).
- `controllers/` — lógica de endpoints públicos y privados.
- `controllers/admin/` — endpoints administrativos (ventas, usuarios, viajes, mantenimiento).
- `helpers/Stripe.php` — wrapper para llamadas a la API de Stripe (crear refunds, sesiones).
- `helpers/Mailer.php` — construcción de cuerpos de email y envío (sendReservaConfirmacion, sendReservaCancelacion, sendReembolsoProcesado, etc.).
- `viaje.platform/ui` — frontend React/TS con rutas y páginas públicas/privadas/admin.
- Base de datos: MySQL; conexión a través de `config/database.php` (class Database::connect()).

## 3. Instalación y ejecución (resumen)

- Variables de entorno en `viaje.api/.env`: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `APP_URL`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `CORS_ORIGIN`, etc.
- Backend (dev): ejecutar `php -S localhost:8000` desde `viaje.api`.
- Frontend: dentro de `viaje.platform/ui` ejecutar `npm install` y `npm run dev`.
- Requisitos PHP: ext pdo_mysql, curl, openssl.

## 4. Endpoints clave

- Autenticación:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET  /api/auth/me`
- Viajes (público):
  - `GET /api/viajes` — listar viajes
  - `GET /api/viajes/{id}` — detalle viaje
- Reservas & pagos:
  - `POST /api/reservas` — iniciar reserva / checkout
  - `GET  /api/reservas/status?session_id=...` — estado de reserva por sesión Stripe
  - `PATCH /api/reservas/{id}` — cancelar reserva (usuario)
  - `POST /api/stripe/webhook` — webhook de Stripe
- Admin (requiere token / rol admin):
  - `GET /api/admin/ventas` — listar ventas
  - `POST /api/admin/ventas/{id}/refund` — procesar reembolso (se crea refund en Stripe y luego se marca venta+reserva Cancelada, se restauran cupos)
  - `DELETE /api/admin/maintenance/pending-reservas` — eliminar todas las reservas con estado `Pendiente` (acción destructiva)

## 5. Reglas del negocio (principales)

- Estados de reserva/venta: `Pendiente` → `Confirmada` → `Cancelada`.
  - `Pendiente`: reserva iniciada, cupos apartado, espera pago (Stripe).
  - `Confirmada`: pago completado y reserva activa.
  - `Cancelada`: reserva anulada, cupos liberados.

- Flujo de pago/reembolso:
  - Antes de modificar BD para un reembolso, se intenta crear un `Refund` en Stripe con `payment_intent` asociado.
  - Si el `Refund` falla, no se toca la BD (operación atómica a nivel aplicación).
  - Si el `Refund` es exitoso, la venta y la reserva se marcan `Cancelada` y se incrementan los cupos del viaje.
  - Al procesar un reembolso se envía un correo informando al usuario (best-effort — si falla el envío, el reembolso sigue vigente).

- Manejo de cupos:
  - Cuando una reserva se confirma se decrementan los cupos (persistido en tabla `viajes.available_seats` o similar).
  - Al cancelar o reembolsar se incrementan los cupos según `personas` de la reserva.

- Seguridad y autorizaciones:
  - Endpoints admin requieren validación de JWT y rol `admin` (ver `Middleware::adminOnly`).
  - Webhook de Stripe se valida por firma HMAC contra `STRIPE_WEBHOOK_SECRET`.

- Eliminación masiva (mantenimiento):
  - `deleteAllPendingReservas()` elimina reservas con estado `Pendiente` y restaura cupos.
  - Esta operación es destructiva: usar solo con respaldo de BD.

## 6. Precios y política de cobro (ejemplo)

> Nota: ajustar valores reales según negocio. Aquí se deja un ejemplo para que el bot IA lo use como referencia.

- Moneda: ARS (pesos argentinos) en la UI por defecto; los importes en Stripe usan centavos (ej. ARS 1.000 → 100000 centavos si aplica).
- Comisión de servicio: 5% sobre el total (se puede modificar en la lógica de creación de ventas si se implementa).
- Política de reembolso estándar:
  - Reembolso total si la cancelación es solicitada por el administrador por motivos operativos.
  - Reintegro al mismo medio de pago en 3-7 días hábiles (dependiente del adquirente/banco).
  - Para reembolsos parciales el sistema soporta pasar `amount` (en centavos) a `Stripe::createRefund`.
- Penalizaciones: aplicables según las reglas internas del viaje (no implementadas por defecto; documentar si existen en contratos).

## 7. FAQs (preguntas frecuentes para el bot)

Q: ¿Cómo puedo reembolsar una venta?
A: Desde el panel admin > Ventas, botón "Reembolsar" en una venta `Confirmada`. El backend llamará a Stripe para crear el `Refund` y, si tiene éxito, marcará la venta y la reserva como `Cancelada` y restaurará cupos. También envía un correo al usuario.

Q: ¿Qué pasa si el envío de correo falla durante el reembolso?
A: El reembolso y la actualización de la base de datos se realizan igualmente; el envío de correo es best-effort. Revisar los logs de `Mailer` en caso de fallos SMTP.

Q: No recibí el email de recuperación de contraseña. Por qué?
A: Verificar `viaje.api/.env` para configuración SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) o revisar que el servidor tenga `mail()` funcional (en Windows `mail()` puede ser poco fiable). Comprobar también `/tests/MailerTest.php` para pruebas locales.

Q: ¿Cómo se protege el webhook de Stripe?
A: Se valida la firma HMAC en `StripeWebhookController` con la variable `STRIPE_WEBHOOK_SECRET`.

Q: ¿Cómo restauro cupos si borro una reserva manualmente?
A: Usar las funciones públicas del backend: cuando se marca una reserva `Cancelada` la lógica del controlador incrementa los cupos; si borrás directamente la fila en BD, ejecutar manualmente el ajuste de cupos o usar `AdminMaintenanceController::deletePendingReservations` para operaciones masivas que ya restauran cupos.

Q: ¿Dónde encuentro los endpoints para integraciones?
A: Ver la sección "Endpoints clave" en este documento. El router central está en `index.php`.

Q: ¿Cómo pruebo localmente los correos sin enviar reales?
A: Usar servicios como Mailtrap y configurar `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` en `.env`.

Q: ¿Qué registros/logs debo revisar si algo falla?
A: Revisar salida del servidor PHP (o `server.log` si corre con `php -S`), los logs `error_log` generados por `Mailer` y cualquier excepción lanzada en las rutas (Response::error lo devuelve al cliente).

## 8. Notas para entrenamiento del bot IA

- Priorizar: seguridad (JWT/admin), flujos de pago (Stripe), estados de reserva y manejo de cupos.
- Señalar operaciones destructivas (deleteAllPendingReservas, eliminar usuarios) y aconsejar respaldo previo.
- Indicar que los emails son "best-effort" y no deben bloquear procesos críticos.
- Proveer ejemplos concretos de endpoints y payloads para entrenar respuestas del bot.

---

Si querés, puedo ajustar este documento (añadir ejemplos de payload JSON, más detalles de la base de datos o plantillas de email para el bot).