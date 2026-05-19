# 🌍 TuViaje — ¿Qué hace este programa?

> Una guía en palabras simples para entender todo el sistema.

---

## 🗂️ ¿Qué es TuViaje?

Es una **agencia de viajes en internet**. Los usuarios pueden:
- Ver viajes disponibles
- Pagar y hacer una reserva
- Contar su experiencia después de viajar
- Guardar sus viajes favoritos

También hay un panel de **administrador** para manejar todo el negocio.

---

## 👥 ¿Quiénes pueden usar el sistema?

| Tipo de usuario | ¿Qué puede hacer? |
|---|---|
| **Cualquier visitante** | Ver viajes y experiencias de otros |
| **Usuario registrado** | Reservar, pagar, guardar favoritos, escribir reseñas |
| **Administrador** | Controlar todo: viajes, usuarios, ventas, reservas |

---

## 🔑 Cuenta y acceso

### Registrarse
- El usuario pone su nombre, correo y contraseña.
- Recibe un **correo de bienvenida**.
- La contraseña nunca se guarda tal cual — se cifra (protección extra).

### Iniciar sesión
- El sistema le da al usuario un **token** (como una llave digital).
- Esa llave se usa en todas sus acciones para demostrar quién es.
- La llave expira en 1 hora (configurable).

### Olvidé mi contraseña
1. El usuario pone su correo en `/forgot-password`.
2. Recibe un email con un link único que dura **1 hora**.
3. Entra al link y pone la nueva contraseña.
4. El link queda inutilizable después de usarse.

### Editar perfil
- El usuario puede cambiar su nombre y correo.
- Puede cambiar su contraseña (necesita poner la actual primero).
- Puede subir o borrar una **foto de perfil**.

---

## ✈️ Viajes

### Ver el catálogo
- Cualquiera puede ver la lista de viajes disponibles.
- Cada viaje tiene: título, destino, precio, fechas, cupos, galería de fotos, qué incluye y garantías.

### Ver el detalle de un viaje
- Al hacer clic en un viaje se ven todos sus detalles.
- Se puede ver cuántos lugares quedan disponibles.

---

## 💳 Reservas y pagos

### Hacer una reserva
1. El usuario elige cuántas personas viajan.
2. El sistema **bloquea los cupos** inmediatamente (para que nadie más los tome).
3. Lo manda a la página de pago de **Stripe** (plataforma segura de pagos).
4. El usuario paga con tarjeta.
5. Stripe le avisa al sistema que el pago fue exitoso.
6. La reserva queda como **Confirmada** y el usuario recibe un correo.

> ⚠️ Si el usuario se va sin pagar, los cupos se liberan automáticamente después de un tiempo.

### Ver mis reservas
- El usuario puede ver todas sus reservas desde su perfil.

### Cancelar una reserva
- Si la reserva ya fue **pagada**, el sistema hace el **reembolso automático** en Stripe.
- Si todavía estaba pendiente, simplemente se cancela.
- Los cupos se devuelven al viaje.

---

## ❤️ Favoritos

- El usuario puede marcar viajes con un corazón para guardarlos.
- Puede ver su lista de favoritos en su perfil.
- Puede quitarlos cuando quiera.

---

## 📖 Experiencias (reseñas)

### ¿Quién puede escribir una?
- Solo usuarios que ya hicieron y **pagaron** un viaje.

### ¿Qué incluye?
- Destino del viaje
- Calificación de 1 a 5 estrellas
- Texto (entre 10 y 500 caracteres)
- Foto opcional (jpg, png o webp, máximo 5 MB)

### Editar o borrar
- Solo el autor puede editar o borrar su experiencia.
- El administrador también puede borrarlas.

### Likes
- Cualquier usuario registrado puede darle "me gusta" a una experiencia.

---

## 🖼️ Imágenes del header (Covers)

- Son las fotos grandes que aparecen en la portada del sitio.
- El administrador decide cuáles se muestran y en qué orden.

---

## 📊 Estadísticas públicas

- En la portada aparecen números como: viajes realizados, viajeros totales, ciudades visitadas y satisfacción general.
- Cualquier persona puede verlos (no necesita cuenta).

---

## 💬 Chat de soporte (ChatFloat)

- Hay un botón flotante de chat en la esquina de la pantalla.
- Al escribir un mensaje, se envía a un **bot de n8n** que responde automáticamente.
- Sirve para resolver dudas sin hablar con una persona.

---

## 🛠️ Panel de Administrador

El admin tiene acceso a un menú especial con estas secciones:

### 📋 Resumen (Dashboard)
- Ve los ingresos totales, los destinos más vendidos y un gráfico de ventas semanales.

### ✈️ Gestionar Viajes
- Crear un viaje nuevo (con precio, fechas, cupos, fotos, qué incluye, etc.)
- Editar cualquier viaje existente.
- Pausar, finalizar o eliminar viajes.
- ⚠️ No se puede eliminar un viaje si ya tiene ventas registradas.

### 👤 Gestionar Usuarios
- Ver la lista de todos los usuarios.
- Bloquear o activar una cuenta.
- Eliminar usuarios.

### 📑 Gestionar Reservas
- Ver todas las reservas del sistema (filtrables).
- Cambiar el estado de una reserva manualmente.
- Eliminar reservas.

### 💰 Gestionar Ventas
- Ver todas las ventas con filtros.
- Cambiar el estado de una venta.
- **Hacer un reembolso manual** desde el panel (el dinero regresa al usuario por Stripe en 5–10 días).

### ✏️ Moderar Experiencias
- Ver todas las reseñas, incluyendo las que están ocultas.
- Ocultar o mostrar una reseña.
- Eliminar reseñas inapropiadas.

### 🖼️ Gestionar Covers
- Agregar, ocultar o eliminar imágenes del header de la página.
- Controlar el orden en que aparecen.

### 🔧 Mantenimiento
- Hay una tarea automática que **cancela reservas que llevan mucho tiempo sin pagar** y libera los cupos.
- Se puede correr desde el panel o programarla para que corra sola cada 15 minutos.

---

## 📧 Correos automáticos que envía el sistema

| Evento | ¿Qué recibe el usuario? |
|---|---|
| Registro | Bienvenida |
| Reserva confirmada | Confirmación con detalles del viaje |
| Reserva cancelada | Aviso de cancelación |
| Olvidé mi contraseña | Link para restablecer contraseña |

> Si no hay servidor de correo configurado, el sistema intenta enviarlo igual con el correo básico del servidor. Si falla, la acción (registro, pago, etc.) se completa de todas formas.

---

## 🔒 ¿Cómo protege el sistema los datos?

- Las contraseñas se guardan **cifradas** (nunca en texto plano).
- Los pagos los procesa **Stripe** (el sistema nunca toca datos de tarjetas).
- El link de recuperación de contraseña **expira en 1 hora** y solo funciona una vez.
- Las imágenes subidas se validan: solo ciertos formatos y máximo 5 MB.
- Los tokens de sesión expiran para que nadie pueda usarlos indefinidamente.

---

## 🗄️ ¿Qué guarda la base de datos?

| Tabla | ¿Qué guarda? |
|---|---|
| `usuarios` | Cuentas registradas |
| `viajes` | El catálogo de viajes |
| `reservas` | Cada reserva hecha |
| `ventas` | Registro de pagos |
| `experiencias` | Las reseñas de los viajeros |
| `favoritos` | Los viajes guardados por cada usuario |
| `cover_imagenes` | Las fotos del header |
| `password_resets` | Los links de recuperación de contraseña |

---

*Guía simplificada de TuViaje — mayo 2026*
