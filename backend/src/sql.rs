
use sqlx::{Connection, PgConnection, Row};

const USER: &str = "web";
const PASSWORD: &str = "password";
const DBNAME: &str = "website";
const HOST: &str = "localhost";



pub fn get_postgres_connect_uri() -> String {
    format!("postgres://{USER}:{PASSWORD}@{HOST}/{DBNAME}")
}


#[derive(sqlx::FromRow)]
pub struct DBItem {
    pub id: i32,
    pub category_title: String,
    pub title: String,
    pub order_key: String
}


pub async fn get_all_items() -> Vec<DBItem> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query_as::<_, DBItem>("
        SELECT i.id, c.category_title, i.title, i.order_key
        FROM items i
        JOIN categories c ON c.id = i.category_id
        ORDER BY i.order_key")
        .fetch_all(&mut conn)
        .await
        .unwrap()
}

pub async fn update_item_order(id: i32, order_key: &String) {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        UPDATE items
        SET order_key = $1
        WHERE id = $2")
        .bind(order_key)
        .bind(id)
        .execute(&mut conn)
        .await
        .unwrap();
}


pub async fn insert_item(category: &String, title: &String, order_key: &String) -> i32 {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    let row = sqlx::query("
        INSERT INTO items (category_id, title, order_key)
        SELECT id, $1, $2 FROM categories
        WHERE category_title = $3
        ON CONFLICT (title) DO UPDATE
        SET order_key = $4
        RETURNING id")
        .bind(title)
        .bind(order_key)
        .bind(category)
        .bind(order_key)
        .fetch_one(&mut conn)
        .await
        .unwrap();

        row.get::<i32, _>("id")
}


pub async fn update_item_title(id: i32, title: &String) {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        UPDATE items
        SET title = $1
        WHERE id = $2")
        .bind(title)
        .bind(id)
        .execute(&mut conn)
        .await
        .unwrap();
}


pub async fn delete_item(id: i32) {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        DELETE FROM items
        WHERE id = $1")
        .bind(id)
        .execute(&mut conn)
        .await
        .unwrap();
}


pub async fn insert_user(username: &String, password_hash: &String) {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        INSERT INTO site_users (username, password_hash)
        VALUES ($1, $2)")
        .bind(username)
        .bind(password_hash)
        .execute(&mut conn)
        .await
        .unwrap();
}