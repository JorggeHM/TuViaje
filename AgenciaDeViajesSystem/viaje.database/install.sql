-- ─────────────────────────────────────────────────────────────────────────────
-- TuViaje — Instalación completa
-- Uso: mysql -u root -p < install.sql
-- ─────────────────────────────────────────────────────────────────────────────

SOURCE schema.sql;
SOURCE seed.sql;

SELECT 'Instalacion completada exitosamente.' AS resultado;
SELECT COUNT(*) AS total_viajes FROM tuviaje_db.viajes;
SELECT COUNT(*) AS total_usuarios FROM tuviaje_db.usuarios;
