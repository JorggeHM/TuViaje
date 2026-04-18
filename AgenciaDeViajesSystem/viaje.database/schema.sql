-- ─────────────────────────────────────────────────────────────────────────────
-- TuViaje — Esquema MySQL 8.x
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS tuviaje_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tuviaje_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)    NOT NULL,
  email       VARCHAR(180)    NOT NULL UNIQUE,
  password    VARCHAR(255)    NOT NULL,
  rol         ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
  activo      TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS viajes (
  id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200)    NOT NULL,
  description     TEXT,
  destination     VARCHAR(200)    NOT NULL,
  price           DECIMAL(10,2)   NOT NULL,
  available_seats INT UNSIGNED    NOT NULL DEFAULT 0,
  start_date      DATE            NOT NULL,
  end_date        DATE            NOT NULL,
  duracion_dias   INT UNSIGNED    NOT NULL DEFAULT 0,
  rating          DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
  imagen_url      VARCHAR(500),
  estado          ENUM('Activo','Pausado','Finalizado') NOT NULL DEFAULT 'Activo',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservas (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT UNSIGNED    NOT NULL,
  viaje_id      INT UNSIGNED    NOT NULL,
  fecha_reserva DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado        ENUM('Pendiente','Confirmada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  monto         DECIMAL(10,2)   NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (viaje_id)   REFERENCES viajes(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ventas (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED    NOT NULL,
  viaje_id    INT UNSIGNED    NOT NULL,
  monto       DECIMAL(10,2)   NOT NULL,
  estado      ENUM('Confirmada','Pendiente','Cancelada') NOT NULL DEFAULT 'Confirmada',
  fecha       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (viaje_id)   REFERENCES viajes(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS experiencias (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED    NOT NULL,
  destino     VARCHAR(200)    NOT NULL,
  rating      TINYINT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  texto       TEXT            NOT NULL,
  fecha       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  likes       INT UNSIGNED    NOT NULL DEFAULT 0,
  imagen      VARCHAR(500),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_viajes_estado     ON viajes(estado);
CREATE INDEX idx_ventas_estado     ON ventas(estado);
CREATE INDEX idx_ventas_fecha      ON ventas(fecha);
CREATE INDEX idx_reservas_usuario  ON reservas(usuario_id);
CREATE INDEX idx_experiencias_dest ON experiencias(destino);
