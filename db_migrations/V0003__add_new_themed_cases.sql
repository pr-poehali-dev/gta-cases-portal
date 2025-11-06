-- Добавление новых разнообразных кейсов
INSERT INTO t_p36789279_gta_cases_portal.cases (name, description, price, rarity, image_url) VALUES 
('Киберпанк 2077', 'Футуристическое оружие и транспорт из будущего', 2500.00, 'epic', 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Cyberpunk'),
('Мафия', 'Классическое оружие и автомобили преступного мира', 1200.00, 'rare', 'https://via.placeholder.com/300x400/eab308/ffffff?text=Mafia'),
('Военный арсенал', 'Тактическое снаряжение и боевая техника', 3000.00, 'legendary', 'https://via.placeholder.com/300x400/dc2626/ffffff?text=Military'),
('Уличные гонки', 'Тюнингованные спорткары и мотоциклы', 800.00, 'rare', 'https://via.placeholder.com/300x400/eab308/ffffff?text=Street+Racing'),
('Дикий Запад', 'Револьверы, лошади и ковбойские шляпы', 600.00, 'rare', 'https://via.placeholder.com/300x400/eab308/ffffff?text=Wild+West'),
('Зомби Апокалипсис', 'Оружие для выживания в зомби-мире', 1800.00, 'epic', 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Zombie'),
('Космический рейдер', 'Инопланетное оружие и космические корабли', 4000.00, 'legendary', 'https://via.placeholder.com/300x400/dc2626/ffffff?text=Space'),
('Подводный мир', 'Гарпуны, акваланги и подводные скутеры', 900.00, 'rare', 'https://via.placeholder.com/300x400/eab308/ffffff?text=Underwater');

-- Добавление предметов для новых кейсов
-- Киберпанк 2077 (case_id будет 6)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(6, 'Неоновый байк', 'Светящийся мотоцикл из будущего', 'legendary', 5, 'https://via.placeholder.com/200/dc2626/ffffff?text=Neon+Bike'),
(6, 'Лазерный пистолет', 'Энергетическое оружие', 'epic', 15, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Laser'),
(6, 'Киберкостюм', 'Защитный костюм с чипами', 'rare', 30, 'https://via.placeholder.com/200/eab308/ffffff?text=Cyber+Suit'),
(6, 'Голограмма', 'Голографический проектор', 'common', 50, 'https://via.placeholder.com/200/6b7280/ffffff?text=Hologram');

-- Мафия (case_id будет 7)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(7, 'Томпсон', 'Легендарный пулемёт гангстеров', 'legendary', 5, 'https://via.placeholder.com/200/dc2626/ffffff?text=Thompson'),
(7, 'Cadillac 1950', 'Классический автомобиль босса', 'epic', 12, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Cadillac'),
(7, 'Костюм мафиози', 'Элегантный костюм-тройка', 'rare', 28, 'https://via.placeholder.com/200/eab308/ffffff?text=Suit'),
(7, 'Сигара', 'Кубинская сигара', 'common', 55, 'https://via.placeholder.com/200/6b7280/ffffff?text=Cigar');

-- Военный арсенал (case_id будет 8)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(8, 'Танк Abrams', 'Тяжёлый боевой танк', 'legendary', 3, 'https://via.placeholder.com/200/dc2626/ffffff?text=Tank'),
(8, 'Штурмовая винтовка', 'Автоматическое оружие M4A1', 'epic', 10, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=M4A1'),
(8, 'Бронежилет', 'Тактический бронежилет', 'rare', 27, 'https://via.placeholder.com/200/eab308/ffffff?text=Armor'),
(8, 'Полевой рацион', 'Военный паёк', 'common', 60, 'https://via.placeholder.com/200/6b7280/ffffff?text=Ration');

-- Уличные гонки (case_id будет 9)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(9, 'Nissan Skyline GT-R', 'Легендарный японский спорткар', 'legendary', 7, 'https://via.placeholder.com/200/dc2626/ffffff?text=Skyline'),
(9, 'Toyota Supra', 'Тюнингованная Supra', 'epic', 13, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Supra'),
(9, 'Набор обвесов', 'Тюнинг кит для автомобиля', 'rare', 30, 'https://via.placeholder.com/200/eab308/ffffff?text=Body+Kit'),
(9, 'Неоновая подсветка', 'RGB подсветка днища', 'common', 50, 'https://via.placeholder.com/200/6b7280/ffffff?text=Neon');

-- Дикий Запад (case_id будет 10)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(10, 'Золотой Кольт', 'Позолоченный револьвер', 'legendary', 6, 'https://via.placeholder.com/200/dc2626/ffffff?text=Golden+Colt'),
(10, 'Мустанг', 'Дикая лошадь прерий', 'epic', 14, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Mustang'),
(10, 'Ковбойская шляпа', 'Кожаная шляпа с пером', 'rare', 30, 'https://via.placeholder.com/200/eab308/ffffff?text=Cowboy+Hat'),
(10, 'Лассо', 'Верёвка для поимки скота', 'common', 50, 'https://via.placeholder.com/200/6b7280/ffffff?text=Lasso');

-- Зомби Апокалипсис (case_id будет 11)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(11, 'Огнемёт', 'Оружие против орд зомби', 'legendary', 5, 'https://via.placeholder.com/200/dc2626/ffffff?text=Flamethrower'),
(11, 'Бронированный джип', 'Защищённый транспорт', 'epic', 12, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Armored+Jeep'),
(11, 'Биозащитный костюм', 'Костюм от заражения', 'rare', 28, 'https://via.placeholder.com/200/eab308/ffffff?text=Hazmat'),
(11, 'Аптечка', 'Набор первой помощи', 'common', 55, 'https://via.placeholder.com/200/6b7280/ffffff?text=Medkit');

-- Космический рейдер (case_id будет 12)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(12, 'Звёздный истребитель', 'Космический боевой корабль', 'legendary', 4, 'https://via.placeholder.com/200/dc2626/ffffff?text=Starfighter'),
(12, 'Плазменная пушка', 'Инопланетное оружие', 'epic', 11, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Plasma+Gun'),
(12, 'Скафандр', 'Космический костюм', 'rare', 30, 'https://via.placeholder.com/200/eab308/ffffff?text=Spacesuit'),
(12, 'Энергетический щит', 'Силовое поле', 'common', 55, 'https://via.placeholder.com/200/6b7280/ffffff?text=Shield');

-- Подводный мир (case_id будет 13)
INSERT INTO t_p36789279_gta_cases_portal.case_items (case_id, name, description, rarity, drop_chance, image_url) VALUES
(13, 'Подводная лодка', 'Персональная субмарина', 'legendary', 6, 'https://via.placeholder.com/200/dc2626/ffffff?text=Submarine'),
(13, 'Гарпунная пушка', 'Подводное оружие', 'epic', 14, 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Harpoon'),
(13, 'Гидрокостюм', 'Неопреновый костюм', 'rare', 30, 'https://via.placeholder.com/200/eab308/ffffff?text=Wetsuit'),
(13, 'Акваланг', 'Дыхательный аппарат', 'common', 50, 'https://via.placeholder.com/200/6b7280/ffffff?text=Scuba');