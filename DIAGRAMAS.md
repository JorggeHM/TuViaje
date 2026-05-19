# TuViaje — Diagramas del Sistema

> Todos los diagramas usan sintaxis **Mermaid**. Se renderizan automáticamente en GitHub, GitLab, Obsidian, Notion y la extensión "Markdown Preview Mermaid Support" de VS Code.

---

## Tabla de Contenidos

### Estructura
- [Modelo Entidad-Relación](#modelo-entidad-relación)
- [Diagrama de Componentes — Sistema Completo](#diagrama-de-componentes--sistema-completo)
- [Diagrama de Componentes — Frontend React](#diagrama-de-componentes--frontend-react)
- [Diagrama de Componentes — Backend PHP](#diagrama-de-componentes--backend-php)

### Flujos de actividad
- [Registro de Usuario](#diagrama-de-actividades--registro-de-usuario)
- [Inicio de Sesión](#diagrama-de-actividades--inicio-de-sesión)
- [Pago de Reserva con Stripe](#diagrama-de-actividades--pago-de-reserva-con-stripe)
- [Cancelación con Refund Automático](#diagrama-de-actividades--cancelación-con-refund-automático)
- [Recuperación de Contraseña](#diagrama-de-actividades--recuperación-de-contraseña)
- [Publicar / Editar una Experiencia](#diagrama-de-actividades--publicar--editar-una-experiencia)
- [Administrador Gestiona Ventas](#diagrama-de-actividades--administrador-gestiona-ventas)
- [Administrador Gestiona Viajes](#diagrama-de-actividades--administrador-gestiona-viajes)
- [Refund desde el Panel Admin](#diagrama-de-actividades--refund-desde-el-panel-admin)
- [Cleanup Automático de Pendientes](#diagrama-de-actividades--cleanup-automático-de-pendientes)

---

## Modelo Entidad-Relación

```mermaid
erDiagram
    USUARIOS {
        int         id          PK
        varchar     name
        varchar     email       UK
        varchar     password
        enum        rol
        varchar     avatar_url
        tinyint     activo
        datetime    created_at
    }

    VIAJES {
        int         id              PK
        varchar     title
        text        description
        varchar     destination
        decimal     price
        int         available_seats
        date        start_date
        date        end_date
        int         duracion_dias
        decimal     rating
        varchar     imagen_url
        json        incluidos
        json        galeria
        json        garantias
        enum        estado
        datetime    created_at
    }

    RESERVAS {
        int         id                 PK
        int         usuario_id         FK
        int         viaje_id           FK
        datetime    fecha_reserva
        enum        estado
        decimal     monto
        int         personas
        varchar     stripe_session_id
    }

    VENTAS {
        int         id          PK
        int         usuario_id  FK
        int         viaje_id    FK
        decimal     monto
        enum        estado
        datetime    fecha
    }

    EXPERIENCIAS {
        int         id          PK
        int         usuario_id  FK
        varchar     destino
        tinyint     rating
        text        texto
        datetime    fecha
        int         likes
        varchar     imagen
        tinyint     visible
    }

    FAVORITOS {
        int         id          PK
        int         usuario_id  FK
        int         viaje_id    FK
        datetime    created_at
    }

    PASSWORD_RESETS {
        int         id          PK
        int         usuario_id  FK
        char        token_hash  UK
        datetime    expires_at
        datetime    used_at
        datetime    created_at
    }

    COVER_IMAGENES {
        int         id          PK
        varchar     url
        int         orden
        tinyint     visible
        datetime    created_at
    }

    USUARIOS ||--o{ RESERVAS         : "realiza"
    USUARIOS ||--o{ VENTAS           : "genera"
    USUARIOS ||--o{ EXPERIENCIAS     : "publica"
    USUARIOS ||--o{ FAVORITOS        : "marca"
    USUARIOS ||--o{ PASSWORD_RESETS  : "solicita"
    VIAJES   ||--o{ RESERVAS         : "tiene"
    VIAJES   ||--o{ VENTAS           : "origina"
    VIAJES   ||--o{ FAVORITOS        : "es"
```

---

## Diagrama de Componentes — Sistema Completo

Muestra cómo conviven el navegador, el servidor web, la base de datos y los servicios externos (Stripe, SMTP) y los jobs CLI.

```mermaid
graph TB
    subgraph BROWSER["Navegador (Puerto 5173)"]
        SPA["React SPA<br/>Vite Dev Server"]
    end

    subgraph EXT_STRIPE["Stripe (externo)"]
        STRIPE_CHECKOUT["Stripe Checkout<br/>checkout.stripe.com"]
        STRIPE_API["Stripe API<br/>api.stripe.com"]
    end

    subgraph SMTP["SMTP / mail()"]
        MAIL_RX["Servidor de correo"]
    end

    subgraph APACHE["Apache 2.4 (Puerto 80)"]
        subgraph FRONTEND_BUILD["Estáticos (producción)"]
            DIST["dist/index.html"]
        end
        subgraph API["viaje.api/"]
            HTACCESS[".htaccess<br/>mod_rewrite"]
            ENTRY["index.php<br/>Entry Point"]
            ROUTER["Router"]
            MIDDLEWARE["Middleware JWT + adminOnly"]
            CONTROLLERS["Controllers"]
            HELPERS_BOX["Helpers<br/>JWT · Mailer · Stripe<br/>MaintenanceJobs"]
            MODELS["Models"]
            UPLOADS["uploads/<br/>experiencias/<br/>avatars/"]
        end
    end

    subgraph CRON["CLI / Cron"]
        JOB["jobs/cleanup_pendientes.php"]
    end

    subgraph DB["MySQL 8 (Puerto 3306)"]
        TABLES["tuviaje_db<br/>usuarios · viajes · reservas<br/>ventas · experiencias · favoritos<br/>password_resets · cover_imagenes"]
    end

    SPA -- "HTTP + JWT" --> HTACCESS
    SPA -- "Redirige a Checkout" --> STRIPE_CHECKOUT
    HTACCESS --> ENTRY
    ENTRY --> ROUTER
    ROUTER --> MIDDLEWARE
    MIDDLEWARE -- "Token válido" --> CONTROLLERS
    MIDDLEWARE -- "Token inválido → 401" --> SPA
    CONTROLLERS --> HELPERS_BOX
    CONTROLLERS --> MODELS
    HELPERS_BOX -- "cURL" --> STRIPE_API
    HELPERS_BOX -- "envia email" --> MAIL_RX
    STRIPE_CHECKOUT -- "Webhook POST<br/>firmado HMAC" --> ENTRY
    MODELS -- "PDO" --> TABLES
    TABLES -- "ResultSet" --> MODELS
    MODELS --> CONTROLLERS
    CONTROLLERS -- "JSON Response" --> SPA
    CONTROLLERS -- "Guarda imagen" --> UPLOADS
    JOB -- "Ejecuta cada 15 min" --> HELPERS_BOX
    JOB -- "PDO directo" --> TABLES
```

---

## Diagrama de Componentes — Frontend React

Detalle interno de la SPA: layouts, páginas, servicios y AuthContext.

```mermaid
graph TB
    subgraph ENTRY_FE["Punto de entrada"]
        MAIN["main.tsx"]
        AUTH_PROV["AuthProvider"]
        ROUTER_APP["ApplicationRouter.tsx"]
    end

    subgraph AUTH_CTX["AuthContext"]
        USE_AUTH["useAuth()<br/>user · isAuthenticated · isAdmin<br/>login · register · logout<br/>updateUser · refreshFromToken"]
    end

    subgraph LAYOUTS["Layouts"]
        PUB_LAYOUT["PublicLayout<br/>Nav + Footer"]
        PRIV_LAYOUT["PrivateLayout"]
        ADMIN_LAYOUT["AdminLayout<br/>Sidebar + guard"]
    end

    subgraph PUBLIC_PAGES["Páginas Públicas"]
        HOME["HomePage"]
        DESTINOS["Destinos"]
        DETALLE["ViajeDetalle"]
        EXP["Experiencias"]
        ABOUT["AboutUs"]
        REGISTER["Register"]
        PAGO_OK["PagoExito"]
        PAGO_KO["PagoCancelado"]
    end

    subgraph PRIVATE_PAGES["Páginas Privadas"]
        LOGIN["Login"]
        PERFIL["Perfil"]
        FORGOT["ForgotPassword"]
        RESET["ResetPassword"]
    end

    subgraph ADMIN_PAGES["Páginas Admin"]
        A_RESUMEN["AdminResumen"]
        A_VIAJES["AdminViajes"]
        A_USUARIOS["AdminUsuarios"]
        A_RESERVAS["AdminReservas"]
        A_VENTAS["AdminVentas"]
        A_EXP["AdminExperiencias"]
        A_COVERS["AdminCovers"]
    end

    subgraph COMPONENTS["Componentes Reutilizables"]
        TRAVEL_CARD["TravelCard"]
        TRAVEL_DETAILED["TravelCardDetailed"]
        INFO_CARD["InfoCard"]
        CHAT_FLOAT["ChatFloat"]
    end

    subgraph SERVICES["Services (infrastructure)"]
        AUTH_SVC["auth.service"]
        VIAJES_SVC["viajes.service"]
        RESERVAS_SVC["reservas.service"]
        EXP_SVC["experiencias.service"]
        FAV_SVC["favoritos.service"]
        COVERS_SVC["covers.service"]
        STATS_SVC["stats.service"]
    end

    subgraph HTTP["Cliente HTTP"]
        AXIOS["client.ts<br/>Interceptor JWT<br/>Interceptor 401"]
        LS["localStorage<br/>token"]
    end

    MAIN --> AUTH_PROV
    AUTH_PROV --> ROUTER_APP
    AUTH_PROV -.expone.-> USE_AUTH
    ROUTER_APP --> PUB_LAYOUT
    ROUTER_APP --> PRIV_LAYOUT
    ROUTER_APP --> ADMIN_LAYOUT

    PUB_LAYOUT --> PUBLIC_PAGES
    PRIV_LAYOUT --> PRIVATE_PAGES
    ADMIN_LAYOUT --> ADMIN_PAGES
    ADMIN_LAYOUT -- "verifica isAdmin" --> USE_AUTH

    PUBLIC_PAGES --> COMPONENTS
    PUBLIC_PAGES --> SERVICES
    PRIVATE_PAGES --> SERVICES
    ADMIN_PAGES --> SERVICES
    PRIVATE_PAGES --> USE_AUTH
    PUBLIC_PAGES --> USE_AUTH

    SERVICES --> AXIOS
    AXIOS <--> LS
    AXIOS -- "HTTP Requests" --> BACKEND(["API REST<br/>viaje.api"])
```

---

## Diagrama de Componentes — Backend PHP

Detalle interno: enrutamiento, middleware, controladores, modelos, helpers y jobs CLI.

```mermaid
graph TB
    subgraph REQUEST["Entradas"]
        HTTP_IN["Apache → index.php"]
        CLI_IN["CLI → jobs/cleanup_pendientes.php"]
    end

    subgraph CORE["Core"]
        ROUTER_PHP["Router.php"]
        MW["Middleware.php<br/>auth + adminOnly"]
        REQ["Request.php"]
        RESP["Response.php"]
    end

    subgraph HELPERS["Helpers"]
        JWT_HELPER["JWT.php"]
        MAILER["Mailer.php<br/>SMTP + mail()"]
        STRIPE["Stripe.php<br/>cURL · HMAC"]
        MAINT["MaintenanceJobs.php"]
    end

    subgraph CONFIG["Config"]
        DB_CONF["database.php"]
        JWT_CONF["jwt.php"]
    end

    subgraph CTRL["Controllers"]
        AUTH_CTRL["AuthController"]
        VIAJES_CTRL["ViajesController"]
        RESERVAS_CTRL["ReservasController"]
        EXP_CTRL["ExperienciasController"]
        FAV_CTRL["FavoritosController"]
        STATS_CTRL["StatsController"]
        COVERS_CTRL["CoversController"]
        SWH_CTRL["StripeWebhookController"]
    end

    subgraph CTRL_ADMIN["Controllers (admin)"]
        ADM_V["AdminViajesController"]
        ADM_U["AdminUsuariosController"]
        ADM_VT["AdminVentasController<br/>(incluye refund)"]
        ADM_R["AdminReservasController"]
        ADM_EX["AdminExperienciasController"]
        ADM_C["AdminCoversController"]
        ADM_M["AdminMaintenanceController"]
    end

    subgraph MODELS["Models"]
        USR_M["Usuario"]
        VJE_M["Viaje<br/>JSON_FIELDS"]
        RES_M["Reserva"]
        VTA_M["Venta"]
        EXP_M["Experiencia"]
        FAV_M["Favorito"]
        PR_M["PasswordReset"]
        COV_M["CoverImagen"]
    end

    subgraph EXT["Externos"]
        STRIPE_EXT[("Stripe API")]
        SMTP_EXT[("SMTP / mail()")]
    end

    DATABASE[("MySQL<br/>tuviaje_db")]

    HTTP_IN --> ROUTER_PHP
    ROUTER_PHP --> REQ
    ROUTER_PHP --> MW
    MW --> JWT_HELPER
    JWT_HELPER --> JWT_CONF
    MW -- "Autorizado" --> CTRL
    MW -- "adminOnly" --> CTRL_ADMIN
    MW -- "401 / 403" --> RESP

    CTRL --> MODELS
    CTRL --> RESP
    CTRL --> HELPERS
    CTRL_ADMIN --> MODELS
    CTRL_ADMIN --> RESP
    CTRL_ADMIN --> HELPERS

    STRIPE --> STRIPE_EXT
    MAILER --> SMTP_EXT
    SWH_CTRL --> STRIPE
    RESERVAS_CTRL --> STRIPE
    ADM_VT --> STRIPE
    AUTH_CTRL --> MAILER
    RESERVAS_CTRL --> MAILER

    MAINT --> MODELS
    CLI_IN --> MAINT
    ADM_M --> MAINT

    MODELS --> DB_CONF
    DB_CONF --> DATABASE
    DATABASE --> MODELS
```

---

## Diagrama de Actividades — Registro de Usuario

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario accede a /register]
    B --> C[Completa nombre, email, contraseña]
    C --> D{¿Campos válidos?}
    D -- No --> E[Muestra errores de validación]
    E --> C
    D -- Sí --> F[POST /api/auth/register]
    F --> G{¿Email ya existe?}
    G -- Sí --> H[409 Conflict]
    H --> I[Muestra 'Email ya registrado']
    I --> C
    G -- No --> J[password_hash bcrypt]
    J --> K[Inserta usuario rol = 'usuario']
    K --> L[Mailer::sendBienvenida best-effort]
    L --> M[Genera JWT firmado HS256 exp = JWT_TTL]
    M --> N[Retorna 201 + token + user]
    N --> O[AuthContext.login → guarda token en localStorage]
    O --> P{¿rol = admin?}
    P -- Sí --> Q[Redirige a /admin]
    P -- No --> R[Redirige a /inicio]
    Q --> S([Fin])
    R --> S
```

---

## Diagrama de Actividades — Inicio de Sesión

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario accede a /login]
    B --> C[Ingresa email y contraseña]
    C --> D[POST /api/auth/login]
    D --> E{¿Usuario existe?}
    E -- No --> F[401 Credenciales inválidas]
    F --> G[Muestra error]
    G --> C
    E -- Sí --> H{¿activo = 1?}
    H -- No --> I[401 Cuenta bloqueada]
    I --> J[Muestra 'Cuenta deshabilitada']
    J --> C
    H -- Sí --> K{¿password_verify?}
    K -- No --> F
    K -- Sí --> L[Genera JWT con sub, email, name, rol, iat, exp]
    L --> M[Retorna 200 + token + user]
    M --> N[AuthContext almacena user en memoria y token en localStorage]
    N --> O{¿rol = admin?}
    O -- Sí --> P[Redirige a /admin]
    O -- No --> Q[Redirige a /inicio]
    P --> R([Fin])
    Q --> R
```

---

## Diagrama de Actividades — Pago de Reserva con Stripe

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario en /viaje/:id]
    B --> C[Selecciona personas y clic 'Reservar']
    C --> D{¿Autenticado?}
    D -- No --> E[Redirige a /login]
    E --> B
    D -- Sí --> F[POST /api/reservas con viaje_id y personas]
    F --> G{¿Viaje Activo y cupos suficientes?}
    G -- No --> H[400 / 409]
    H --> I[Muestra error]
    I --> B
    G -- Sí --> J[Crea reserva Pendiente]
    J --> K[Decrementa available_seats atómicamente]
    K --> L[Stripe::createCheckoutSession con metadata reserva_id]
    L --> M[Devuelve URL de checkout]
    M --> N[Frontend redirige a Stripe Checkout]
    N --> O{¿Resultado del pago?}

    O -- Paga OK --> P[Stripe redirige a /pago/exito con session_id]
    P --> Q[Webhook checkout.session.completed]
    Q --> R[Verifica firma HMAC]
    R --> S{¿Ya Confirmada? idempotencia}
    S -- Sí --> T[Skip]
    S -- No --> U[reserva = Confirmada]
    U --> V[Inserta venta Confirmada]
    V --> W[Mailer::sendReservaConfirmacion]
    W --> X[PagoExito polling cada 2s máx 12s]
    X --> Y[Muestra mensaje exitoso]

    O -- Cancela en Stripe --> Z[Stripe redirige a /pago/cancelado]
    Z --> AA[Webhook checkout.session.expired]
    AA --> AB[reserva = Cancelada, libera cupos]
    AB --> AC[PagoCancelado muestra 'Pago cancelado']

    O -- Pago falla --> AD[Webhook async_payment_failed o payment_intent.payment_failed]
    AD --> AB

    Y --> AE([Fin])
    AC --> AE
```

---

## Diagrama de Actividades — Cancelación con Refund Automático

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario en /perfil — Mis reservas]
    B --> C[Clic 'Cancelar' en una reserva]
    C --> D[PATCH /api/reservas/id]
    D --> E{¿Es el dueño?}
    E -- No --> F[403]
    E -- Sí --> G{¿Estado = Confirmada y hay stripe_session_id?}
    G -- No --> H[reserva = Cancelada, libera cupos]
    H --> I[Mailer::sendReservaCancelacion]
    I --> J[Retorna 200]
    G -- Sí --> K[Stripe::retrieveCheckoutSession]
    K --> L[Extrae payment_intent]
    L --> M[Stripe::createRefund]
    M --> N{¿Stripe OK?}
    N -- No --> O[502, no toca BD]
    O --> P[Muestra error al usuario]
    N -- Sí --> Q[Transacción BD]
    Q --> R[reserva = Cancelada]
    R --> S[venta activa = Cancelada]
    S --> T[Libera cupos]
    T --> I
    J --> U([Fin])
    P --> U
    F --> U
```

---

## Diagrama de Actividades — Recuperación de Contraseña

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario en /login clic 'Olvidé contraseña']
    B --> C[/forgot-password ingresa email]
    C --> D[POST /api/auth/forgot-password]
    D --> E{¿Usuario existe?}
    E -- No --> F[Responde 200 genérico anti-enum]
    F --> Z1([Fin sin email])
    E -- Sí --> G[Genera token aleatorio 64 hex]
    G --> H[Guarda SHA-256 del token + expires_at now + 1h]
    H --> I[Mailer::sendPasswordReset con link APP_URL/reset-password/token]
    I --> J[Responde 200]
    J --> K[Usuario abre email]
    K --> L[/reset-password/:token]
    L --> M[Ingresa nueva contraseña]
    M --> N[POST /api/auth/reset-password con token y password]
    N --> O[Backend hashea token y busca en BD]
    O --> P{¿Existe, no usado, no expirado?}
    P -- No --> Q[400 'Token inválido o expirado']
    Q --> R[Muestra error]
    P -- Sí --> S[password_hash y UPDATE usuario]
    S --> T[Marca used_at = now]
    T --> U[Responde 200]
    U --> V[Redirige a /login]
    V --> W([Fin])
    R --> W
```

---

## Diagrama de Actividades — Publicar / Editar una Experiencia

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario en /experiencias]
    B --> C{¿Autenticado?}
    C -- No --> D[Muestra CTA 'Iniciar sesión']
    D --> E[Login]
    E --> B
    C -- Sí --> F[GET /api/auth/reservas → destinos confirmados]
    F --> G{¿Tiene reservas Confirmadas?}
    G -- No --> H[Formulario deshabilitado 'Necesitas haber viajado']
    G -- Sí --> I[Formulario habilitado]

    I --> J[Selecciona destino, rating 1-5, texto 10-500 chars]
    J --> K{¿Adjunta imagen?}
    K -- Sí --> L[Valida tipo y tamaño en cliente]
    L --> M[POST multipart /api/experiencias]
    K -- No --> N[POST JSON /api/experiencias]
    M --> O{¿Backend valida?}
    N --> O
    O -- No --> P[400 + errores]
    P --> I
    O -- Sí --> Q{¿Tiene imagen?}
    Q -- Sí --> R[getimagesize verifica estructura real]
    R --> S[Renombra con uniqid]
    S --> T[Guarda en uploads/experiencias]
    T --> U[INSERT con imagen_url]
    Q -- No --> V[INSERT sin imagen]
    U --> W[201 + datos]
    V --> W
    W --> X[Agrega al feed]

    X --> Y{¿Editar o eliminar?}
    Y -- Editar --> Z[Click Pencil en tarjeta propia]
    Z --> AA[PUT /api/experiencias/id rating y texto]
    AA --> AB[Backend chequea ownership 403 caso contrario]
    AB --> X
    Y -- Eliminar --> AC[Click Trash2 + confirmación]
    AC --> AD[DELETE /api/experiencias/id]
    AD --> AE[Backend chequea ownership]
    AE --> AF[Borra DB + archivo del FS best-effort]
    AF --> AG[Remueve del feed]
    AG --> AH([Fin])
    Y -- Nada --> AH
```

---

## Diagrama de Actividades — Administrador Gestiona Ventas

```mermaid
flowchart TD
    A([Inicio]) --> B[Admin accede a /admin/ventas]
    B --> C[GET /api/admin/ventas/stats + /api/admin/ventas]
    C --> D{¿Token válido y rol = admin?}
    D -- No --> E[401 / 403]
    E --> F[Redirige a /login]
    D -- Sí --> G[Muestra Dashboard]
    G --> H[KPIs: ingresos, confirmadas, pendientes, canceladas]
    H --> I[Gráfico semanal]
    I --> J[Top 5 destinos]
    J --> K[Tabla de ventas]
    K --> L{¿Acción?}
    L -- Filtrar --> M[Filtra por estado o nombre]
    M --> K
    L -- Cambiar estado --> N[PATCH /api/admin/ventas/id/estado]
    N --> O[Recarga stats]
    O --> K
    L -- Refund --> P[Ver flujo 'Refund desde admin']
    L -- Salir --> Q([Fin])
```

---

## Diagrama de Actividades — Administrador Gestiona Viajes

```mermaid
flowchart TD
    A([Inicio]) --> B[Admin accede a /admin/viajes]
    B --> C[GET /api/admin/viajes]
    C --> D[Tabla con búsqueda y filtros]
    D --> E{¿Acción?}

    E -- Crear --> F[Formulario: título, destino, precio, fechas, cupos, descripción, imagen]
    F --> G[Editor JSON: incluidos textarea, galería textarea, garantías add/remove con icono]
    G --> H{¿Datos válidos?}
    H -- No --> I[Errores]
    I --> F
    H -- Sí --> J[POST /api/admin/viajes]
    J --> D

    E -- Editar --> K[Carga datos actuales]
    K --> L[Modifica campos incluyendo JSON fields]
    L --> M[PUT /api/admin/viajes/id]
    M --> D

    E -- Cambiar estado --> N{Estado actual}
    N -- Activo --> O[Cambia a Pausado o Finalizado]
    N -- Pausado --> P[Cambia a Activo o Finalizado]
    N -- Finalizado --> Q[Sin cambios]
    O --> R[PATCH /api/admin/viajes/id/finalizar]
    P --> R
    R --> D

    E -- Eliminar --> S[Confirmación]
    S --> T{¿Confirma?}
    T -- No --> D
    T -- Sí --> U[DELETE /api/admin/viajes/id]
    U --> V{¿Tiene ventas?}
    V -- Sí --> W[409 No se puede eliminar]
    W --> D
    V -- No --> X[Eliminado]
    X --> D

    E -- Salir --> Y([Fin])
```

---

## Diagrama de Actividades — Refund desde el Panel Admin

```mermaid
flowchart TD
    A([Inicio]) --> B[Admin en /admin/ventas]
    B --> C[Ve una venta Confirmada]
    C --> D[Clic botón ámbar 'Reembolsar' RotateCcw]
    D --> E[Modal de confirmación monto + aviso 5-10 días]
    E --> F{¿Confirma?}
    F -- No --> G[Cierra modal]
    G --> H([Fin])
    F -- Sí --> I[POST /api/admin/ventas/id/refund]
    I --> J[AdminVentasController::refund]
    J --> K{¿Venta = Confirmada?}
    K -- No --> L[400]
    L --> M[Muestra error]
    M --> H
    K -- Sí --> N[Reserva::findLastByUsuarioViaje]
    N --> O[Stripe::retrieveCheckoutSession y getPaymentIntent]
    O --> P[Stripe::createRefund]
    P --> Q{¿Stripe OK?}
    Q -- No --> R[502, BD intacta]
    R --> M
    Q -- Sí --> S[Transacción BD]
    S --> T[Cancela venta]
    T --> U[Cancela reserva]
    U --> V[Libera cupos]
    V --> W[Recarga stats]
    W --> X[Toast 'Reembolso procesado']
    X --> H
```

---

## Diagrama de Actividades — Cleanup Automático de Pendientes

```mermaid
flowchart TD
    A([Cron / Task Scheduler]) --> B[php jobs/cleanup_pendientes.php --minutes=30]
    B --> C[MaintenanceJobs::cleanupPendingReservas]
    C --> D[BEGIN TRANSACTION]
    D --> E[SELECT FOR UPDATE reservas Pendiente con created_at < now - N min]
    E --> F{¿Hay reservas?}
    F -- No --> G[COMMIT, log 'procesadas = 0']
    G --> Z([Fin])
    F -- Sí --> H[Para cada reserva]
    H --> I[reserva.estado = Cancelada]
    I --> J[Libera cupos: available_seats += personas]
    J --> K{¿Quedan más?}
    K -- Sí --> H
    K -- No --> L[COMMIT]
    L --> M[Output: procesadas, cutoff_minutes, duracion_ms]
    M --> Z

    subgraph MANUAL[Dispatch manual desde admin]
        N[POST /api/admin/maintenance/cleanup-pendientes]
        N --> C
    end
```

---

*Diagramas actualizados el 15 de mayo de 2026.*
