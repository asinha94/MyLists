
use sqlx::{Connection, PgConnection, Row, postgres::PgQueryResult};

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
    pub category_unit: String,
    pub category_consume_verb: String,
    pub title: String,
    pub order_key: String
}


#[derive(sqlx::FromRow)]
pub struct DBCategory {
    pub category_title: String,
    pub category_unit: String,
    pub category_consume_verb: String,
}


#[derive(sqlx::FromRow)]
pub struct DBCredentialUser {
    pub username: String,
    pub password_hash: String,
    pub user_guid: String,
    pub display_name: String
}

#[derive(sqlx::FromRow)]
pub struct DBUIUser {
    pub user_guid: String,
    pub display_name: String
}


pub async fn get_all_users() -> Vec<DBUIUser> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query_as::<_, DBUIUser>("
        SELECT user_guid, display_name FROM site_users")
        .fetch_all(&mut conn)
        .await
        .unwrap()
}


pub async fn get_all_users_credentials() -> Vec<DBCredentialUser> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query_as::<_, DBCredentialUser>("
        SELECT username, password_hash, user_guid, display_name FROM site_users")
        .fetch_all(&mut conn)
        .await
        .unwrap()
}


pub async fn get_all_user_items(user_guid: &String) -> Vec<DBItem> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query_as::<_, DBItem>("
        SELECT i.id, c.category_title, c.category_unit, c.category_consume_verb, i.title, i.order_key
        FROM site_users u 
        JOIN categories c ON u.id = c.user_id
        JOIN items i ON c.id = i.category_id
        WHERE u.user_guid = $1
        ORDER BY i.order_key")
        .bind(user_guid)
        .fetch_all(&mut conn)
        .await
        .unwrap()
}


pub async fn get_all_user_categories(user_guid: &String) -> Vec<DBCategory> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query_as::<_, DBCategory>("
        SELECT c.category_title, c.category_unit, c.category_consume_verb
        FROM site_users u 
        JOIN categories c ON u.id = c.user_id
        WHERE u.user_guid = $1")
        .bind(user_guid)
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
        ON CONFLICT (category_id, title) DO UPDATE
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


pub async fn insert_user(displayname: &String, username: &String, password_hash: &String)
-> Result<DBCredentialUser, sqlx::Error>
 {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query_as::<_, DBCredentialUser>("
        INSERT INTO site_users (display_name, username, password_hash)
        VALUES ($1, $2, $3)
        RETURNING display_name, username, password_hash, user_guid")
        .bind(displayname)
        .bind(username)
        .bind(password_hash)
        .fetch_one(&mut conn)
        .await
}

pub async fn insert_category(username: &String, category_title: &String, category_unit: &String, category_verb: &String)
-> Result<PgQueryResult, sqlx::Error>
 {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        INSERT INTO categories (user_id, category_title, category_unit, category_consume_verb)
        SELECT su.id, $1, $2, $3
        FROM site_users su
        WHERE su.username = $4")
        .bind(category_title)
        .bind(category_unit)
        .bind(category_verb)
        .bind(username)
        .execute(&mut conn)
        .await
}

