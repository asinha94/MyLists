
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

use serde::{Deserialize, Serialize};
use serde_json;


#[derive(Serialize, Deserialize)]
struct ListItem {
    id: u64,
    title: String,
    order_key: String,
}


#[get("/data")]
fn get_initial_data() -> String {
    let item = ListItem {
        id: 1,
        title: String::from("Test"),
        order_key: String::from("key_1"),
    };
    serde_json::to_string(&item).unwrap()
}

fn main() {
    rocket::ignite().mount("/", routes![get_initial_data]).launch();
}