# TuViaje — Documentación Técnica Completa

**Stack:** PHP 8 + MySQL 8 + React 19 + TypeScript + Vite + Tailwind CSS

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
13. [Preguntas frecuentes](#13-preguntas-frecuentes)

---

## 1. Descripción General

**TuViaje** es una aplicación web de agencia de viajes que permite a los usuarios explorar destinos, hacer reservas y publicar experiencias. El sistema cuenta con tres niveles de acceso:

- **Público** — Cualquier visitante puede explorar viajes y leer experiencias.
- **Usuario registrado** — Puede hacer reservas y publicar experiencias propias.
- **Administrador** — Gestiona viajes, usuarios y ve reportes de ventas.

### Tecnologías principales

| Capa          | Tecnología |
|------         |-----------|
| Backend       |PHP 8 (sin framework), PDO, JWT |
| Base de datos | MySQL  |
| Frontend      | React , TypeScript, Vite  |
| Estilos       | Tailwind CSS  |
| HTTP Client   | Axios |
| Enrutamiento  | React Router  |

---

## 2. Requisitos Mínimos

### Software necesario

| Software | Versión mínima | Notas |
|---------|---------------|-------|
| PHP | 8.0 | Con extensiones: `pdo`, `pdo_mysql`, `json`, `fileinfo` |
| MySQL | 8.0 |  |
| Apache | 2.4 |  |
| Node.js | 18.0 | Para compilar y ejecutar el frontend |
| npm | 9.0 | Incluido con Node.js |

> ** Instalar **XAMPP 8.2** (Windows/macOS/Linux) — incluye PHP 8.2, MySQL 8.0 y Apache 2.4 en un solo instalador.

---

## 3. Estructura del Proyecto

```
TuViaje/
└── AgenciaDeViajesSystem/
    ├── viaje.api/              ← Backend PHP
    │   ├── config/
    │   │   ├── database.php    ← Conexion PDO
    │   │   └── jwt.php         ← Constantes JWT
    │   ├── controllers/
    │   │   ├── AuthController.php
    │   │   ├── ExperienciasController.php
    │   │   ├── ReservasController.php
    │   │   ├── ViajesController.php
    │   │   └── admin/
    │   │       ├── AdminViajesController.php
    │   │       ├── AdminUsuariosController.php
    │   │       └── AdminVentasController.php
    │   ├── core/
    │   │   ├── Router.php      ← Enrutador RESTful
    │   │   ├── Request.php     ← Parseo de entrada HTTP
    │   │   ├── Response.php    ← Salida JSON
    │   │   └── Middleware.php  ← Validación de JWT
    │   ├── helpers/
    │   │   └── JWT.php         ← Encode/decode de tokens
    │   ├── models/
    │   │   ├── Usuario.php
    │   │   ├── Viaje.php
    │   │   ├── Reserva.php
    │   │   ├── Venta.php
    │   │   └── Experiencia.php
    │   ├── uploads/
    │   │   └── experiencias/   ← Imagenes subidas por usuarios
    │   ├── .env                ← Variables de entorno (NO subir a git)
    │   ├── .env.example        ← Plantilla de variables
    │   ├── .htaccess           ← Reescritura de URLs para Apache
    │   └── index.php           ← Punto de entrada de la API
    │
    ├── viaje.database/         ← Scripts SQL
    │   ├── schema.sql          ← Definición de tablas
    │   ├── install.sql         ← Instalación completa (tablas + admin)
    │   ├── seed.sql            ← Datos de prueba
    │   └── migration_add_rol.sql ← Migración histórica
    │
    └── viaje.platform/
        └── ui/                 ← Frontend React
            ├── src/
            │   ├── ApplicationRouter.tsx   ← Rutas de la SPA
            │   ├── main.tsx
            │   ├── infrastructure/
            │   │   ├── api/
            │   │   │   └── client.ts       ← Axios configurado
            │   │   └── services/
            │   │       ├── auth.service.ts
            │   │       ├── viajes.service.ts
            │   │       └── reservas.service.ts
            │   ├── components/             ← Componentes reutilizables
            │   ├── web.public/             ← Páginas accesibles sin login
            │   ├── web.private/            ← Páginas que requieren login
            │   └── web.admin/              ← Panel de administración
            ├── .env                        ← Variables Vite
            ├── package.json
            └── vite.config.ts
```

---

## 4. INSTALACION

### Paso 1 — Clonar o ubicar el proyecto

Si el proyecto ya está descargado, navegar a la carpeta raíz:

```bash
cd /path/a/TuViaje
```

Si se clona desde repositorio:

```bash
git clone <URL_REPOSITORIO> TuViaje
cd TuViaje
```

---

### Paso 2 — Configurar el servidor Apache

Copiar (o mover) la carpeta `AgenciaDeViajesSystem` dentro del directorio raíz de Apache:

 Windows:** `C:\xampp\htdocs\AgenciaDeViajesSystem`

Verificar que `mod_rewrite` esté habilitado. En XAMPP esto ya viene activo. En Ubuntu:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

El archivo `.htaccess` dentro de `viaje.api/` ya contiene las reglas necesarias:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [QSA,L]
```

---

### Paso 3 — Crear la base de datos

Abrir **phpMyAdmin** (en XAMPP: `http://localhost/phpmyadmin`) o usar la consola MySQL:

```sql
CREATE DATABASE tuviaje_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuviaje_db;
```

Luego ejecutar el script de instalación completo:

```bash
# Desde consola MySQL
mysql -u root -p tuviaje_db < AgenciaDeViajesSystem/viaje.database/install.sql
```

O desde phpMyAdmin: seleccionar la base `tuviaje_db` → pestaña **Importar** → subir `install.sql`.

> El script `install.sql` crea todas las tablas, índices y un usuario administrador por defecto.

**Para cargar datos de prueba (opcional):**

```bash
mysql -u root -p tuviaje_db < AgenciaDeViajesSystem/viaje.database/seed.sql
```

---

### Paso 4 — Configurar el Backend (.env)

Copiar el archivo de ejemplo y editarlo:

```bash
cp AgenciaDeViajesSystem/viaje.api/.env.example AgenciaDeViajesSystem/viaje.api/.env
```

Abrir `.env` y ajustar los valores:

```env
# Base de datos
DB_HOST=127.0.0.1
DB_NAME=tuviaje_db
DB_USER=root
DB_PASS=             # Dejar vacío si MySQL no tiene contraseña (XAMPP por defecto)
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=TuViaje$2026#SecretKey!XyZ@RandomStr0ng
JWT_TTL=3600
JWT_ALG=HS256

# CORS — URL donde corre el frontend
CORS_ORIGIN=http://localhost:5173
```

---

### Paso 5 — Configurar el Frontend (.env)

Ir a la carpeta del frontend y crear el archivo `.env`:

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
```

Crear el archivo `.env`:

```env
VITE_API_BASE_URL=http://localhost/AgenciaDeViajesSystem/viaje.api
VITE_APP_NAME=TuViaje
```

> **Importante:** El valor de `VITE_API_BASE_URL` debe apuntar exactamente a donde Apache sirve el backend.

---

### Paso 6 — Instalar dependencias del Frontend

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
npm install
```

---

### Paso 7 — Iniciar los servicios

**Backend (Apache + MySQL):**

- En XAMPP: abrir el panel de control y hacer clic en **Start** en Apache y MySQL.
**Frontend (servidor de desarrollo Vite):**

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
npm run dev
```

La terminal mostrará:

```
  VITE v8.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Paso 8 — Verificar la instalación

1. Abrir `http://localhost:5173` en el navegador — debe verse la página de inicio de TuViaje.
2. Abrir `http://localhost/AgenciaDeViajesSystem/viaje.api/api/viajes` — debe devolver un JSON con los viajes.
3. Iniciar sesión con el administrador creado por `install.sql`.

---

### Build para producción (opcional)

Para generar los archivos estáticos del frontend:

```bash
cd AgenciaDeViajesSystem/viaje.platform/ui
npm run build
```

Los archivos se generan en `dist/`. Copiarlos al servidor web y apuntar el virtual host a esa carpeta.

---

## 5. Arquitectura Técnica

### Diagrama general

```
┌─────────────────────────────────────┐
│          Navegador (Browser)         │
│   React SPA — http://localhost:5173  │
└───────────────┬─────────────────────┘
                │ HTTP + JWT (Axios)
                ▼
┌─────────────────────────────────────┐
│        Apache 2.4 (puerto 80)        │
│   /AgenciaDeViajesSystem/viaje.api   │
│                                      │
│   index.php → Router → Middleware    │
│           ↓                          │
│       Controllers                    │
│           ↓                          │
│         Models                       │
└───────────────┬─────────────────────┘
                │ PDO
                ▼
┌─────────────────────────────────────┐
│         MySQL 8 (puerto 3306)        │
│           tuviaje_db                 │
└─────────────────────────────────────┘
```

### Backend — Flujo de una petición

```
HTTP Request
    ↓
index.php
    ├─ Carga .env
    ├─ Configura headers CORS
    ├─ Responde OPTIONS (preflight)
    └─ Registra rutas en Router
         ↓
    Router::dispatch()
         ├─ Extrae método y path
         ├─ Busca handler registrado
         └─ Ejecuta Middleware si la ruta lo requiere
              ↓
         Controller::método()
              ├─ Lee datos del Request
              ├─ Llama al Model
              └─ Devuelve Response JSON
```

### Frontend — Estructura de capas

```
Componentes React (UI)
         ↓
     Services (auth, viajes, reservas)
         ↓
     Axios client (interceptores JWT)
         ↓
     API REST (backend PHP)
```

---

## 6. Backend — API REST

### Base URL

```
http://localhost/AgenciaDeViajesSystem/viaje.api
```

### Endpoints

#### Autenticación

| Método | Ruta                 | Auth | Descripción |
|--------|------                |------|-------------|
| POST | `/api/auth/login`      | No | Iniciar sesión |
| POST | `/api/auth/register`   | No | Crear cuenta |
| GET | `/api/auth/me`          | Sí | Datos del usuario actual |
| POST | `/api/auth/logout`     | Sí | Cerrar sesión |
| PUT | `/api/auth/perfil`      | Sí | Actualizar nombre/email |
| PUT | `/api/auth/password`    | Sí | Cambiar contraseña |
| GET | `/api/auth/reservas`    | Sí | Mis reservas |

**Ejemplo de login:**

```json
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "micontraseña"
}

Respuesta 200:
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Juan", "email": "...", "rol": "usuario" }
}
```

---

#### Viajes (públicos)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/viajes` | No | Lista viajes activos |
| GET | `/api/viajes/{id}` | No | Detalle de un viaje |

---

#### Reservas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/reservas` | Sí | Crear reserva |
| PATCH | `/api/reservas/{id}` | Sí | Cancelar reserva |

**Ejemplo de reserva:**

```json
POST /api/reservas
Authorization: Bearer {token}
{
  "viaje_id": 3,
  "personas": 2
}

Respuesta 201:
{
  "reserva": { "id": 12, "estado": "Pendiente", "monto": 1800.00 },
  "venta": { "id": 8, "estado": "Confirmada" }
}
```

---

#### Experiencias

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/experiencias` | No | Lista experiencias (filtro: `?minRating=4`) |
| POST | `/api/experiencias` | Sí | Publicar experiencia |
| PATCH | `/api/experiencias/{id}/like` | Sí | Dar like |

---

#### Admin — Viajes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/viajes` | Admin | Todos los viajes |
| POST | `/api/admin/viajes` | Admin | Crear viaje |
| PUT | `/api/admin/viajes/{id}` | Admin | Editar viaje |
| PATCH | `/api/admin/viajes/{id}/finalizar` | Admin | Cambiar estado |
| DELETE | `/api/admin/viajes/{id}` | Admin | Eliminar viaje |

---

#### Admin — Usuarios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/usuarios` | Admin | Lista de usuarios |
| PATCH | `/api/admin/usuarios/{id}/estado` | Admin | Activar/bloquear |
| DELETE | `/api/admin/usuarios/{id}` | Admin | Eliminar usuario |

---

#### Admin — Ventas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/ventas` | Admin | Lista de ventas |
| GET | `/api/admin/ventas/stats` | Admin | Estadísticas (ingresos, top destinos) |
| PATCH | `/api/admin/ventas/{id}/estado` | Admin | Cambiar estado venta |

---

### Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Recurso creado |
| 400 | Datos inválidos |
| 401 | No autenticado |
| 403 | Sin permisos (no admin) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej. email ya existe) |
| 500 | Error interno del servidor |

