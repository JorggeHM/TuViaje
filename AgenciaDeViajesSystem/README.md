# TuViaje — Sistema de Agencia de Viajes

Aplicación full-stack para gestionar destinos turísticos, reservas y pagos online.

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: PHP 8 (MVC propio, sin framework) + JWT
- **DB**: MySQL 8
- **Pago**: Stripe Checkout (modo Test)
- **Email**: SMTP custom o `mail()` nativo (best-effort)

## Estructura del repo

```
AgenciaDeViajesSystem/
├── viaje.api/          # Backend PHP (controllers, models, helpers, tests)
├── viaje.platform/ui/  # Frontend React/TS
├── viaje.database/     # schema.sql + migraciones
└── README.md           # este archivo
```

## Funciones implementadas

### Público
- **Catálogo de viajes** (`/destinos`) con filtros de precio, duración y orden.
- **Detalle de viaje** (`/viaje/:id`) con galería, reserva con selector de personas, pago vía Stripe.
- **Inicio** con destinos destacados aleatorios desde la API y estadísticas en vivo.
- **Sobre nosotros** (`/nosotros`) con métricas reales (`/api/stats`).
- **Experiencias** (`/experiencias`) — feed de testimonios con upload de imágenes (FormData, máx 5 MB, JPG/PNG/WEBP).
- **Inicio de sesión y registro** con JWT.
- **Recuperación de contraseña** end-to-end (`/forgot-password` → email con link → `/reset-password/:token`).
- **Perfil** (`/perfil`): edición de datos, cambio de contraseña, mis reservas, mis favoritos.
- **Sistema de favoritos**: marcar/desmarcar viajes con persistencia en DB y rollback optimista.
- **Pago con Stripe** (modo Test): el botón "Reservar" lleva a Stripe Checkout; la reserva queda en `Pendiente` hasta que el webhook la confirma. Páginas `/pago/exito` y `/pago/cancelado`. Ver [stripe.md](./stripe.md) para configuración.
- **Emails transaccionales** best-effort: bienvenida al registrarse, confirmación de reserva tras pago exitoso, cancelación, link de reset de contraseña.

### Panel admin (`/admin`)
- **Resumen**: dashboard con métricas (ingresos, ventas, viajes activos, alertas de cupos bajos).
- **Viajes**: CRUD completo (crear/editar/finalizar/eliminar) con búsqueda y filtros por estado.
- **Usuarios**: listar, activar/desactivar, eliminar.
- **Reservas**: panel independiente con filtros por estado, cambio de estado inline (sincroniza cupos automáticamente en transiciones desde/hacia Cancelada), eliminar.
- **Ventas**: tabla con filtros, gráfico de ingresos semanal, top destinos, cambio de estado.
- **Experiencias**: moderación — ocultar/mostrar (sin borrar) o eliminar (también borra la imagen del filesystem).

### Arquitectura técnica destacada
- **AuthContext** con hook `useAuth()` — single source of truth del usuario, sin re-leer `localStorage` en cada render.
- **JWT** firmado con HS256, payload con `sub`, `email`, `name`, `rol`. `Middleware::auth` y `Middleware::adminOnly` protegen las rutas.
- **Manejo atómico de cupos**: `decrementSeats` falla si dos usuarios compiten por el último cupo (UPDATE condicional).
- **Webhook Stripe** con verificación HMAC-SHA256, idempotente.
- **Tests**: backend 36 tests con framework propio (`tests/run_tests.php`); frontend 26 tests con Vitest.

## Requisitos

- Node.js 20+ y npm
- PHP 8.1+ con extensiones `pdo_mysql`, `curl`, `openssl`
- MySQL 8 o MariaDB 10.4+
- Servidor web (Apache via XAMPP funciona out-of-the-box)
- Cuenta de Stripe (modo Test, gratis) — solo si se quiere probar el flujo de pago

## Setup inicial

### 1. Base de datos

```bash
mysql -u root -p < viaje.database/schema.sql
```

Si ya tenés una BD desde versiones anteriores, correr las migraciones individuales que falten en `viaje.database/`:
- `migration_add_rol.sql`
- `migration_add_personas.sql`
- `migration_password_resets.sql`
- `migration_favoritos.sql`
- `migration_experiencias_visible.sql`
- `migration_stripe_sessions.sql`

### 2. Backend

```bash
cd viaje.api
cp .env.example .env
# Editar .env con tus credenciales de DB y, opcionalmente, claves de Stripe y SMTP.
```

Servir desde XAMPP (`htdocs/AgenciaDeViajesSystem`) o con el server embebido de PHP:

```bash
php -S localhost:8000 -t .
```

### 3. Frontend

```bash
cd viaje.platform/ui
npm install
npm run dev
```

La UI queda en http://localhost:5173 y consume la API en `VITE_API_BASE_URL` (default `http://localhost/AgenciaDeViajesSystem/viaje.api`).

### 4. Stripe (opcional pero recomendado)

Ver [stripe.md](./stripe.md) — guía detallada con tarjetas de prueba.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el frontend en modo desarrollo |
| `npm run build` | Compila TS y construye el bundle de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Corre los tests unitarios con Vitest |
| `php tests/run_tests.php` | Corre los tests del backend (desde `viaje.api/`) |

## Variables de entorno (`viaje.api/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_CHARSET` | Conexión MySQL | `127.0.0.1` / `tuviaje_db` |
| `JWT_SECRET` | Clave HMAC para firmar tokens | (cualquier string largo aleatorio) |
| `JWT_TTL`, `JWT_ALG` | TTL en segundos y algoritmo | `3600`, `HS256` |
| `CORS_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `APP_URL` | URL pública del frontend (links en emails y Stripe) | `http://localhost:5173` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | SMTP opcional | (vacío = `mail()` nativo) |
| `MAIL_FROM`, `MAIL_FROM_NAME` | Remitente de los emails | `no-reply@tuviaje.com` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (modo Test) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secreto del endpoint de webhook | `whsec_...` |

## Endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crea cuenta, envía email de bienvenida, devuelve JWT |
| POST | `/api/auth/login` | Devuelve JWT |
| GET | `/api/auth/me` | Datos del usuario autenticado |
| POST | `/api/auth/logout` | (no-op server-side, limpia token cliente) |
| PUT | `/api/auth/perfil` | Edita nombre/email, re-emite token |
| PUT | `/api/auth/password` | Cambia contraseña (con la anterior) |
| POST | `/api/auth/forgot-password` | Envía link de reset (responde 200 incluso si el email no existe) |
| POST | `/api/auth/reset-password` | Cambia contraseña con token |

### Usuario autenticado
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/viajes` · `/api/viajes/{id}` | Listado / detalle público |
| POST | `/api/reservas` | Crea reserva en `Pendiente` y devuelve URL de Stripe Checkout |
| GET | `/api/auth/reservas` | Mis reservas |
| PATCH | `/api/reservas/{id}` | Cancelar reserva propia |
| GET / POST / DELETE | `/api/favoritos` · `/api/favoritos/{viajeId}` · `/api/favoritos/ids` | Sistema de favoritos |
| GET / POST / PATCH | `/api/experiencias` · `/api/experiencias/{id}/like` | Feed público + publicar |
| GET | `/api/stats` | Métricas públicas (viajes realizados, viajeros, ciudades, satisfacción) |

### Webhook
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/stripe/webhook` | Recibe eventos de Stripe (auth por firma HMAC) |

### Admin
| Método | Ruta | Descripción |
|---|---|---|
| GET / POST / PUT / PATCH / DELETE | `/api/admin/viajes/...` | CRUD viajes |
| GET / PATCH / DELETE | `/api/admin/usuarios/...` | Gestión usuarios |
| GET / PATCH / DELETE | `/api/admin/reservas/...` | Gestión reservas |
| GET / PATCH | `/api/admin/ventas/...` | Reporte de ventas |
| GET / PATCH / DELETE | `/api/admin/experiencias/...` | Moderación experiencias |

## Tarjetas de prueba (Stripe Test mode)

| Tarjeta | Resultado |
|---|---|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure |

Cualquier CVC de 3 dígitos y fecha futura.

## Tecnologías y dependencias clave

**Frontend**: React 19, React Router 7, Axios, Tailwind CSS 4, lucide-react, Vitest 4.

**Backend**: PHP 8, PDO, Mailer SMTP custom, cliente Stripe sobre cURL (sin SDK).

## Solución de problemas

- **Webhooks no llegan en localhost**: Stripe no puede alcanzar tu máquina directamente. Usá Stripe CLI (ver [stripe.md](./stripe.md)).
- **`vitest --reporter=basic` falla**: Vitest 4 no soporta ese flag. Correr sin reporter o con `--reporter=verbose`.
- **CORS errors**: verificar que `CORS_ORIGIN` en `.env` coincide con la URL del frontend.
- **Emails no llegan**: si `SMTP_HOST` está vacío se usa `mail()` nativo, que en Windows/XAMPP normalmente no funciona. Configurar SMTP (ej. Gmail con App Password).

## Licencia

Proyecto académico — uso libre.
