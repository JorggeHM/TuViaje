-- ─────────────────────────────────────────────────────────────────────────────
-- TuViaje — Datos de ejemplo
-- Contraseña para todos los usuarios: password123
-- ─────────────────────────────────────────────────────────────────────────────

USE tuviaje_db;

INSERT INTO usuarios (name, email, password, activo) VALUES
  ('Admin TuViaje',  'admin@tuviaje.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
  ('Ana García',     'ana.garcia@mail.com',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
  ('Carlos Méndez',  'carlos.m@mail.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

INSERT INTO viajes (title, description, destination, price, available_seats, start_date, end_date, duracion_dias, rating, imagen_url, estado) VALUES
  ('Cancún Todo Incluido',
   'Disfruta de las playas de arena blanca y el mar turquesa del Caribe mexicano.',
   'Cancún, México', 2450.00, 6, '2026-06-15', '2026-06-22', 7, 4.90,
   'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=800&q=80',
   'Activo'),

  ('Medellín Cultural',
   'La ciudad de la eterna primavera: metro cable, gastronomía y arte urbano.',
   'Medellín, Colombia', 1890.00, 2, '2026-07-03', '2026-07-08', 5, 4.80,
   'https://images.unsplash.com/photo-1597598425329-71b5d8b79754?auto=format&fit=crop&w=800&q=80',
   'Activo'),

  ('La Habana Clásica',
   'Autos vintage, son cubano y la arquitectura colonial mejor conservada del mundo.',
   'La Habana, Cuba', 2200.00, 10, '2026-07-20', '2026-07-26', 6, 4.70,
   'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80',
   'Activo'),

  ('Buenos Aires Completo',
   'Tango, asado, arquitectura europea y los barrios más vibrantes de Sudamérica.',
   'Buenos Aires, Argentina', 3100.00, 14, '2026-08-10', '2026-08-18', 8, 4.60,
   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80',
   'Pausado'),

  ('Cusco Ancestral',
   'Machu Picchu, el Valle Sagrado y la magia de la cultura inca a 3,400 metros.',
   'Cusco, Perú', 2750.00, 12, '2026-09-25', '2026-10-05', 10, 4.85,
   'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80',
   'Activo');

INSERT INTO ventas (usuario_id, viaje_id, monto, estado, fecha) VALUES
  (2, 1, 2450.00, 'Confirmada', '2026-04-01 10:23:00'),
  (3, 2, 1890.00, 'Confirmada', '2026-04-02 09:05:00'),
  (2, 3, 2200.00, 'Pendiente',  '2026-04-03 18:40:00'),
  (3, 5, 2750.00, 'Cancelada',  '2026-04-04 11:00:00');

INSERT INTO experiencias (usuario_id, destino, rating, texto, likes, imagen) VALUES
  (2, 'La Habana, Cuba', 5,
   '¡Este lugar es increíble! La música en cada esquina y la gente tan amable hacen de La Habana un destino único.',
   12, NULL),
  (3, 'Cancún, México', 4,
   'Las playas son exactamente como en las fotos. El agua turquesa y la arena blanca son simplemente perfectas.',
   8, 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=600&q=80');
