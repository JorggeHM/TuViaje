# TuViaje — Documentación Técnica Completa

**Stack:** PHP 8 + MySQL 8 + React 19 + TypeScript + Vite + Tailwind CSS 4 + Stripe Checkout + JWT

---

## Tabla de Contenidos

1. [Descripción general](#1-descripción-general)
2. [Requisitos mínimos](#2-requisitos-mínimos)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Instalación paso a paso](#4-instalación-paso-a-paso)
5. [Arquitectura técnica](#5-arquitectura-técnica)
6. [Base de datos](#6-base-de-datos)
7. [Backend — API REST](#7-backend--api-rest)
8. [Frontend — React SPA](#8-frontend--react-spa)
9. [Autenticación y seguridad](#9-autenticación-y-seguridad)
10. [Flujos principales del sistema](#10-flujos-principales-del-sistema)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Roles y permisos](#12-roles-y-permisos)
13. [Tests](#13-tests)
14. [Preguntas frecuentes](#14-preguntas-frecuentes)

---

## 1. Descripción General

**TuViaje** es una aplicación web fullstack de agencia de viajes que permite a los usuarios explorar destinos, hacer reservas con pago online vía Stripe, gestionar favoritos y publicar experiencias de viaje. El sistema cuenta con tres niveles de acceso:

- **Público** — Cualquier visitante puede explorar viajes y leer experiencias.
- **Usuario registrado** — Reserva y paga, gestiona favoritos, publica/edita experiencias propias, recupera contraseña, edita su perfil y avatar.
- **Administrador** — Gestiona viajes, usuarios, ventas, reservas, experiencias (moderación), imágenes del header (covers) y dispara tareas de mantenimiento.

### Tecnologías principales

| Capa | Tecnología |
|------|------------|
| Backend | PHP 8 (MVC propio, sin framework), PDO, JWT |
| Base de datos | MySQL 8 |
| Frontend | React 19, TypeScript, Vite |
| Estilos | Tailwind CSS 4, lucide-react (iconos) |
| HTTP Client | Axios |
| Enrutamiento | React Router 7 |
| Pago | Stripe Checkout (modo Test), webhook HMAC-SHA256 |
| Email | SMTP custom o `mail()` nativo (best-effort) |
| Tests | Framework PHP propio (backend) + Vitest 4 (frontend) |

---

## 2. Requisitos Mínimos

### Software necesario

| Software | Versión mínima | Notas |
|---------|---------------|-------|
| PHP | 8.1 | Extensiones: `pdo`, `pdo_mysql`, `json`, `fileinfo`, `curl`, `openssl` (Stripe + HMAC) |
| MySQL | 8.0 | También funciona MariaDB 10.4+ |
| Apache | 2.4 | `mod_rewrite` habilitado |
| Node.js | 20.0+ | Vite 8 lo requiere |
| npm | 10.0+ | Incluido con Node.js |
| Stripe | — | Cuenta gratuita en modo Test (opcional, solo para probar pagos) |

> **Recomendación:** instalar **XAMPP 8.2** (Windows/macOS/Linux), que trae PHP 8.2, MySQL 8 y Apache 2.4 en un solo paquete. PHP de XAMPP en Windows está en `C:\xampp\php\php.exe`.

---

## 3. Estructura del Proyecto

```
TuViaje/
├── AgenciaDeViajesSystem/
│   ├── viaje.api/                          ← Backend PHP
│   │   ├── config/
│   │   │   ├── database.php                ← Conexión PDO (singleton)
│   │   │   └── jwt.php                     ← Constantes JWT
│   │   ├── controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ViajesController.php
│   │   │   ├── ReservasController.php
│   │   │   ├── ExperienciasController.php
│   │   │   ├── FavoritosController.php
│   │   │   ├── StatsController.php
│   │   │   ├── CoversController.php
│   │   │   ├── StripeWebhookController.php
│   │   │   └── admin/
│   │   │       ├── AdminViajesController.php
│   │   │       ├── AdminUsuariosController.php
│   │   │       ├── AdminVentasController.php       (incluye refund)
│   │   │       ├── AdminReservasController.php
│   │   │       ├── AdminExperienciasController.php
│   │   │       ├── AdminCoversController.php
│   │   │       └── AdminMaintenanceController.php  (cleanup)
│   │   ├── core/
│   │   │   ├── Router.php                  ← Enrutador RESTful
│   │   │   ├── Request.php                 ← Parseo de entrada HTTP
│   │   │   ├── Response.php                ← Salida JSON
│   │   │   └── Middleware.php              ← Validación JWT y rol admin
│   │   ├── helpers/
│   │   │   ├── JWT.php                     ← Encode/decode de tokens
│   │   │   ├── Mailer.php                  ← SMTP + mail() best-effort
│   │   │   ├── Stripe.php                  ← Cliente Stripe (cURL, sin SDK)
│   │   │   └── MaintenanceJobs.php         ← Cleanup de reservas viejas
│   │   ├── models/
│   │   │   ├── Usuario.php
│   │   │   ├── Viaje.php                   (con campos JSON: incluidos/galeria/garantias)
│   │   │   ├── Reserva.php
│   │   │   ├── Venta.php
│   │   │   ├── Experiencia.php
│   │   │   ├── Favorito.php
│   │   │   ├── PasswordReset.php
│   │   │   └── CoverImagen.php
│   │   ├── jobs/
│   │   │   └── cleanup_pendientes.php      ← Script CLI (cron / Task Scheduler)
│   │   ├── tests/
│   │   │   ├── TestRunner.php              ← Framework propio
│   │   │   ├── JWTTest.php
│   │   │   ├── CuposLogicTest.php
│   │   │   ├── MailerTest.php
│   │   │   ├── StripeWebhookTest.php
│   │   │   └── run_tests.php               ← Entry point
│   │   ├── uploads/
│   │   │   ├── experiencias/               ← Imágenes de experiencias
│   │   │   └── avatars/                    ← Avatares de usuario
│   │   ├── .env                            ← Variables de entorno (NO subir a git)
│   │   ├── .env.example                    ← Plantilla
│   │   ├── .htaccess                       ← URL rewrite para Apache
│   │   └── index.php                       ← Entry point + registro de rutas
│   │
│   ├── viaje.database/
│   │   ├── schema.sql                      ← Definición de tablas
│   │   ├── install.sql                     ← Instalación limpia
│   │   ├── seed.sql                        ← Datos de prueba
│   │   └── migrations.sql                  ← Migraciones acumuladas
│   │
│   ├── viaje.platform/
│   │   └── ui/                             ← Frontend React
│   │       ├── src/
│   │       │   ├── main.tsx
│   │       │   ├── ApplicationRouter.tsx   ← Rutas SPA
│   │       │   ├── infrastructure/
│   │       │   │   ├── api/
│   │       │   │   │   └── client.ts       ← Axios + interceptores JWT/401
│   │       │   │   ├── auth/
│   │       │   │   │   └── AuthContext.tsx ← Provider + useAuth()
│   │       │   │   └── services/
│   │       │   │       ├── auth.service.ts
│   │       │   │       ├── viajes.service.ts
│   │       │   │       ├── reservas.service.ts
│   │       │   │       ├── experiencias.service.ts
│   │       │   │       ├── favoritos.service.ts
│   │       │   │       ├── covers.service.ts
│   │       │   │       └── stats.service.ts
│   │       │   ├── components/             ← TravelCard, TravelCardDetailed, InfoCard, ChatFloat
│   │       │   ├── web.public/
│   │       │   │   ├── layout/PublicLayout.tsx
│   │       │   │   └── pages/              ← Home, Destinos, ViajeDetalle,
│   │       │   │                             Experiencias, AboutUs, Register,
│   │       │   │                             PagoExito, PagoCancelado
│   │       │   ├── web.private/
│   │       │   │   ├── layout/PrivateLayout.tsx
│   │       │   │   └── pages/              ← Login, Perfil, ForgotPassword, ResetPassword
│   │       │   └── web.admin/
│   │       │       ├── layout/AdminLayout.tsx
│   │       │       └── pages/              ← AdminResumen, AdminViajes, AdminUsuarios,
│   │       │                                 AdminReservas, AdminVentas, AdminExperiencias,
│   │       │                                 AdminCovers
│   │       ├── .env
│   │       ├── package.json
│   │       └── vite.config.ts
│   │
│   ├── README.md
│   └── stripe.md                           ← Guía completa de Stripe
│
├── DOCUMENTACION.md                        ← Este archivo
└── DIAGRAMAS.md                            ← Diagramas Mermaid
```

---

## 4. Instalación

### Paso 1 — Clonar o ubicar el proyecto

```bash
git clone <URL_REPOSITORIO> TuViaje
cd TuViaje
```

### Paso 2 — Configurar Apache

Copiar la carpeta `AgenciaDeViajesSystem` dentro del DocumentRoot de Apache:

- **Windows (XAMPP):** `C:\xampp\htdocs\AgenciaDeViajesSystem`
- **Linux/macOS:** `/var/www/html/AgenciaDeViajesSystem`

Verificar `mod_rewrite`. En Ubuntu:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

El `.htaccess` de `viaje.api/` ya contiene:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [QSA,L]
```

### Paso 3 — Crear la base de datos

Desde phpMyAdmin (`http://localhost/phpmyadmin`) o consola:

```sql
CREATE DATABASE tuviaje_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar el esquema:

```bash
mysql -u root -p tuviaje_db < AgenciaDeViajesSystem/viaje.database/schema.sql
```

Para datos de prueba opcionales:

```bash
mysql -u root -p tuviaje_db < AgenciaDeViajesSystem/viaje.database/seed.sql
```

Si ya tenés la base de una versión anterior, aplicar las migraciones que falten desde `migrations.sql` (cada bloque está comentado con la fecha y el cambio).

### Paso 4 — Backend (.env)

```bash
cp AgenciaDeViajesSystem/viaje.api/.env.example AgenciaDeViajesSystem/viaje.api/.env
```

Editar `.env`:

```env
# ─── Base de datos ───────────────────────────────
DB_HOST=127.0.0.1
DB_NAME=tuviaje_db
DB_USER=root
DB_PASS=
DB_CHARSET=utf8mb4

# ─── JWT ─────────────────────────────────────────
JWT_SECRET=TuViaje$2026#SecretKey!XyZ@RandomStr0ng
JWT_TTL=3600
JWT_ALG=HS256

# ─── CORS y URL pública ──────────────────────────
CORS_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173

# ─── Email (opcional, fallback a mail()) ─────────
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=tls
MAIL_FROM=no-reply@tuviaje.com
MAIL_FROM_NAME=TuViaje

# ─── Stripe (opcional, modo Test) ────────────────
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Paso 5 — Frontend (.env)

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
```

Crear `.env`:

```env
VITE_API_BASE_URL=http://localhost/AgenciaDeViajesSystem/viaje.api
VITE_APP_NAME=TuViaje
```

### Paso 6 — Dependencias del frontend

```bash
npm install
```

### Paso 7 — Iniciar servicios

- **XAMPP:** Start de Apache y MySQL desde el panel.
- **Frontend:**
  ```bash
  cd AgenciaDeViajesSystem/viaje.platform/ui
  npm run dev
  ```
  La SPA queda en `http://localhost:5173`.

### Paso 8 — Stripe en local (opcional)

Solo si querés probar pagos. Ver `AgenciaDeViajesSystem/stripe.md` para la guía completa con tarjetas test. Resumen:

```bash
stripe login
stripe listen --forward-to http://localhost/AgenciaDeViajesSystem/viaje.api/api/stripe/webhook
```

Stripe CLI imprime el `whsec_...` que va en `STRIPE_WEBHOOK_SECRET` del `.env`.

### Paso 9 — Cleanup job (opcional pero recomendado)

Para liberar cupos de reservas que quedaron en `Pendiente` (usuarios que iniciaron checkout y no pagaron):

**Linux cron:**
```cron
*/15 * * * * cd /path/to/viaje.api && php jobs/cleanup_pendientes.php --minutes=30
```

**Windows (Task Scheduler):**
```
C:\xampp\php\php.exe C:\xampp\htdocs\AgenciaDeViajesSystem\viaje.api\jobs\cleanup_pendientes.php --minutes=30
```

También se puede disparar manualmente desde admin: `POST /api/admin/maintenance/cleanup-pendientes`.

### Paso 10 — Verificación

1. `http://localhost:5173` muestra el home.
2. `http://localhost/AgenciaDeViajesSystem/viaje.api/api/viajes` devuelve JSON.
3. `http://localhost/AgenciaDeViajesSystem/viaje.api/api/stats` devuelve métricas públicas.
4. Login con el admin que crea `install.sql` redirige a `/admin`.

### Build de producción

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
npm run build
```

Los archivos quedan en `dist/`. Copiarlos al servidor estático y apuntar el virtual host.

---

## 5. Arquitectura Técnica

### Diagrama general

```
┌──────────────────────────────────────────┐         ┌──────────────┐
│      Navegador — React SPA :5173         │ ◀────── │ Stripe.com   │
│  (AuthContext + Axios + interceptores)   │ webhook │ Checkout API │
└─────────────────┬────────────────────────┘         └──────▲───────┘
                  │ HTTP + JWT                              │ cURL
                  ▼                                         │
┌──────────────────────────────────────────┐                │
│        Apache 2.4 — /viaje.api           │────────────────┘
│  index.php → Router → Middleware →       │
│  Controller → Model → PDO                │────► SMTP / mail()
└─────────────────┬────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│         MySQL 8 — tuviaje_db             │ ◀── CLI: php jobs/cleanup_pendientes.php
└──────────────────────────────────────────┘
```

### Backend — flujo de una petición

```
HTTP Request
    ↓
index.php
    ├─ Carga .env (putenv)
    ├─ Configura headers CORS
    ├─ Responde OPTIONS preflight
    └─ Registra rutas en Router
         ↓
    Router::dispatch()
         ├─ Extrae método y path
         ├─ Resuelve handler
         └─ Ejecuta Middleware::auth o ::adminOnly si corresponde
              ↓
         Controller::método()
              ├─ Lee del Request
              ├─ Llama a Model (PDO)
              ├─ Llama a Helper (Stripe / Mailer)
              └─ Devuelve Response JSON
```

### Frontend — estructura de capas

```
Componentes React (UI)
         ↓
   useAuth() de AuthContext   (single source of truth)
         ↓
Services (auth, viajes, reservas, experiencias, favoritos, covers, stats)
         ↓
Axios client.ts (interceptor Authorization + interceptor 401 → /login)
         ↓
   API REST (backend PHP)
```

### Patrones destacados

- **AuthContext** — el JWT se decodifica una sola vez al montar; el resto de la app lee `useAuth().user`. El token persiste en `localStorage['token']` para que el interceptor de Axios lo lea.
- **Cupos atómicos** — `Viaje::decrementSeats` usa `UPDATE viajes SET available_seats = available_seats - ? WHERE id = ? AND available_seats >= ?` y verifica `rowCount()` — si dos usuarios compiten por el último cupo, solo uno gana.
- **Webhook Stripe idempotente** — `StripeWebhookController` ignora eventos sobre reservas ya en `Confirmada` o `Cancelada`.
- **Helpers como punto de extensión** — `Stripe.php`, `Mailer.php` y `MaintenanceJobs.php` están desacoplados de la capa HTTP, así que `cleanup_pendientes.php` los usa directo desde CLI.
- **JSON fields en `viajes`** — `incluidos`, `galeria`, `garantias` se serializan/deserializan automáticamente en `Viaje.php` (constante `JSON_FIELDS`).

---

## 6. Base de Datos

### Tablas (8 totales)

| Tabla | Propósito | Campos clave |
|-------|-----------|--------------|
| `usuarios` | Cuentas | `id, name, email, password (bcrypt), rol (usuario/admin), avatar_url, activo, created_at` |
| `viajes` | Catálogo | `id, title, description, destination, price, available_seats, start_date, end_date, duracion_dias, rating, imagen_url, incluidos (JSON), galeria (JSON), garantias (JSON), estado (Activo/Pausado/Finalizado), created_at` |
| `reservas` | Reservas | `id, usuario_id, viaje_id, fecha_reserva, estado (Pendiente/Confirmada/Cancelada), monto, personas, stripe_session_id` |
| `ventas` | Reporte transaccional | `id, usuario_id, viaje_id, monto, estado, fecha` |
| `experiencias` | Reseñas | `id, usuario_id, destino, rating (1-5), texto, fecha, likes, imagen, visible` |
| `cover_imagenes` | Imágenes del header | `id, url, orden, visible, created_at` |
| `favoritos` | Wishlist | `id, usuario_id, viaje_id, created_at` — UNIQUE `(usuario_id, viaje_id)` |
| `password_resets` | Tokens de reset | `id, usuario_id, token_hash (SHA-256), expires_at, used_at, created_at` — UNIQUE `token_hash` |

### Índices

- `idx_viajes_estado`, `idx_ventas_estado`, `idx_ventas_fecha`
- `idx_reservas_usuario`, `idx_reservas_stripe`
- `idx_experiencias_dest`
- `idx_cover_visible`, `idx_cover_orden`

### Relaciones

- `usuarios 1—N reservas, ventas, experiencias, favoritos, password_resets`
- `viajes 1—N reservas, ventas, favoritos`
- Todas las FKs con `ON DELETE CASCADE`.

---

## 7. Backend — API REST

**Base URL:** `http://localhost/AgenciaDeViajesSystem/viaje.api`

Las rutas se registran en `viaje.api/index.php:67-149`.

### 7.1 Autenticación (8 rutas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Crear cuenta, envía email de bienvenida |
| POST | `/api/auth/login` | No | Devuelve `{token, user}` |
| GET | `/api/auth/me` | Sí | Datos del usuario autenticado |
| POST | `/api/auth/logout` | Sí | No-op server (cliente limpia token) |
| PUT | `/api/auth/perfil` | Sí | Actualiza nombre/email, re-emite token |
| PUT | `/api/auth/password` | Sí | Cambia contraseña (requiere la anterior) |
| POST | `/api/auth/avatar` | Sí | Sube imagen de perfil (multipart) |
| DELETE | `/api/auth/avatar` | Sí | Borra avatar y archivo |
| POST | `/api/auth/forgot-password` | No | Envía link de reset (responde 200 siempre) |
| POST | `/api/auth/reset-password` | No | Cambia contraseña con token |

### 7.2 Viajes y datos públicos (4 rutas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/viajes` | No | Lista viajes activos |
| GET | `/api/viajes/{id}` | No | Detalle del viaje (incluye JSON fields) |
| GET | `/api/stats` | No | Métricas públicas (viajes realizados, viajeros, ciudades, satisfacción) |
| GET | `/api/covers` | No | Imágenes visibles del header (ordenadas) |

### 7.3 Reservas (4 rutas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/reservas` | Sí | Crea reserva `Pendiente`, decrementa cupos, devuelve URL de Stripe Checkout |
| GET | `/api/reservas/status?session_id=...` | No | Devuelve `{id, estado}` (usado por `/pago/exito` y `/pago/cancelado` para polling) |
| GET | `/api/auth/reservas` | Sí | Mis reservas |
| PATCH | `/api/reservas/{id}` | Sí | Cancelar; si está `Confirmada` dispara refund automático en Stripe |

### 7.4 Favoritos (4 rutas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/favoritos` | Sí | Lista de viajes favoritos del usuario |
| GET | `/api/favoritos/ids` | Sí | Solo los IDs (para marcar tarjetas) |
| POST | `/api/favoritos` | Sí | Agregar viaje (body: `{viaje_id}`) |
| DELETE | `/api/favoritos/{viajeId}` | Sí | Quitar de favoritos |

### 7.5 Experiencias (5 rutas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/experiencias` | No | Lista experiencias visibles (filtro `?minRating=4`) |
| POST | `/api/experiencias` | Sí | Publicar (multipart si lleva imagen, JSON si no) |
| PUT | `/api/experiencias/{id}` | Sí | Editar (solo dueño o admin) |
| DELETE | `/api/experiencias/{id}` | Sí | Eliminar (solo dueño o admin); borra la imagen del FS |
| PATCH | `/api/experiencias/{id}/like` | Sí | Incrementa likes |

### 7.6 Webhook Stripe (1 ruta)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/stripe/webhook` | HMAC | Recibe eventos: `checkout.session.completed/expired/async_payment_failed`, `payment_intent.payment_failed` |

### 7.7 Admin (23 rutas — requieren `rol = admin`)

**Viajes (5)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/viajes` | Todos los viajes |
| POST | `/api/admin/viajes` | Crear (incluye `incluidos`, `galeria`, `garantias`) |
| PUT | `/api/admin/viajes/{id}` | Editar |
| PATCH | `/api/admin/viajes/{id}/finalizar` | Cambiar estado |
| DELETE | `/api/admin/viajes/{id}` | Eliminar (409 si tiene ventas) |

**Usuarios (3)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/usuarios` | Lista |
| PATCH | `/api/admin/usuarios/{id}/estado` | Activar / bloquear |
| DELETE | `/api/admin/usuarios/{id}` | Eliminar |

**Ventas (4)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/ventas` | Lista filtrable |
| GET | `/api/admin/ventas/stats` | KPIs: ingresos, top destinos, gráfico semanal |
| PATCH | `/api/admin/ventas/{id}/estado` | Cambiar estado |
| POST | `/api/admin/ventas/{id}/refund` | Reembolso manual en Stripe + cancela venta+reserva |

**Reservas (3)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/reservas` | Lista filtrable |
| PATCH | `/api/admin/reservas/{id}/estado` | Cambia estado (sincroniza cupos automáticamente) |
| DELETE | `/api/admin/reservas/{id}` | Eliminar |

**Experiencias (3)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/experiencias` | Lista (incluye no visibles) |
| PATCH | `/api/admin/experiencias/{id}/visible` | Ocultar / mostrar |
| DELETE | `/api/admin/experiencias/{id}` | Eliminar (borra imagen del FS) |

**Covers (4)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/covers` | Lista (incluye no visibles) |
| POST | `/api/admin/covers` | Crear (`url`, `orden`, `visible`) |
| PATCH | `/api/admin/covers/{id}/visible` | Toggle visible |
| DELETE | `/api/admin/covers/{id}` | Eliminar |

**Mantenimiento (1)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/maintenance/cleanup-pendientes` | Cancela reservas en `Pendiente` con más de N minutos (default 30) |

### Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Recurso creado |
| 204 | Sin contenido (OPTIONS preflight) |
| 400 | Datos inválidos |
| 401 | No autenticado / token expirado |
| 403 | Sin permisos (no admin o no dueño) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email duplicado, viaje con ventas, cupos insuficientes) |
| 422 | Validación falló (Stripe en algunos casos) |
| 500 | Error interno |
| 502 | Error en gateway upstream (Stripe falló en refund) |

---

## 8. Frontend — React SPA

### Rutas (`ApplicationRouter.tsx`)

**Públicas (`PublicLayout` con Nav + Footer):**

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `HomePage` | Hero con covers, destinos destacados, stats |
| `/nosotros` | `AboutUSPage` | Información de la agencia |
| `/destinos` | `DestinosPage` | Catálogo completo con filtros |
| `/experiencias` | `ExperienciasPage` | Feed de reseñas con upload |
| `/viaje/detalle` | `ViajeDetallePage` | Detalle vía router state |
| `/viaje/:id` | `ViajeDetallePage` | Detalle vía URL |
| `/pago/exito` | `PagoExitoPage` | Polling de estado (12s máx) tras Stripe |
| `/pago/cancelado` | `PagoCanceladoPage` | Idem para flujo cancelado |

**Privadas (`PrivateLayout`):**

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | `LoginPage` | Formulario de inicio |
| `/register` | `Register` | Registro |
| `/perfil` | `PerfilPage` | Edición, mis reservas, mis favoritos, avatar |
| `/forgot-password` | `ForgotPasswordPage` | Pide email para reset |
| `/reset-password/:token` | `ResetPasswordPage` | Cambia password con token |

**Admin (`AdminLayout` con sidebar — protege por rol):**

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `AdminResumen` | Dashboard de KPIs |
| `/admin/viajes` | `AdminViajes` | CRUD + JSON fields (incluidos/galería/garantías) |
| `/admin/usuarios` | `AdminUsuarios` | Gestión |
| `/admin/reservas` | `AdminReservas` | Panel independiente con cambio de estado |
| `/admin/ventas` | `AdminVentas` | Reportes + refund |
| `/admin/experiencias` | `AdminExperiencias` | Moderación (visible/eliminar) |
| `/admin/covers` | `AdminCovers` | CRUD imágenes del header |

### AuthContext (`infrastructure/auth/AuthContext.tsx`)

`<AuthProvider>` envuelve `<ApplicationRouter/>` en `main.tsx`. El hook `useAuth()` expone:

```typescript
const {
  user,              // User | null — id, email, name, rol, avatar_url
  isAuthenticated,   // boolean
  isAdmin,           // boolean
  login,             // (email, password) => Promise<User>
  register,          // (email, password, name) => Promise<User>
  logout,            // () => Promise<void>
  updateUser,        // (partial: Partial<User>) => void
  refreshFromToken,  // () => void — re-decodifica el token
} = useAuth();
```

El user vive en memoria; el token persiste en `localStorage['token']` y lo añade el interceptor de Axios. El interceptor de respuesta limpia el token y redirige a `/login` si recibe 401.

### Servicios (`infrastructure/services/`)

| Servicio | Métodos principales |
|----------|---------------------|
| `auth.service` | `login, register, logout, getCurrentUser, forgotPassword, resetPassword, updateProfile, updatePassword, uploadAvatar, deleteAvatar` |
| `viajes.service` | `listar, obtener` |
| `reservas.service` | `crear, misReservas, cancelar, estadoPorSesion` |
| `experiencias.service` | `listar, crear, actualizar, eliminar, like` |
| `favoritos.service` | `listar, listarIds, agregar, quitar` |
| `covers.service` | `listar` (público), CRUD admin |
| `stats.service` | `obtener` (métricas públicas) |

### Componentes reutilizables

| Componente | Descripción |
|-----------|-------------|
| `TravelCard` | Tarjeta de viaje compacta para grids |
| `TravelCardDetailed` | Tarjeta con más info para Destinos |
| `InfoCard` | Tarjeta informativa genérica |
| `ChatFloat` | Widget flotante de contacto |

---

## 9. Autenticación y Seguridad

### Flujo JWT

```
1. POST /api/auth/login {email, password}
2. Backend verifica hash bcrypt
3. Genera JWT:
   - Header  : { alg: "HS256", typ: "JWT" }
   - Payload : { sub, email, name, rol, iat, exp = iat + JWT_TTL }
   - Firma   : HMAC-SHA256 con JWT_SECRET
4. Frontend guarda token en localStorage; AuthContext decodifica una vez
5. Axios interceptor request → Authorization: Bearer <token>
6. Middleware::auth valida firma + expiración → adjunta payload a $request->user
7. Middleware::adminOnly verifica payload.rol === 'admin' (extra para rutas /api/admin/*)
8. Token inválido / expirado → 401 → interceptor de respuesta → /login
```

### Hashing de contraseñas

`password_hash($pass, PASSWORD_BCRYPT)` al crear; `password_verify` al loguear. Nunca se almacenan en plano.

### CORS

`Access-Control-Allow-Origin` toma el valor de `CORS_ORIGIN` del `.env`. Preflight `OPTIONS` se contesta 204 directo en `index.php`.

### Webhook Stripe — verificación HMAC

`Stripe::verifyWebhookSignature` reconstruye `t=...,v1=...` del header `Stripe-Signature`, calcula HMAC-SHA256(`{t}.{body}`) con `STRIPE_WEBHOOK_SECRET` y compara con `hash_equals` (tiempo constante). Tolerancia: 5 min de desfase. Soporta varias firmas `v1=` simultáneas para rotación de secret sin downtime.

### Password reset

- Token aleatorio de 64 hex chars (32 bytes); solo se manda por email.
- En BD se guarda **únicamente el SHA-256** del token (columna `token_hash`).
- Expira en 1 hora (`expires_at`).
- Se marca `used_at` al usarse; no se acepta dos veces.
- `/api/auth/forgot-password` responde **200 incluso si el email no existe** (anti-enumeración).

### Validación de imágenes

Para experiencias y avatares:
- Extensión: `jpg`, `jpeg`, `png`, `webp`.
- Tamaño máximo: 5 MB.
- Verificación de estructura real con `getimagesize()`.
- Renombrado con `uniqid()` para evitar colisiones.
- Storage: `viaje.api/uploads/experiencias/` y `viaje.api/uploads/avatars/`.

---

## 10. Flujos Principales del Sistema

### Flujo 1 — Pagar una reserva con Stripe

```
Usuario → /viaje/:id → selecciona personas → clic "Reservar"
   ↓
POST /api/reservas {viaje_id, personas}
   ↓
Backend:
   ├─ Verifica viaje Activo y cupos >= personas
   ├─ Crea reserva en `Pendiente`
   ├─ Decrementa available_seats atómicamente
   ├─ Llama a Stripe::createCheckoutSession con payment_intent_data.metadata = {reserva_id}
   └─ Devuelve {reserva_id, url}
   ↓
Frontend redirige: window.location.href = url   (Stripe Checkout)
   ↓
Usuario paga en Stripe
   ↓
Stripe envía POST /api/stripe/webhook con event = "checkout.session.completed"
   ↓
StripeWebhookController:
   ├─ Verifica HMAC
   ├─ Resuelve la reserva por stripe_session_id
   ├─ Salta si ya está Confirmada (idempotencia)
   ├─ Marca reserva = Confirmada
   ├─ Crea registro en `ventas` (estado = Confirmada)
   └─ Mailer::sendReservaConfirmacion (best-effort)
   ↓
Stripe redirige a /pago/exito?session_id=cs_test_...
   ↓
PagoExito.tsx hace polling GET /api/reservas/status cada 2s (máx 12s)
   ↓
Cuando estado = Confirmada → muestra mensaje de éxito
```

### Flujo 2 — Cancelación con refund automático

```
Usuario → /perfil → mis reservas → clic "Cancelar" en una reserva Confirmada
   ↓
PATCH /api/reservas/{id} {accion: "cancelar"}
   ↓
ReservasController::cancel:
   ├─ Verifica que el usuario es el dueño
   ├─ Si estado = Confirmada y hay stripe_session_id:
   │    ├─ Stripe::retrieveCheckoutSession → obtiene payment_intent
   │    └─ Stripe::createRefund(payment_intent)
   ├─ Si Stripe falla → 502, no toca BD
   ├─ Si Stripe OK:
   │    ├─ reserva.estado = Cancelada
   │    ├─ venta.estado = Cancelada (si hay venta activa)
   │    └─ libera cupos: available_seats += personas
   └─ Mailer::sendReservaCancelacion
```

### Flujo 3 — Refund desde admin

```
Admin → /admin/ventas → ve venta Confirmada → clic botón ámbar "Reembolsar" (RotateCcw)
   ↓
Modal de confirmación muestra monto + aviso 5-10 días de extracto
   ↓
POST /api/admin/ventas/{id}/refund
   ↓
AdminVentasController::refund:
   ├─ Verifica que la venta esté Confirmada
   ├─ Encuentra la última reserva activa del usuario+viaje
   ├─ Stripe refund antes de tocar BD (mismo orden que el flujo 2)
   ├─ Si OK: cancela venta + reserva + libera cupos
   └─ Devuelve OK
```

### Flujo 4 — Recuperación de contraseña

```
Usuario → /login → "¿Olvidaste tu contraseña?" → /forgot-password
   ↓
Ingresa email → POST /api/auth/forgot-password
   ↓
Backend:
   ├─ Busca usuario; si no existe NO lo dice (200 genérico)
   ├─ Si existe: genera token aleatorio 64 hex
   ├─ Guarda hash SHA-256 + expires_at = now() + 1h
   └─ Mailer::sendPasswordReset(email, link)
        link = {APP_URL}/reset-password/{token}
   ↓
Usuario → email → click → /reset-password/:token
   ↓
Pone nueva contraseña → POST /api/auth/reset-password {token, password}
   ↓
Backend:
   ├─ SHA-256(token) → busca en BD
   ├─ Verifica expires_at > now() y used_at = NULL
   ├─ password_hash y UPDATE usuario
   └─ Marca used_at = now()
```

### Flujo 5 — Publicar / editar / eliminar experiencia

```
Usuario autenticado → /experiencias
   ↓
GET /api/auth/reservas → carga destinos de reservas Confirmadas
   ↓
Formulario:
   ├─ Selecciona destino (de las reservas)
   ├─ Estrellas (1-5)
   ├─ Texto (10-500 chars)
   └─ Imagen opcional (jpg/png/webp, máx 5MB)
   ↓
POST multipart o JSON → /api/experiencias
   ↓
Backend valida, guarda imagen con uniqid(), inserta en BD
   ↓
La tarjeta del autor muestra botones Pencil/Trash2 (ownership check en backend con 403)
   ↓
Editar: PUT /api/experiencias/{id} (rating y texto; destino bloqueado)
Eliminar: DELETE /api/experiencias/{id} → borra DB + archivo
```

### Flujo 6 — Admin gestiona ventas y reservas

```
Admin → /admin
   ↓
GET /api/admin/ventas/stats → KPIs (ingresos, top destinos, gráfico semanal)
GET /api/admin/ventas + /api/admin/reservas → tablas filtrables
   ↓
Acciones:
   ├─ PATCH /api/admin/ventas/{id}/estado
   ├─ POST /api/admin/ventas/{id}/refund  (refund Stripe + BD)
   ├─ PATCH /api/admin/reservas/{id}/estado  (sincroniza cupos en transiciones desde/hacia Cancelada)
   └─ DELETE /api/admin/reservas/{id}
```

---

## 11. Variables de Entorno

### Backend — `viaje.api/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_CHARSET` | Conexión MySQL | `127.0.0.1` / `tuviaje_db` / `root` / *(vacío)* / `utf8mb4` |
| `JWT_SECRET` | Clave HMAC para firmar tokens | string largo aleatorio |
| `JWT_TTL` | TTL del token en segundos | `3600` |
| `JWT_ALG` | Algoritmo | `HS256` |
| `CORS_ORIGIN` | Origen permitido (URL exacta del frontend) | `http://localhost:5173` |
| `APP_URL` | URL pública del frontend (links en emails y Stripe) | `http://localhost:5173` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | SMTP opcional; vacío → `mail()` nativo | `smtp.gmail.com` / `587` / ... / `tls` |
| `MAIL_FROM`, `MAIL_FROM_NAME` | Remitente | `no-reply@tuviaje.com` / `TuViaje` |
| `STRIPE_SECRET_KEY` | Clave secreta (Test mode) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret del endpoint webhook | `whsec_...` |

### Frontend — `viaje.platform/ui/.env`

```env
VITE_API_BASE_URL=http://localhost/AgenciaDeViajesSystem/viaje.api
VITE_APP_NAME=TuViaje
```

> Las variables Vite deben empezar con `VITE_` para ser accesibles vía `import.meta.env`.

---

## 12. Roles y Permisos

| Acción | Público | Usuario | Admin |
|--------|:------:|:------:|:----:|
| Ver viajes, experiencias, stats, covers | ✅ | ✅ | ✅ |
| Registrarse / Login | ✅ | — | — |
| Recuperar contraseña | ✅ | ✅ | ✅ |
| Hacer reservas y pagar | ❌ | ✅ | ✅ |
| Cancelar reservas propias (con refund) | ❌ | ✅ | ✅ |
| Marcar favoritos | ❌ | ✅ | ✅ |
| Publicar / editar / eliminar experiencias propias | ❌ | ✅ | ✅ |
| Editar perfil + avatar | ❌ | ✅ | ✅ |
| CRUD viajes | ❌ | ❌ | ✅ |
| CRUD usuarios | ❌ | ❌ | ✅ |
| Ver reportes de ventas | ❌ | ❌ | ✅ |
| Cambiar estado de ventas | ❌ | ❌ | ✅ |
| Ejecutar refund desde admin | ❌ | ❌ | ✅ |
| Gestionar reservas (todas) | ❌ | ❌ | ✅ |
| Moderar experiencias (visibilidad / eliminar) | ❌ | ❌ | ✅ |
| CRUD covers del header | ❌ | ❌ | ✅ |
| Ejecutar cleanup de pendientes | ❌ | ❌ | ✅ |

### Cuenta admin por defecto

`install.sql` crea una cuenta admin inicial. Cambiar la contraseña tras el primer login.

---

## 13. Tests

### Backend (47 tests)

```bash
cd AgenciaDeViajesSystem/viaje.api
php tests/run_tests.php
```

Archivos:
- `JWTTest.php` — encode/decode/verify, expiración, firma alterada.
- `CuposLogicTest.php` — decremento atómico, condición de carrera.
- `MailerTest.php` — formato de emails, helpers.
- `StripeWebhookTest.php` — 11 tests de verificación HMAC: firma válida, header vacío, secret no configurado, sin `t=`/`v1=`, firma alterada, timestamp viejo, secret distinto, multi-firma para rotación, tolerancia de reloj.

Output esperado: `47/47 ✓`.

En XAMPP el binario PHP suele estar en `C:\xampp\php\php.exe`.

### Frontend (26 tests)

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
npx vitest run
```

Archivos: `auth.service.test.ts`, `reservas.service.test.ts`, `cupos.logic.test.ts`.

Output esperado: `26/26 ✓`.

**Nota:** Vitest 4 **no** acepta `--reporter=basic` (falla con `ERR_LOAD_URL`). Usar sin reporter o `--reporter=verbose`.

### Type check

```bash
npx tsc -b
```

Debe terminar con exit code 0.

---

## 14. Preguntas Frecuentes

### ¿Por qué no carga el frontend?

1. Verificar `npm install` y `npm run dev`.
2. `.env` del frontend con `VITE_API_BASE_URL`.

### ¿Por qué la API devuelve 500?

1. MySQL corriendo.
2. `.env` con credenciales correctas.
3. Abrir `http://localhost/AgenciaDeViajesSystem/viaje.api/api/viajes` y leer el error.
4. Revisar `logs/error.log` de Apache (XAMPP).

### ¿Por qué aparece error CORS?

1. `CORS_ORIGIN` debe coincidir **exactamente** con la URL del frontend (incluyendo el puerto).
2. Apache debe estar sirviendo el backend (no PHP built-in server).

### ¿Cómo testeo Stripe en local?

1. Instalar Stripe CLI: https://stripe.com/docs/stripe-cli.
2. `stripe login` (abre el navegador).
3. `stripe listen --forward-to http://localhost/AgenciaDeViajesSystem/viaje.api/api/stripe/webhook`.
4. Copiar el `whsec_...` que imprime y pegarlo en `STRIPE_WEBHOOK_SECRET` del `.env`.
5. Reiniciar Apache.
6. Usar tarjetas de prueba:
   - `4242 4242 4242 4242` — pago OK.
   - `4000 0000 0000 9995` — fondos insuficientes.
   - `4000 0025 0000 3155` — requiere 3D Secure.

### ¿Por qué quedan reservas en `Pendiente` para siempre?

Cuando un usuario inicia checkout en Stripe y nunca paga (cierra el tab), la sesión expira en 24h y Stripe dispara `checkout.session.expired`, que el webhook procesa. Pero si el webhook no está corriendo en ese momento, conviene tener el **cleanup job** activo:

```bash
php jobs/cleanup_pendientes.php --minutes=30
```

Cancela reservas Pendientes con más de N minutos y libera los cupos. Programarlo cada 15 minutos en cron (Linux) o Task Scheduler (Windows). También se puede disparar manual con `POST /api/admin/maintenance/cleanup-pendientes`.

### ¿Por qué no llegan emails?

Si `SMTP_HOST` está vacío, se usa `mail()` de PHP, que en Windows/XAMPP rara vez funciona out-of-the-box. Configurar SMTP:

- Gmail: crear App Password en https://myaccount.google.com/apppasswords, usar host `smtp.gmail.com` puerto `587` con `tls`.
- Mailtrap (para development): host `sandbox.smtp.mailtrap.io`.

El envío es **best-effort**: si falla, la reserva/registro/reset igual se completa.

### ¿Cómo crear otro admin?

```sql
INSERT INTO usuarios (name, email, password, rol)
VALUES ('Nombre Admin', 'admin@ejemplo.com', '<bcrypt_hash>', 'admin');
```

Generar el hash desde PHP:
```php
echo password_hash('micontraseña', PASSWORD_BCRYPT);
```

### ¿Dónde se guardan las imágenes subidas?

- Experiencias: `viaje.api/uploads/experiencias/`
- Avatares: `viaje.api/uploads/avatars/`
- Covers del header: las URLs se ingresan directamente en la BD (no upload — pensado para CDN/URL externa).

### ¿Cómo cambiar la duración del token JWT?

Modificar `JWT_TTL` en `.env` (segundos). Por ejemplo `7200` para 2h.

---

*Documentación actualizada el 15 de mayo de 2026.*
