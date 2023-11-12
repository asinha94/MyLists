
mod sql;

use std::collections::HashMap;
use actix_web::{get, App, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json;
use sql::get_postgres_connect_uri;
use sqlx::{Connection, PgConnection, Row, postgres::PgRow};

const HOST: &str = "127.0.0.1";
const PORT: u16 = 8000;


#[derive(Serialize, Deserialize)]
struct ListItem {
    id: String,
    content: String,
    order_key: String,
}

impl ListItem {
    fn new(id: u64, content: &str, order_key: &str) -> ListItem {
        ListItem {
            id: id.to_string(),
            content: String::from(content),
            order_key: String::from(order_key)
        }
    }
}


#[derive(Serialize, Deserialize)]
struct Column {
    id: String,
    title: String,
    items: Vec<ListItem>
}


#[derive(Serialize, Deserialize)]
struct DBColumn {
    category: String,
}

#[get("/categories")]
async fn get_sql_categories() -> impl Responder {

    let connuri = get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    let qry = sqlx::query("SELECT category_title from categories");
    let rows = qry.map(|row: PgRow| DBColumn {
        category: row.get("category_title"),
    })
    .fetch_all(&mut conn).await.unwrap();
        
    serde_json::to_string(&rows).unwrap()
}


#[get("/data")]
async fn get_initial_data() -> impl Responder {
    let mut data = HashMap::new();

    let movies = Column {
        id: String::from("column1"),
        title: String::from("Movies"),
        items: vec![
            ListItem::new(1, "Intersteller", "movie1"),
            ListItem::new(2, "Inception", "movie2"),
            ListItem::new(3, "Tenet", "movie3"),
            ListItem::new(4, "Memento", "movie4"),
        ]
    };

    let shows = Column {
        id: String::from("column2"),
        title: String::from("TV Shows"),
        items: vec![
            ListItem::new(1, "How I Met Your Mother", "show1"),
            ListItem::new(2, "Attack on Titan", "show2"),
            ListItem::new(3, "Steins Gate", "show3"),
        ]
    };

    let games = Column {
        id: String::from("column3"),
        title: String::from("Games"),
        items: vec![
            ListItem::new(1, "Cyberpunk 2077", "game1"),
            ListItem::new(2, "Death Stranding", "game2"),
            ListItem::new(3, "Spiderman 2", "game3"),
            ListItem::new(4, "God of War", "game4"),
        ]
    };

    data.insert(movies.title.clone(), movies);
    data.insert(shows.title.clone(), shows);
    data.insert(games.title.clone(), games);

    serde_json::to_string(&data).unwrap()
}

#[actix_web::main]
async fn main() -> std::io::Result<()>{

    HttpServer::new(|| {
        App::new()
        .service(get_initial_data)
        .service(get_sql_categories)
        .wrap(Cors::permissive())
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
