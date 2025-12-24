-- Таблица районов
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица магазинов
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    photo_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица записей цен
CREATE TABLE price_records (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    store_id INTEGER NOT NULL REFERENCES stores(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    price DECIMAL(10, 2) NOT NULL,
    comment TEXT,
    photo_url TEXT,
    operator_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_price_records_date ON price_records(date);
CREATE INDEX idx_price_records_store ON price_records(store_id);
CREATE INDEX idx_price_records_product ON price_records(product_id);
CREATE INDEX idx_stores_district ON stores(district);
CREATE INDEX idx_products_category ON products(category);

-- Вставка начальных данных для районов
INSERT INTO districts (name) VALUES 
    ('Новотроицкое (центр)'),
    ('Северный район'),
    ('Западный район'),
    ('Южный район');

-- Вставка начальных данных для магазинов
INSERT INTO stores (name, district, address) VALUES 
    ('Магнит', 'Новотроицкое (центр)', 'ул. Ленина, 15'),
    ('Пятёрочка', 'Новотроицкое (центр)', 'ул. Центральная, 32'),
    ('Перекрёсток', 'Новотроицкое (центр)', 'пр. Мира, 8'),
    ('Лента', 'Северный район', 'ул. Северная, 45'),
    ('Дикси', 'Северный район', 'ул. Комсомольская, 12'),
    ('Магнит', 'Западный район', 'ул. Западная, 23'),
    ('Монетка', 'Западный район', 'ул. Победы, 67'),
    ('Пятёрочка', 'Южный район', 'ул. Южная, 18'),
    ('Верный', 'Южный район', 'пр. Ленина, 91');

-- Вставка начальных данных для товаров
INSERT INTO products (name, category, min_price, max_price, photo_required) VALUES 
    ('Молоко 3.2%', 'Молочные продукты', 65.00, 85.00, FALSE),
    ('Хлеб белый', 'Хлеб и выпечка', 35.00, 50.00, TRUE),
    ('Куриная грудка', 'Мясо и птица', 280.00, 350.00, FALSE),
    ('Яйца куриные, 10 шт.', 'Яйца', 85.00, 110.00, FALSE),
    ('Сахар, 1 кг', 'Бакалея', 55.00, 75.00, FALSE),
    ('Масло подсолнечное', 'Масло', 120.00, 150.00, FALSE),
    ('Гречка, 1 кг', 'Бакалея', 80.00, 120.00, FALSE),
    ('Картофель, 1 кг', 'Овощи', 25.00, 45.00, FALSE);