---

## 8. Frontend — React SPA

### Rutas de la aplicación

#### Rutas públicas (`/`)

| Ruta              | Componente         Descripción |
|------             |-----------        |-------------|
| `/` o `/inicio`   | Inicio.tsx         | Página de bienvenida con viajes destacados |
| `/nosotros`       | AboutUs.tsx       | Información de la agencia |
| `/destinos`       | Destinos.tsx      | Catálogo completo de viajes |
| `/experiencias`   | Experiencias.tsx | Feed de reseñas de usuarios |
| `/viaje/detalle`  | ViajeDetalle.tsx | Detalle del viaje (via estado de router) |
| `/viaje/:id`      | ViajeDetalle.tsx | Detalle del viaje (via URL) |
| `/register`       | Register.tsx      | Formulario de registro |

#### Rutas de sesión (`/login`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | Login.tsx | Formulario de inicio de sesión |
| `/perfil` | Perfil.tsx | Datos del usuario y sus reservas |

#### Rutas de administración (`/admin`)

| Ruta              | Componente | Descripción |
|------             |-----------|-------------|
| `/admin`          | AdminResumen.tsx | Dashboard con KPIs |
| `/admin/viajes`   | AdminViajes.tsx | CRUD de viajes |
| `/admin/usuarios` | AdminUsuarios.tsx | Gestión de usuarios |
| `/admin/ventas`    | AdminVentas.tsx | Reportes y estadísticas |

