
use sqlx::{Connection, PgConnection};


const USER: &str = "asinha";
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