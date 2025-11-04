-- Создание таблицы маркетплейса для торговли между игроками

CREATE TABLE IF NOT EXISTS marketplace (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) NOT NULL,
    promo_id INTEGER REFERENCES promocodes(id) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_rarity VARCHAR(20) NOT NULL,
    item_description TEXT,
    is_sold BOOLEAN DEFAULT FALSE,
    buyer_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_is_sold ON marketplace(is_sold);
CREATE INDEX IF NOT EXISTS idx_marketplace_rarity ON marketplace(item_rarity);