---

### Servicios disponibles

#### `auth.service.ts`

```typescript
AuthService.login(email, password)      // Retorna token + user
AuthService.register(email, password, name)
AuthService.getCurrentUser()            // GET /api/auth/me
AuthService.logout()
AuthService.getToken()                  // Lee localStorage
AuthService.isAuthenticated()           // Boolean
AuthService.getUser()                   // Decodifica JWT local
AuthService.isAdmin()                   // Boolean
```

#### `viajes.service.ts`

```typescript
ViajesService.listar()                  // GET /api/viajes
ViajesService.obtener(id)               // GET /api/viajes/{id}
```

#### `reservas.service.ts`

```typescript
ReservasService.crear(viajeId, personas) // POST /api/reservas
ReservasService.misReservas()            // GET /api/auth/reservas
ReservasService.cancelar(id)             // PATCH /api/reservas/{id}
```

---

### Componentes reutilizables

| Componente | Descripción |
|-----------|-------------|
| `TravelCard` | Tarjeta de viaje con imagen, precio y botón de reserva |
| `InfoCard` | Tarjeta informativa genérica |
| `ChatFloat` | Widget flotante de contacto |

---

## 9. Autenticación y Seguridad

### Flujo JWT completo

```
1. Usuario → POST /api/auth/login {email, password}
2. Backend verifica hash bcrypt
3. Backend genera JWT:
   - Header: { alg: "HS256", typ: "JWT" }
   - Payload: { sub: userId, email, name, rol, iat, exp (1 hora) }
   - Firma con JWT_SECRET
4. Frontend guarda token en localStorage
5. Axios interceptor añade: Authorization: Bearer {token}
6. Backend (Middleware::auth) valida:
   - Firma correcta con JWT_SECRET
   - Token no expirado
   - Decodifica payload → $request->user
7. Si token inválido → HTTP 401
8. Axios interceptor de respuesta: si 401 → borrar token y redirigir /login
```

