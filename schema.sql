
CREATE USER web WITH PASSWORD 'password' CREATEDB;
GRANT ALL ON ALL TABLES IN SCHEMA public to web;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public to web;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public to web;


CREATE TABLE categories (
    id SERIAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category_title TEXT NOT NULL,
    CONSTRAINT categories_pk PRIMARY KEY(id),
    CONSTRAINT categories_category_title_uk UNIQUE (category_title)
);


CREATE TABLE items (
    id SERIAL NOT NULL,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    order_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT items_pk PRIMARY KEY(id),
    CONSTRAINT items_categories_fk FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT items_title_uk UNIQUE (title)
);