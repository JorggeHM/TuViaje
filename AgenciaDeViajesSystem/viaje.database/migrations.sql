-- ─────────────────────────────────────────────────────────────────────────────
-- TuViaje — Migraciones consolidadas
-- Uso: mysql -u root -p < migrations.sql
--
-- Este archivo solo es necesario para bases de datos que se instalaron antes
-- de incorporar estos cambios al schema.sql. En instalaciones nuevas, basta
-- con ejecutar install.sql (que ya aplica el schema completo).
--
-- Notas:
--   * Los bloques CREATE TABLE usan IF NOT EXISTS y son seguros de reejecutar.
--   * Los bloques ALTER TABLE ADD COLUMN NO son idempotentes en MySQL: si la
--     columna ya existe, MySQL devolverá un error y puedes saltar ese bloque.
-- ─────────────────────────────────────────────────────────────────────────────

USE tuviaje_db;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) usuarios.rol — distinción admin / usuario
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE usuarios
  ADD COLUMN rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario'
  AFTER password;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) reservas.personas — cantidad de viajeros por reserva
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE reservas
  ADD COLUMN personas INT UNSIGNED NOT NULL DEFAULT 1
  AFTER monto;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) password_resets — flujo de recuperación de contraseña
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED    NOT NULL,
  token_hash  CHAR(64)        NOT NULL,
  expires_at  DATETIME        NOT NULL,
  used_at     DATETIME        NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_token_hash (token_hash),
  KEY idx_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) favoritos — relación usuario ↔ viaje marcado
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoritos (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED    NOT NULL,
  viaje_id    INT UNSIGNED    NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_favorito (usuario_id, viaje_id),
  KEY idx_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (viaje_id)   REFERENCES viajes(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) experiencias.visible — moderación admin sin eliminar registros
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE experiencias
  ADD COLUMN visible TINYINT(1) NOT NULL DEFAULT 1
  AFTER imagen;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) reservas.stripe_session_id — vínculo con pagos Stripe
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE reservas
  ADD COLUMN stripe_session_id VARCHAR(255) NULL
  AFTER personas;

CREATE INDEX idx_reservas_stripe ON reservas(stripe_session_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7) cover_imagenes — galería gestionable del hero público
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cover_imagenes (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  url         VARCHAR(500)    NOT NULL,
  orden       INT UNSIGNED    NOT NULL DEFAULT 0,
  visible     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cover_visible (visible),
  KEY idx_cover_orden   (orden)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8) viajes.incluidos / galeria / garantias — contenido editable por viaje
--    (reemplaza arrays hardcodeados que vivían en ViajeDetalle.tsx)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE viajes
  ADD COLUMN incluidos JSON NULL AFTER imagen_url,
  ADD COLUMN galeria   JSON NULL AFTER incluidos,
  ADD COLUMN garantias JSON NULL AFTER galeria;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9) usuarios.avatar_url — foto de perfil opcional subida por el usuario
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE usuarios
  ADD COLUMN avatar_url VARCHAR(500) NULL
  AFTER rol;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10) viajes.max_personas — máximo de viajeros por reserva (configurable por admin)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE viajes
  ADD COLUMN max_personas INT UNSIGNED NOT NULL DEFAULT 2
  AFTER available_seats;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11) reservas.estado — cambiar default de 'Pendiente' a 'Confirmada'
--     Las reservas ahora se crean automáticamente confirmadas al hacer la compra
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE reservas
  MODIFY COLUMN estado ENUM('Pendiente','Confirmada','Cancelada') NOT NULL DEFAULT 'Confirmada';

-- ─────────────────────────────────────────────────────────────────────────────
-- 12) ventas — agregar personas y stripe_session_id para consolidar reservas
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE ventas
  ADD COLUMN personas INT UNSIGNED NOT NULL DEFAULT 1 AFTER estado,
  ADD COLUMN stripe_session_id VARCHAR(255) NULL AFTER personas;

-- Crear índice para stripe_session_id en ventas
CREATE INDEX idx_ventas_stripe ON ventas(stripe_session_id);