### Hashing de contraseñas

Las contraseñas se guardan con `password_hash($pass, PASSWORD_BCRYPT)` y se verifican con `password_verify()`. Nunca se almacenan en texto plano.

### Protección CORS

El backend sólo acepta requests desde el origen definido en `CORS_ORIGIN`. Cualquier origen distinto recibe un error de CORS en el navegador.

### Validación de imágenes

Al subir imágenes de experiencias, el backend valida:
- Extensión: solo `jpg`, `jpeg`, `png`, `webp`
- Tamaño máximo: 5 MB
- Estructura real del archivo con `getimagesize()`
- Renombrado con `uniqid()` para evitar colisiones

---

## 10. Flujos Principales del Sistema

### Flujo 1: Registro y primera reserva

```
Usuario accede a /register
    ↓ Completa nombre, email, contraseña
    ↓ POST /api/auth/register
    ↓ Backend crea usuario (bcrypt), devuelve JWT
    ↓ Frontend guarda token, redirige a /inicio
    ↓
Usuario navega a /destinos
    ↓ GET /api/viajes → lista viajes activos
    ↓ Hace clic en un viaje (TravelCard)
    ↓ navigate() con datos a /viaje/detalle
    ↓
ViajeDetalle: selecciona personas, clic "Reservar"
    ↓ POST /api/reservas {viaje_id, personas}
    ↓ Backend:
       ├─ Verifica viaje activo y cupos suficientes
       ├─ Crea registro en `reservas`
       ├─ Crea registro en `ventas`
       └─ Decrementa available_seats
    ↓ Modal de confirmación
    ↓ Usuario puede ver reserva en /perfil
```

### Flujo 2: Publicar una experiencia

