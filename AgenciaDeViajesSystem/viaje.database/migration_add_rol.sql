-- Agrega columna rol a usuarios existentes
ALTER TABLE usuarios
  ADD COLUMN rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario'
  AFTER password;
