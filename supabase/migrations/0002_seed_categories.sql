-- =====================================================================
-- SEED: Categorías por defecto del himnario
-- =====================================================================

insert into public.categories (name, slug, description, icon, color, display_order) values
  ('Adoración', 'adoracion', 'Himnos de adoración profunda al Señor', 'Heart', '#162548', 1),
  ('Alabanza', 'alabanza', 'Cánticos de alabanza y júbilo', 'Music', '#d4a017', 2),
  ('Evangelización', 'evangelizacion', 'Himnos para compartir el evangelio', 'Megaphone', '#2a477c', 3),
  ('Consagración', 'consagracion', 'Himnos de entrega y consagración a Dios', 'Flame', '#8e5b14', 4),
  ('Santa Cena', 'santa-cena', 'Himnos para la Cena del Señor', 'Wine', '#754817', 5),
  ('Bautismo', 'bautismo', 'Himnos para el servicio de bautismo', 'Droplet', '#385c97', 6),
  ('Coro General', 'coro-general', 'Repertorio del coro general', 'Users', '#1f3661', 7),
  ('Coro de Niños', 'coro-de-ninos', 'Cánticos para los más pequeños', 'Smile', '#e5b832', 8),
  ('Jóvenes', 'jovenes', 'Himnos y coritos para jóvenes', 'Sparkles', '#5478b0', 9),
  ('Segunda Venida', 'segunda-venida', 'Himnos sobre la esperanza del regreso de Cristo', 'CloudSun', '#162548', 10),
  ('Navidad', 'navidad', 'Himnos navideños', 'TreePine', '#b27c12', 11),
  ('Himnos Tradicionales', 'himnos-tradicionales', 'El himnario clásico de siempre', 'BookOpen', '#0d1730', 12)
on conflict (slug) do nothing;