```
Usuario autenticado accede a /experiencias
    ↓ GET /api/auth/reservas (carga destinos de reservas confirmadas)
    ↓
Formulario sticky:
    ├─ Selecciona destino (del select cargado)
    ├─ Califica con estrellas (1-5)
    ├─ Escribe texto (10 a 500 caracteres)
    └─ Opcionalmente sube imagen (jpg/png/webp, máx 5MB)
    ↓
POST /api/experiencias (multipart si hay imagen, JSON si no)
    ↓ Backend valida, guarda imagen, inserta en DB
    ↓ Nueva experiencia aparece en el feed
```

### Flujo 3: Administrador gestiona ventas

```
Admin hace login → redirige a /admin
    ↓
/admin/ventas:
    ├─ GET /api/admin/ventas/stats
    │   → KPIs: ingresos totales, confirmadas, pendientes, canceladas
    │   → Gráfico semanal de ventas
    │   → Top 5 destinos
    ├─ GET /api/admin/ventas → tabla de ventas filtrable
    └─ PATCH /api/admin/ventas/{id}/estado → cambiar estado
```

---

## 11. Variables de Entorno

### Backend — `viaje.api/.env`

```env
# ─── Base de datos ───────────────────────────────
DB_HOST=127.0.0.1
DB_NAME=tuviaje_db
DB_USER=root
DB_PASS=                          # Vacío en XAMPP por defecto
DB_CHARSET=utf8mb4

# ─── JWT ─────────────────────────────────────────
JWT_SECRET=TuViaje$2026#SecretKey!XyZ@RandomStr0ng
JWT_TTL=3600                      # Segundos (3600 = 1 hora)
JWT_ALG=HS256

# ─── CORS ────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173 # URL exacta del frontend
```

### Frontend — `viaje.platform/ui/.env`

```env
VITE_API_BASE_URL=http://localhost/AgenciaDeViajesSystem/viaje.api
VITE_APP_NAME=TuViaje
```

> Las variables de Vite **deben empezar con `VITE_`** para ser accesibles en el código con `import.meta.env.VITE_*`.

---

## 12. Roles y Permisos

| Acción | Público | Usuario | Admin |
|--------|---------|---------|-------|
| Ver viajes | ✅ | ✅ | ✅ |
| Ver experiencias | ✅ | ✅ | ✅ |
| Registrarse / Login | ✅ | — | — |
| Hacer reservas | ❌ | ✅ | ✅ |
| Publicar experiencias | ❌ | ✅ | ✅ |
| Ver mis reservas | ❌ | ✅ | ✅ |
| Editar perfil | ❌ | ✅ | ✅ |
| Gestionar viajes (CRUD) | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |
| Ver reportes de ventas | ❌ | ❌ | ✅ |
| Cambiar estado de ventas | ❌ | ❌ | ✅ |

### Cuenta administrador por defecto

El script `install.sql` crea una cuenta admin. Revisar ese archivo para obtener las credenciales por defecto. Se recomienda cambiar la contraseña después del primer inicio de sesión.

---

## 13. Preguntas Frecuentes

### ¿Por qué no carga el frontend?

Verificar que:
1. Se ejecutó `npm install` en `viaje.platform/ui/`
2. Se corrió `npm run dev` y está activo
3. El archivo `.env` del frontend existe con `VITE_API_BASE_URL`

### ¿Por qué la API devuelve 500?

1. Verificar que MySQL está corriendo
2. Verificar que el archivo `.env` del backend tiene las credenciales correctas
3. Abrir `http://localhost/AgenciaDeViajesSystem/viaje.api` directamente y revisar el error
4. Revisar logs de Apache: `logs/error.log` en XAMPP

### ¿Por qué aparece error CORS?

1. Verificar que `CORS_ORIGIN` en el `.env` del backend coincide exactamente con la URL del frontend (incluyendo el puerto)
2. Asegurarse de que Apache está sirviendo el backend (no PHP built-in server)

### ¿Cómo crear otro usuario administrador?

```sql
-- Desde MySQL
INSERT INTO usuarios (name, email, password, rol)
VALUES ('Nombre Admin', 'admin@ejemplo.com', '$2y$10$HASH_BCRYPT', 'admin');
```

Para generar el hash bcrypt en PHP:
```php
echo password_hash('micontraseña', PASSWORD_BCRYPT);
```

### ¿Dónde se guardan las imágenes de experiencias?

En `viaje.api/uploads/experiencias/`. La URL absoluta se guarda en la columna `imagen` de la tabla `experiencias` y se sirve directamente por Apache.

### ¿Cómo cambiar la duración del token JWT?

En `viaje.api/.env`, modificar `JWT_TTL` (valor en segundos). Por ejemplo: `7200` para 2 horas.

---

*Documentación generada el 19 de abril de 2026.*
