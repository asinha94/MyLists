
mod sql;

use std::collections::HashMap;
use actix_web::{get, App, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json;
use sql::get_postgres_connect_uri;
use sqlx::{Connection, PgConnection};

const HOST: &str = "127.0.0.1";
const PORT: u16 = 8000;

#[derive(Serialize, Deserialize)]
#[derive(sqlx::FromRow)]
struct DBItem {
    id: i32,
    category_title: String,
    title: String,
    order_key: String
}

#[derive(Serialize, Deserialize)]
struct UIItem {
    id: String,
    content: String,
    order_key: String,
}

impl UIItem {
    fn new(item: &DBItem) -> UIItem {
        UIItem {
            id: item.id.to_string(),
            content: item.title.clone(),
            order_key: item.order_key.clone(),
        }
    }
}


#[derive(Serialize, Deserialize)]
struct Column {
    id: String,
    title: String,
    items: Vec<UIItem>
}

#[get("/data")]
async fn get_sql_categories() -> impl Responder {

    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    let items = sqlx::query_as::<_, DBItem>("
        SELECT i.id, c.category_title, i.title, i.order_key
        FROM items i
        JOIN categories c ON c.id = i.category_id
        ORDER BY i.order_key")
        .fetch_all(&mut conn)
        .await
        .unwrap();

    let mut data = HashMap::new();

    for item in items {
        // Lookup or insert
        let category_list = data.entry(item.category_title.clone())
            .or_insert(Column {
                id: item.category_title.clone(),
                title: item.category_title.clone(),
                items: Vec::new(),
            });

        category_list.items.push(UIItem::new(&item));
    }
    
    serde_json::to_string(&data).unwrap()
}


#[actix_web::main]
async fn main() -> std::io::Result<()>{

    HttpServer::new(|| {
        App::new()
        //.service(get_initial_data)
        .service(get_sql_categories)
        .wrap(Cors::permissive())
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
