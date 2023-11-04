
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use rocket_contrib::serve::StaticFiles;
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
fn get_initial_data() -> String {
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

fn main() {
    rocket::ignite()
        .mount("/", StaticFiles::from("/Users/asinha/Documents/Other/webdev/MyList/my-list/frontend/build"))
        .mount("/", routes![get_initial_data])
        .launch();
}