#[path = "../sql.rs"]
mod sql;

use std::fs;
use std::collections::HashMap;
use sqlx::{Connection, PgConnection, Row, postgres::PgRow};
use tokio;


const CATEGORIES_PATH: &str = "src/utils/categories.csv";
const ITEMS_PATH: &str = "src/utils/items.csv";

struct DBColumn {
    category: String,
}

async fn insert_categories() {
    let err_string = format!("Failed to read {CATEGORIES_PATH}");
    let f = fs::read_to_string(CATEGORIES_PATH).expect(&err_string);
    
    let connuri = sql::get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    for line in f.lines() {
        let qry = "
        INSERT INTO categories (category_title) VALUES ($1)
        ON CONFLICT DO NOTHING";
        sqlx::query(qry)
            .bind(line)
            .execute(&mut conn)
            .await
            .unwrap();
    }

}


async fn insert_items() {
    let mut categories = HashMap::new();

    let connuri = sql::get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();
    
    let qry = sqlx::query("SELECT category_title from categories");
    let categories_rows: Vec<DBColumn> = qry.map(|row: PgRow| DBColumn {
        category: row.get("category_title"),
    })
    .fetch_all(&mut conn).await.unwrap();

    for category in categories_rows {
        let vecs: Vec<String> = Vec::new();
        categories.insert(category.category, vecs);
    }

    let err_string = format!("Failed to read {ITEMS_PATH}");
    let f = fs::read_to_string(ITEMS_PATH).expect(&err_string);



    for line in f.lines() {
        let qry = "
        INSERT INTO items (title, ordering_key) VALUES ($1, $2)
        ON CONFLICT DO NOTHING";
        sqlx::query(qry)
            .bind(line)
            .execute(&mut conn)
            .await
            .unwrap();
    }
    
    


    


}

#[tokio::main]
async fn main() {
    insert_categories().await;
    insert_items().await;
}