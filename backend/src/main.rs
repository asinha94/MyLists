
use std::collections::HashMap;

use actix_web::{get, App, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json;


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


#[get("/data")]
async fn get_initial_data() -> impl Responder {
    let mut data = HashMap::<String, Column>::new();
    
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
        .wrap(Cors::permissive())
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}