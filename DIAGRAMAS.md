# TuViaje — Diagramas del Sistema

> Todos los diagramas usan sintaxis **Mermaid**. Se renderizan automáticamente en GitHub, GitLab, Obsidian, Notion y la extensión "Markdown Preview Mermaid Support" de VS Code.

---

## Tabla de Contenidos

- [Modelo Entidad-Relación](#modelo-entidad-relación)
- [Diagrama de Componentes — Sistema Completo](#diagrama-de-componentes--sistema-completo)
- [Diagrama de Componentes — Frontend React](#diagrama-de-componentes--frontend-react)
- [Diagrama de Componentes — Backend PHP](#diagrama-de-componentes--backend-php)
- [Diagrama de Actividades — Registro de Usuario](#diagrama-de-actividades--registro-de-usuario)
- [Diagrama de Actividades — Inicio de Sesión](#diagrama-de-actividades--inicio-de-sesión)
- [Diagrama de Actividades — Hacer una Reserva](#diagrama-de-actividades--hacer-una-reserva)
- [Diagrama de Actividades — Publicar una Experiencia](#diagrama-de-actividades--publicar-una-experiencia)
- [Diagrama de Actividades — Administrador Gestiona Ventas](#diagrama-de-actividades--administrador-gestiona-ventas)
- [Diagrama de Actividades — Administrador Gestiona Viajes](#diagrama-de-actividades--administrador-gestiona-viajes)

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
        tinyint     activo
        datetime    created_at
    }

    VIAJES {
        int         id          PK
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
        enum        estado
        datetime    created_at
    }

    RESERVAS {
        int         id          PK
        int         usuario_id  FK
        int         viaje_id    FK
        datetime    fecha_reserva
        enum        estado
        decimal     monto
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
    }

    USUARIOS ||--o{ RESERVAS       : "realiza"
    USUARIOS ||--o{ VENTAS         : "genera"
    USUARIOS ||--o{ EXPERIENCIAS   : "publica"
    VIAJES   ||--o{ RESERVAS       : "tiene"
    VIAJES   ||--o{ VENTAS         : "origina"
```

---

## Diagrama de Componentes — Sistema Completo

Muestra cómo se comunican las tres capas principales: navegador, servidor web y base de datos.

```mermaid
graph TB
    subgraph BROWSER["🌐 Navegador (Puerto 5173)"]
        SPA["React SPA<br/>(Vite Dev Server)"]
    end

    subgraph APACHE["🖥️ Apache 2.4 (Puerto 80)"]
        subgraph FRONTEND_BUILD["Archivos estáticos (producción)"]
            DIST["dist/index.html"]
        end
        subgraph API["viaje.api/"]
            HTACCESS[".htaccess<br/>(mod_rewrite)"]
            ENTRY["index.php<br/>(Entry Point)"]
            ROUTER["Router"]
            MIDDLEWARE["Middleware JWT"]
            CONTROLLERS["Controllers"]
            MODELS["Models"]
            UPLOADS["uploads/<br/>experiencias/"]
        end
    end

    subgraph DB["🗄️ MySQL 8 (Puerto 3306)"]
        TABLES["tuviaje_db<br/>usuarios · viajes<br/>reservas · ventas<br/>experiencias"]
    end

    SPA -- "HTTP + JWT<br/>Authorization: Bearer" --> HTACCESS
    HTACCESS --> ENTRY
    ENTRY --> ROUTER
    ROUTER --> MIDDLEWARE
    MIDDLEWARE -- "Token válido" --> CONTROLLERS
    MIDDLEWARE -- "Token inválido → 401" --> SPA
    CONTROLLERS --> MODELS
    MODELS -- "PDO / Prepared Statements" --> TABLES
    CONTROLLERS -- "Guardar imagen" --> UPLOADS
    UPLOADS -- "URL absoluta" --> CONTROLLERS
    TABLES -- "ResultSet" --> MODELS
    MODELS --> CONTROLLERS
    CONTROLLERS -- "JSON Response" --> SPA
```

---

## Diagrama de Componentes — Frontend React

Detalle interno de la SPA: capas, páginas y servicios.

```mermaid
graph TB
    subgraph ENTRY["Punto de entrada"]
        MAIN["main.tsx"]
        ROUTER_APP["ApplicationRouter.tsx"]
    end

    subgraph LAYOUTS["Layouts"]
        PUB_LAYOUT["PublicLayout<br/>(Nav + Footer)"]
        PRIV_LAYOUT["PrivateLayout"]
        ADMIN_LAYOUT["AdminLayout<br/>(Sidebar)"]
    end

    subgraph PUBLIC_PAGES["Páginas Públicas"]
        INICIO["Inicio"]
        DESTINOS["Destinos"]
        DETALLE["ViajeDetalle"]
        EXP["Experiencias"]
        ABOUT["AboutUs"]
        REGISTER["Register"]
    end

    subgraph PRIVATE_PAGES["Páginas Privadas"]
        LOGIN["Login"]
        PERFIL["Perfil"]
    end

    subgraph ADMIN_PAGES["Páginas Admin"]
        A_RESUMEN["AdminResumen"]
        A_VIAJES["AdminViajes"]
        A_USUARIOS["AdminUsuarios"]
        A_VENTAS["AdminVentas"]
    end

    subgraph COMPONENTS["Componentes Reutilizables"]
        TRAVEL_CARD["TravelCard"]
        INFO_CARD["InfoCard"]
        CHAT_FLOAT["ChatFloat"]
    end

    subgraph SERVICES["Services (infrastructure)"]
        AUTH_SVC["auth.service.ts"]
        VIAJES_SVC["viajes.service.ts"]
        RESERVAS_SVC["reservas.service.ts"]
    end

    subgraph HTTP["Cliente HTTP"]
        AXIOS["client.ts (Axios)<br/>Interceptor JWT<br/>Interceptor 401"]
        LS["localStorage<br/>(token)"]
    end

    MAIN --> ROUTER_APP
    ROUTER_APP --> PUB_LAYOUT
    ROUTER_APP --> PRIV_LAYOUT
    ROUTER_APP --> ADMIN_LAYOUT

    PUB_LAYOUT --> PUBLIC_PAGES
    PRIV_LAYOUT --> PRIVATE_PAGES
    ADMIN_LAYOUT --> ADMIN_PAGES

    PUBLIC_PAGES --> COMPONENTS
    PUBLIC_PAGES --> SERVICES
    PRIVATE_PAGES --> SERVICES
    ADMIN_PAGES --> SERVICES

    SERVICES --> AXIOS
    AXIOS <--> LS
    AXIOS -- "HTTP Requests" --> BACKEND(["API REST<br/>viaje.api"])
```

---

## Diagrama de Componentes — Backend PHP

Detalle interno del backend: enrutamiento, middleware, controladores y modelos.

```mermaid
graph TB
    subgraph REQUEST["HTTP Request"]
        HTTP_IN["Apache → index.php"]
    end

    subgraph CORE["Core"]
        ROUTER_PHP["Router.php<br/>(mapea rutas → handlers)"]
        MW["Middleware.php<br/>(valida JWT)"]
        REQ["Request.php<br/>(parsea body, headers, params)"]
        RESP["Response.php<br/>(json(), error(), created())"]
    end

    subgraph HELPERS["Helpers"]
        JWT_HELPER["JWT.php<br/>(encode / decode)"]
    end

    subgraph CONFIG["Config"]
        DB_CONF["database.php<br/>(Singleton PDO)"]
        JWT_CONF["jwt.php<br/>(SECRET, TTL, ALG)"]
    end

    subgraph CTRL["Controllers"]
        AUTH_CTRL["AuthController<br/>(login, register, me, perfil)"]
        VIAJES_CTRL["ViajesController<br/>(listActivos, findById)"]
        RESERVAS_CTRL["ReservasController<br/>(store, cancel)"]
        EXP_CTRL["ExperienciasController<br/>(index, store, like)"]
        ADM_V["AdminViajesController<br/>(CRUD viajes)"]
        ADM_U["AdminUsuariosController<br/>(lista, toggle, delete)"]
        ADM_VT["AdminVentasController<br/>(lista, stats, estado)"]
    end

    subgraph MODELS["Models"]
        USR_M["Usuario.php"]
        VJE_M["Viaje.php"]
        RES_M["Reserva.php"]
        VTA_M["Venta.php"]
        EXP_M["Experiencia.php"]
    end

    DATABASE[("MySQL<br/>tuviaje_db")]

    HTTP_IN --> ROUTER_PHP
    ROUTER_PHP --> REQ
    ROUTER_PHP --> MW
    MW --> JWT_HELPER
    JWT_HELPER --> JWT_CONF
    MW -- "Autorizado" --> CTRL
    MW -- "401 Unauthorized" --> RESP

    CTRL --> MODELS
    CTRL --> RESP
    MODELS --> DB_CONF
    DB_CONF --> DATABASE
    DATABASE --> MODELS
```

---

## Diagrama de Actividades — Registro de Usuario

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario accede a /register]
    B --> C[Completa formulario\nNombre · Email · Contraseña]
    C --> D{¿Campos válidos?}
    D -- No --> E[Muestra errores de validación]
    E --> C
    D -- Sí --> F[POST /api/auth/register]
    F --> G{¿Email ya existe?}
    G -- Sí --> H[Retorna 409 Conflict]
    H --> I[Muestra 'Email ya registrado']
    I --> C
    G -- No --> J[Hashea contraseña con bcrypt]
    J --> K[Inserta usuario en BD\nrol = 'usuario']
    K --> L[Genera JWT firmado\nexp = 1 hora]
    L --> M[Retorna 201 + token]
    M --> N[Frontend guarda token\nen localStorage]
    N --> O{¿rol = 'admin'?}
    O -- Sí --> P[Redirige a /admin]
    O -- No --> Q[Redirige a /inicio]
    P --> R([Fin])
    Q --> R
```

---

## Diagrama de Actividades — Inicio de Sesión

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario accede a /login]
    B --> C[Ingresa email y contraseña]
    C --> D[POST /api/auth/login]
    D --> E{¿Usuario existe?}
    E -- No --> F[Retorna 401\nCredenciales inválidas]
    F --> G[Muestra mensaje de error]
    G --> C
    E -- Sí --> H{¿Usuario activo?}
    H -- No --> I[Retorna 401\nCuenta bloqueada]
    I --> J[Muestra 'Cuenta deshabilitada']
    J --> C
    H -- Sí --> K{¿password_verify\ncorrecto?}
    K -- No --> F
    K -- Sí --> L[Genera JWT\nsub · email · name · rol · exp]
    L --> M[Retorna 200 + token + datos]
    M --> N[Frontend guarda token\nen localStorage]
    N --> O{¿rol = 'admin'?}
    O -- Sí --> P[Redirige a /admin]
    O -- No --> Q[Redirige a /inicio]
    P --> R([Fin])
    Q --> R
```

---

## Diagrama de Actividades — Hacer una Reserva

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario navega a /destinos]
    B --> C[GET /api/viajes\nCarga lista de viajes activos]
    C --> D[Hace clic en un viaje]
    D --> E[Navega a /viaje/detalle\ncon datos del viaje]
    E --> F[Selecciona cantidad de personas]
    F --> G[Sistema calcula total\nprecio × personas]
    G --> H[Hace clic en 'Reservar']
    H --> I{¿Está autenticado?}
    I -- No --> J[Redirige a /login]
    J --> K[Inicia sesión]
    K --> E
    I -- Sí --> L[Muestra modal de confirmación\nResumen: viaje · personas · total]
    L --> M{¿Confirma reserva?}
    M -- No --> N[Cierra modal]
    N --> F
    M -- Sí --> O[POST /api/reservas\nviaje_id · personas]
    O --> P{¿Viaje activo y\ncon cupos suficientes?}
    P -- No --> Q[Retorna 400 / 409]
    Q --> R[Muestra error al usuario]
    R --> B
    P -- Sí --> S[Crea registro en reservas\nestado = Pendiente]
    S --> T[Crea registro en ventas\nestado = Confirmada]
    T --> U[Decrementa available_seats\nen viajes]
    U --> V[Retorna 201\nDatos de reserva y venta]
    V --> W[Muestra confirmación exitosa]
    W --> X([Fin])
```

---

## Diagrama de Actividades — Publicar una Experiencia

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario accede a /experiencias]
    B --> C{¿Está autenticado?}
    C -- No --> D[Muestra botón 'Iniciar sesión'\npara publicar]
    D --> E[Usuario inicia sesión]
    E --> B
    C -- Sí --> F[GET /api/auth/reservas\nCarga destinos de reservas confirmadas]
    F --> G{¿Tiene reservas confirmadas?}
    G -- No --> H[Muestra formulario deshabilitado\n'Necesitas haber viajado']
    G -- Sí --> I[Muestra formulario de publicación]
    I --> J[Selecciona destino del viaje]
    J --> K[Califica con estrellas 1-5]
    K --> L[Escribe texto de experiencia\nmín 10 · máx 500 caracteres]
    L --> M{¿Adjunta imagen?}
    M -- Sí --> N[Selecciona imagen\njpg · png · webp · máx 5MB]
    N --> O{¿Imagen válida?}
    O -- No --> P[Muestra error de validación]
    P --> N
    O -- Sí --> Q[POST multipart/form-data\na /api/experiencias]
    M -- No --> R[POST JSON\na /api/experiencias]
    Q --> S{¿Datos válidos\nen backend?}
    R --> S
    S -- No --> T[Retorna 400 + mensajes]
    T --> U[Muestra errores]
    U --> I
    S -- Sí --> V{¿Tiene imagen?}
    V -- Sí --> W[Valida estructura real\ncon getimagesize]
    W --> X[Genera nombre único\nuniqid con extensión]
    X --> Y[Guarda en uploads/experiencias/]
    Y --> Z[Construye URL absoluta]
    Z --> AA[Inserta en BD con imagen_url]
    V -- No --> AB[Inserta en BD sin imagen]
    AA --> AC[Retorna 201 + datos experiencia]
    AB --> AC
    AC --> AD[Agrega al inicio del feed]
    AD --> AE([Fin])
```

---

## Diagrama de Actividades — Administrador Gestiona Ventas

```mermaid
flowchart TD
    A([Inicio]) --> B[Admin accede a /admin/ventas]
    B --> C[GET /api/admin/ventas/stats\nGET /api/admin/ventas]
    C --> D{¿Token válido\ny rol = admin?}
    D -- No --> E[Retorna 401 / 403]
    E --> F[Redirige a /login]
    D -- Sí --> G[Muestra Dashboard]
    G --> H[Visualiza KPIs:\nIngresos · Confirmadas · Pendientes · Canceladas]
    H --> I[Visualiza gráfico\nde ventas por semana]
    I --> J[Visualiza Top 5 destinos]
    J --> K[Visualiza tabla de ventas]
    K --> L{¿Aplica filtro?}
    L -- Sí --> M[Filtra por estado\no busca por nombre]
    M --> K
    L -- No --> N{¿Cambia estado de venta?}
    N -- No --> O([Fin])
    N -- Sí --> P{¿Estado actual?}
    P -- Pendiente --> Q[Puede cambiar a:\nConfirmada o Cancelada]
    P -- Confirmada --> R[Puede cambiar a:\nCancelada]
    P -- Cancelada --> S[Sin acciones disponibles]
    Q --> T[PATCH /api/admin/ventas/id/estado]
    R --> T
    T --> U{¿Actualización exitosa?}
    U -- No --> V[Muestra error]
    V --> K
    U -- Sí --> W[Actualiza estado en tabla]
    W --> X[Recarga estadísticas]
    X --> K
```

---

## Diagrama de Actividades — Administrador Gestiona Viajes

```mermaid
flowchart TD
    A([Inicio]) --> B[Admin accede a /admin/viajes]
    B --> C[GET /api/admin/viajes\nCarga lista completa con conteo de ventas]
    C --> D[Muestra tabla de viajes]
    D --> E{¿Qué acción elige?}

    E -- Crear --> F[Abre formulario de nuevo viaje]
    F --> G[Completa: título · destino · precio\nfechas · cupos · descripción · imagen]
    G --> H{¿Datos válidos?}
    H -- No --> I[Muestra errores]
    I --> G
    H -- Sí --> J[POST /api/admin/viajes]
    J --> K[Viaje creado con estado Activo]
    K --> D

    E -- Editar --> L[Abre formulario con datos actuales]
    L --> M[Modifica campos deseados]
    M --> N[PUT /api/admin/viajes/id]
    N --> O[Viaje actualizado]
    O --> D

    E -- Cambiar estado --> P{Estado actual}
    P -- Activo --> Q[Puede cambiar a\nPausado o Finalizado]
    P -- Pausado --> R[Puede cambiar a\nActivo o Finalizado]
    P -- Finalizado --> S[Sin cambios disponibles]
    Q --> T[PATCH /api/admin/viajes/id/finalizar]
    R --> T
    T --> D

    E -- Eliminar --> U[Muestra confirmación]
    U --> V{¿Confirma?}
    V -- No --> D
    V -- Sí --> W[DELETE /api/admin/viajes/id]
    W --> X{¿Viaje tiene ventas?}
    X -- Sí --> Y[Retorna 409\nNo se puede eliminar]
    Y --> Z[Muestra advertencia]
    Z --> D
    X -- No --> AA[Viaje eliminado]
    AA --> D

    E -- Salir --> AB([Fin])
```
