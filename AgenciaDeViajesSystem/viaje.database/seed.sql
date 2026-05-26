
-- PASS para todos los usuarios: password123


USE tuviaje_db;

INSERT INTO usuarios (name, email, password, rol, activo) VALUES
  ('Admin TuViaje',    'admin@tuviaje.com',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',   1),
  ('Ana García',       'ana.garcia@mail.com',     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 1),
  ('Carlos Méndez',    'carlos.m@mail.com',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 1),
  ('Lucía Fernández',  'lucia.fdz@mail.com',      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 1),
  ('Diego Ramírez',    'diego.ramirez@mail.com',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 1),
  ('Sofía Torres',     'sofia.torres@mail.com',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 1),
  ('Mateo Rojas',      'mateo.rojas@mail.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 0),
  ('Valentina López',  'vale.lopez@mail.com',     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 1);

INSERT INTO viajes (title, description, destination, price, available_seats, start_date, end_date, duracion_dias, rating, imagen_url, incluidos, galeria, garantias, estado) VALUES
  ('Cancún Todo Incluido',
   'Disfruta de las playas de arena blanca y el mar turquesa del Caribe mexicano con resort all-inclusive frente al mar.',
   'Cancún, México', 2450.00, 6, '2026-06-15', '2026-06-22', 7, 4.90,
   'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelo ida y vuelta','Hotel 5 estrellas all-inclusive','Traslados aeropuerto','Tour a Isla Mujeres','Snorkel en arrecife'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Cancelación gratis hasta 30 días antes','Seguro de viaje incluido','Asistencia 24/7 en español'),
   'Activo'),

  ('Medellín Cultural',
   'La ciudad de la eterna primavera: metro cable, comuna 13, gastronomía paisa y arte urbano.',
   'Medellín, Colombia', 1890.00, 2, '2026-07-03', '2026-07-08', 5, 4.80,
   'https://images.unsplash.com/photo-1597598425329-71b5d8b79754?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel boutique en El Poblado','Tour Comuna 13 con guía local','Cata de café','Cena gastronómica'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Guías certificados','Transporte privado','Reembolso por mal tiempo'),
   'Activo'),

  ('La Habana Clásica',
   'Autos vintage, son cubano y la arquitectura colonial mejor conservada del Caribe.',
   'La Habana, Cuba', 2200.00, 10, '2026-07-20', '2026-07-26', 6, 4.70,
   'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Casa particular en Habana Vieja','Paseo en auto clásico','Noche en Tropicana','Tour de mojitos'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1571913196363-09c4f4be3c1d?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Visa turística gestionada','Soporte en español','Cambio de fechas sin costo'),
   'Activo'),

  ('Buenos Aires Completo',
   'Tango, asado, arquitectura europea y los barrios más vibrantes de Sudamérica.',
   'Buenos Aires, Argentina', 3100.00, 14, '2026-08-10', '2026-08-18', 8, 4.60,
   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel 4 estrellas en Palermo','Show de tango con cena','Asado en estancia','Tour por Recoleta y La Boca'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1612294037637-ec1c6a78f51c?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Asistencia 24/7','Seguro médico','Traslados privados'),
   'Pausado'),

  ('Cusco Ancestral',
   'Machu Picchu, el Valle Sagrado y la magia de la cultura inca a 3,400 metros.',
   'Cusco, Perú', 2750.00, 12, '2026-09-25', '2026-10-05', 10, 4.85,
   'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel en centro histórico','Boleto Machu Picchu','Tren Vistadome','Guía profesional bilingüe'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Kit de aclimatación a la altura','Oxígeno disponible','Asistencia médica en ruta'),
   'Activo'),

  ('Roma Imperial',
   'Coliseo, Vaticano, Foro Romano y la mejor pasta del mundo en cada esquina.',
   'Roma, Italia', 4200.00, 8, '2026-10-12', '2026-10-20', 8, 4.92,
   'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel 4 estrellas cerca del Vaticano','Entradas sin fila a Coliseo y Vaticano','Tour gastronómico en Trastevere','Excursión a Pompeya'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Seguro Schengen incluido','Wifi portátil','Soporte en español 24/7'),
   'Activo'),

  ('Tokio Tradición y Futuro',
   'Templos milenarios, neones de Shibuya, sushi en Tsukiji y el monte Fuji.',
   'Tokio, Japón', 4500.00, 4, '2026-11-05', '2026-11-15', 10, 4.95,
   'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel céntrico en Shinjuku','JR Pass 7 días','Excursión al Monte Fuji','Cena kaiseki tradicional'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Pocket wifi','Guía hispanohablante','Tarjeta Suica precargada'),
   'Activo'),

  ('París Romántico',
   'Torre Eiffel, Montmartre, Louvre y crucero por el Sena al atardecer.',
   'París, Francia', 3800.00, 10, '2026-12-01', '2026-12-08', 7, 4.78,
   'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel en el centro','Entradas Louvre y Versalles','Crucero por el Sena','Cena en restaurante con vista a la Torre Eiffel'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Seguro Schengen','Traslados privados','Wifi portátil'),
   'Activo'),

  ('Río de Janeiro Carnaval',
   'Cristo Redentor, Pan de Azúcar, Copacabana y la energía única del carnaval brasileño.',
   'Río de Janeiro, Brasil', 2980.00, 16, '2027-02-08', '2027-02-15', 7, 4.65,
   'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel frente a Copacabana','Entrada Sambódromo','City tour completo','Caipirinha class'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1544989164-22cf9b1b9ee9?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Seguro de viaje','Asistencia 24/7','Traslados nocturnos seguros'),
   'Activo'),

  ('Santorini Romance',
   'Casas blancas sobre el Egeo, atardeceres en Oia y vino volcánico.',
   'Santorini, Grecia', 3650.00, 6, '2026-09-10', '2026-09-17', 7, 4.88,
   'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel boutique con piscina infinita','Crucero en catamarán','Cata de vinos','Cena en Oia al atardecer'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Seguro Schengen','Habitación con vista garantizada','Cancelación flexible'),
   'Activo'),

  ('Bali Tropical',
   'Templos hindúes, terrazas de arroz en Ubud, playas de Seminyak y spa balinés.',
   'Bali, Indonesia', 3200.00, 0, '2026-05-01', '2026-05-10', 9, 4.45,
   'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Villa privada con piscina','Tour Tanah Lot y Uluwatu','Día de spa','Excursión Monte Batur al amanecer'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Visa on arrival gestionada','Conductor privado','Asistencia médica'),
   'Finalizado'),

  ('Patagonia Aventura',
   'Torres del Paine, glaciar Perito Moreno y trekkings entre los paisajes más imponentes del planeta.',
   'El Calafate, Argentina', 3450.00, 8, '2026-11-20', '2026-11-29', 9, 4.83,
   'https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=800&q=80',
   JSON_ARRAY('Vuelos','Hotel con vista al glaciar','Excursión Perito Moreno','Mini-trekking sobre el hielo','Tour Torres del Paine'),
   JSON_ARRAY(
     'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
     'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=800&q=80'
   ),
   JSON_ARRAY('Equipo de trekking incluido','Guías de montaña certificados','Seguro de aventura'),
   'Activo');

-- COVER_IMAGENES — hero del público
INSERT INTO cover_imagenes (url, orden, visible) VALUES
  ('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', 1, 1),
  ('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80', 2, 1),
  ('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80', 3, 1),
  ('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80', 4, 1),
  ('https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=80', 5, 0);

INSERT INTO reservas (usuario_id, viaje_id, fecha_reserva, estado, monto, personas, stripe_session_id) VALUES
  (2, 1, '2026-04-01 10:23:00', 'Confirmada', 4900.00,  2, 'cs_test_a1b2c3d4e5f6'),
  (3, 2, '2026-04-02 09:05:00', 'Confirmada', 1890.00,  1, 'cs_test_g7h8i9j0k1l2'),
  (4, 5, '2026-04-10 14:32:00', 'Pendiente',  5500.00,  2,  NULL),
  (5, 6, '2026-04-15 11:48:00', 'Confirmada', 4200.00,  1, 'cs_test_m3n4o5p6q7r8'),
  (6, 7, '2026-04-18 16:20:00', 'Confirmada', 9000.00,  2, 'cs_test_s9t0u1v2w3x4'),
  (8, 9, '2026-04-22 19:11:00', 'Confirmada', 8940.00,  3, 'cs_test_y5z6a7b8c9d0'),
  (4, 3, '2026-04-25 08:47:00', 'Cancelada', 2200.00,  1,  NULL),
  (3, 12, '2026-04-28 12:09:00', 'Pendiente',  6900.00,  2,  NULL);

INSERT INTO ventas (usuario_id, viaje_id, monto, estado, fecha) VALUES
  (2, 1,  2450.00, 'Confirmada', '2026-01-08 10:23:00'),
  (3, 2,  1890.00, 'Confirmada', '2026-01-22 09:05:00'),
  (4, 3,  2200.00, 'Confirmada', '2026-02-05 18:40:00'),
  (5, 5,  2750.00, 'Cancelada',  '2026-02-14 11:00:00'),
  (2, 6,  4200.00, 'Confirmada', '2026-02-28 13:15:00'),
  (6, 7,  4500.00, 'Confirmada', '2026-03-04 09:42:00'),
  (3, 8,  3800.00, 'Pendiente',  '2026-03-11 17:30:00'),
  (8, 9,  2980.00, 'Confirmada', '2026-03-18 10:08:00'),
  (4, 10, 3650.00, 'Confirmada', '2026-03-25 14:55:00'),
  (5, 11, 3200.00, 'Cancelada',  '2026-04-02 16:18:00'),
  (6, 12, 3450.00, 'Confirmada', '2026-04-09 11:33:00'),
  (8, 1,  4900.00, 'Confirmada', '2026-04-15 12:00:00'),
  (3, 5,  5500.00, 'Pendiente',  '2026-04-22 09:25:00'),
  (4, 6,  4200.00, 'Confirmada', '2026-04-29 15:47:00'),
  (5, 7,  9000.00, 'Confirmada', '2026-05-06 18:10:00');

-- EXPERIENCIAS — mezcla de ratings, con/sin imagen, algunas ocultas
INSERT INTO experiencias (usuario_id, destino, rating, texto, fecha, likes, imagen, visible) VALUES
  (2, 'La Habana, Cuba', 5,
   '¡Este lugar es increíble! La música en cada esquina y la gente tan amable hacen de La Habana un destino único.',
   '2026-03-12 10:30:00', 12, NULL, 1),

  (3, 'Cancún, México', 4,
   'Las playas son exactamente como en las fotos. El agua turquesa y la arena blanca son simplemente perfectas.',
   '2026-03-20 16:15:00', 8,
   'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=600&q=80', 1),

  (4, 'Cusco, Perú', 5,
   'Machu Picchu superó todas mis expectativas. El equipo se encargó de todo, solo tuve que disfrutar.',
   '2026-03-28 09:48:00', 22,
   'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&q=80', 1),

  (5, 'Roma, Italia', 5,
   'Sin filas en el Coliseo y en el Vaticano. La guía fue fantástica, llena de historias que no encuentras en Google.',
   '2026-04-02 11:22:00', 17, NULL, 1),

  (6, 'Tokio, Japón', 5,
   'El JR Pass nos salvó la vida. Tokio es organizado, limpio, y comer sushi en Tsukiji al amanecer no tiene precio.',
   '2026-04-08 19:40:00', 31,
   'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80', 1),

  (8, 'Buenos Aires, Argentina', 4,
   'El asado en la estancia fue espectacular. Solo recomendaría más tiempo libre para Palermo.',
   '2026-04-14 14:05:00', 9, NULL, 1),

  (3, 'Medellín, Colombia', 4,
   'La Comuna 13 con guía local cambió mi perspectiva por completo. Súper recomendable.',
   '2026-04-19 17:30:00', 14, NULL, 1),

  (4, 'París, Francia', 3,
   'Hermoso pero muy concurrido en diciembre. El crucero por el Sena de noche fue lo mejor.',
   '2026-04-23 20:12:00', 5,
   'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', 1),

  (5, 'Bali, Indonesia', 5,
   'Las terrazas de Ubud y el spa balinés son una experiencia que volvería a repetir mil veces.',
   '2026-04-29 08:55:00', 19,
   'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', 1),

  (6, 'Santorini, Grecia', 2,
   'El hotel no estaba como en las fotos. Servicio al cliente lento.',
   '2026-05-03 21:18:00', 1, NULL, 0);

-- FAVORITOS — usuarios que marcaron viajes
INSERT INTO favoritos (usuario_id, viaje_id, created_at) VALUES
  (2, 1,  '2026-03-10 09:00:00'),
  (2, 6,  '2026-03-12 10:30:00'),
  (2, 7,  '2026-03-15 14:20:00'),
  (3, 2,  '2026-03-18 16:45:00'),
  (3, 10, '2026-03-22 11:10:00'),
  (4, 5,  '2026-03-25 19:33:00'),
  (4, 12, '2026-04-01 08:05:00'),
  (5, 6,  '2026-04-05 13:48:00'),
  (6, 7,  '2026-04-10 17:22:00'),
  (8, 9,  '2026-04-15 20:00:00');
