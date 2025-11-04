-- Создание таблиц для сайта открытия кейсов GTA 5 RP

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица кейсов
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    rarity VARCHAR(20) DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица предметов в кейсах
CREATE TABLE IF NOT EXISTS case_items (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    rarity VARCHAR(20) DEFAULT 'common',
    drop_chance DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица промокодов (выпавших предметов)
CREATE TABLE IF NOT EXISTS promocodes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    case_id INTEGER REFERENCES cases(id),
    item_id INTEGER REFERENCES case_items(id),
    promo_code VARCHAR(20) UNIQUE NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_promocodes_user_id ON promocodes(user_id);
CREATE INDEX IF NOT EXISTS idx_promocodes_promo_code ON promocodes(promo_code);
CREATE INDEX IF NOT EXISTS idx_case_items_case_id ON case_items(case_id);

-- Добавим тестовые данные
INSERT INTO cases (name, description, price, rarity, image_url) VALUES
('Стартовый кейс', 'Базовый набор предметов для новичков', 100.00, 'common', 'https://via.placeholder.com/300x400/16a34a/ffffff?text=Starter'),
('Премиум кейс', 'Улучшенные предметы и транспорт', 500.00, 'rare', 'https://via.placeholder.com/300x400/eab308/ffffff?text=Premium'),
('VIP кейс', 'Эксклюзивные транспорт и оружие', 1500.00, 'epic', 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=VIP'),
('Легендарный кейс', 'Самые редкие предметы в игре', 5000.00, 'legendary', 'https://via.placeholder.com/300x400/dc2626/ffffff?text=Legendary');

INSERT INTO case_items (case_id, name, description, rarity, drop_chance) VALUES
(1, 'Пистолет', 'Базовое оружие для защиты', 'common', 40.00),
(1, 'Аптечка', 'Восстанавливает здоровье', 'common', 35.00),
(1, 'Велосипед', 'Простое средство передвижения', 'rare', 20.00),
(1, 'Бронежилет', 'Легкая защита', 'rare', 5.00),
(2, 'Автомат', 'Мощное автоматическое оружие', 'rare', 30.00),
(2, 'Мотоцикл', 'Быстрый транспорт', 'rare', 25.00),
(2, 'Спорткар', 'Стильный автомобиль', 'epic', 15.00),
(2, 'Снайперская винтовка', 'Дальнобойное оружие', 'epic', 10.00),
(3, 'Суперкар', 'Роскошный быстрый автомобиль', 'epic', 25.00),
(3, 'Вертолет', 'Воздушный транспорт', 'epic', 20.00),
(3, 'Золотой пистолет', 'Эксклюзивное оружие', 'legendary', 10.00),
(3, 'Дом у моря', 'Элитная недвижимость', 'legendary', 5.00),
(4, 'Частный самолет', 'Роскошный воздушный транспорт', 'legendary', 15.00),
(4, 'Яхта', 'Плавучий дворец', 'legendary', 12.00),
(4, 'Особняк в центре', 'Самая престижная недвижимость', 'legendary', 8.00),
(4, 'Коллекция суперкаров', 'Гараж из 5 суперкаров', 'legendary', 5.00);

INSERT INTO users (username, password_hash, email, balance, is_admin) VALUES
('admin', '$2a$10$rQ8K9Z2G3z0xH1Y4V5W6TeN8X7M9P1Q2R3S4T5U6V7W8X9Y0Z1A2B', 'admin@gta5rp.com', 10000.00, TRUE);
