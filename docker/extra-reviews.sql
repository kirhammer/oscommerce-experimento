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

-- Reseñas extra en el producto 1 para que su listado supere el tamaño de
-- página (6, como MAX_DISPLAY_NEW_REVIEWS del legado) y se pueda ver la
-- paginación funcionando.
INSERT INTO reviews VALUES (105, 1, NULL, 'María Gómez', 5, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (105, 1, 'Running three monitors for trading and it handles them flawlessly.');

INSERT INTO reviews VALUES (106, 1, NULL, 'Pedro Salazar', 4, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (106, 1, 'Great 2D image quality. 3D performance is average but that is not what I bought it for.');

INSERT INTO reviews VALUES (107, 1, NULL, 'Laura Ortiz', 5, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (107, 1, 'The multi-monitor support saved my CAD workflow. Setup took minutes.');

INSERT INTO reviews VALUES (108, 1, NULL, 'Diego Castro', 4, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (108, 1, 'Stable drivers and clean output on all four heads. A bit pricey but worth it.');

INSERT INTO reviews VALUES (109, 1, NULL, 'Sofía Reyes', 5, now(), NULL, 1, 0);
INSERT INTO reviews_description VALUES (109, 1, 'Exactly what a financial desk needs: four displays, one slot, zero fuss.');
