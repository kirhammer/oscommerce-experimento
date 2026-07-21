-- Reseñas de muestra adicionales para el pre-experimento: el seed original
-- de osCommerce trae una sola reseña (producto 19), lo que deja el contador
-- de reseñas de R2 casi siempre en cero. Ids desde 101 para no chocar con
-- datos creados desde la tienda. Cada reseña lleva su fila de descripción en
-- el idioma 1 (inglés), igual que las consultas legadas esperan.

INSERT INTO reviews VALUES (101, 1, NULL, 'Ana Torres', 5, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (101, 1, 'Excellent card for multi-monitor setups. The dual-head output worked out of the box and image quality is impressive for the price.');

INSERT INTO reviews VALUES (102, 1, NULL, 'Carlos Mejía', 4, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (102, 1, 'Solid performer. Drivers took a while to configure but once running it has been rock stable.');

INSERT INTO reviews VALUES (103, 3, NULL, 'Lucía Fernández', 5, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (103, 1, 'Best mouse I have owned. The optical sensor tracks perfectly and it is very comfortable for long sessions.');

INSERT INTO reviews VALUES (104, 26, NULL, 'Jorge Ramírez', 3, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (104, 1, 'Good mouse overall, though the side buttons feel a bit stiff. Works fine without extra drivers.');
