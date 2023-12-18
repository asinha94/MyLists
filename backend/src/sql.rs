
use sqlx::{Connection, PgConnection, postgres::PgQueryResult, postgres::PgRow};

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


pub async fn update_item_order(username: &String, id: i32, order_key: &String)
-> Result<PgQueryResult, sqlx::Error> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        UPDATE items i
        SET order_key = $1
        FROM categories c, site_users s
        WHERE i.id = $2
        AND c.id = i.category_id
        AND s.id = c.user_id
        AND s.username = $3")
        .bind(order_key)
        .bind(id)
        .bind(username)
        .execute(&mut conn)
        .await
}


pub async fn insert_item(username: &String, category: &String, title: &String, order_key: &String)
 -> Result<PgRow, sqlx::Error> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        INSERT INTO items (category_id, title, order_key)
        SELECT c.id, $1, $2 FROM categories c
        JOIN site_users s on s.id = c.user_id
        WHERE c.category_title = $3
        AND s.username = $4
        ON CONFLICT (category_id, title) DO UPDATE
        SET order_key = $2
        RETURNING id")
        .bind(title)
        .bind(order_key)
        .bind(category)
        .bind(username)
        .fetch_one(&mut conn)
        .await

        //row.get::<i32, _>("id")
}


pub async fn update_item_title(username: &String, id: i32, title: &String)
-> Result<PgQueryResult, sqlx::Error> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        UPDATE items i
        SET title = $1
        FROM categories c, site_users s
        WHERE i.id = $2
        AND c.id = i.category_id
        AND s.id = c.user_id
        AND s.username = $2")
        .bind(title)
        .bind(id)
        .bind(username)
        .execute(&mut conn)
        .await
}


pub async fn delete_item(username: &String, id: i32)
-> Result<PgQueryResult, sqlx::Error> {
    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    sqlx::query("
        DELETE FROM items i
        USING categories c, site_users s
        WHERE i.id = $1
        AND c.id = i.category_id
        AND s.id = c.user_id
        AND s.username = $2
        
        ")
        .bind(id)
        .bind(username)
        .execute(&mut conn)
        .await
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

