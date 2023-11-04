
CREATE TABLE Categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at timestamp DEFAULT NOW(),
    category_title TEXT NOT NULL,
    link TEXT,
    primary key(id)
);


CREATE TABLE Items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT,
    title TEXT NOT NULL,
    order_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);