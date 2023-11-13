
pub mod sql;
mod api;
mod utils;

use std::collections::HashMap;
use env_logger::Env;
use actix_web::{get, post, web, App, HttpServer, Responder, HttpResponse, middleware::Logger};
use actix_cors::Cors;
use serde_json;

const HOST: &str = "127.0.0.1";
const PORT: u16 = 8000;

#[post("/reorder")]
async fn reorder_item(body: web::Json<api::ChangeDelta>) -> impl Responder {
    let change_delta = body.0;

    // TODO make items optional
    // Also handle issue of only 1 char between 2 keys
    // e.g ABC vs ABD will generate ABC again.
    // We need to know to extend the key
    let first_key = change_delta.itemBefore.order_key;
    let second_key = change_delta.itemAfter.order_key;
    
    // SQL update
    let new_key = utils::get_keys_midpoint(&first_key, &second_key);
    println!("{} {} {}", first_key, new_key, second_key);
    HttpResponse::Ok()
}



#[get("/items")]
async fn get_all_items() -> impl Responder {

    let items = sql::get_all_items().await;
    // Create dict lists from list of dicts
    let mut data = HashMap::new();
    for item in items {
        // Lookup or insert
        let category_list = data.entry(item.category_title.clone())
            .or_insert(api::Column {
                id: item.category_title.clone(),
                title: item.category_title.clone(),
                items: Vec::new(),
            });

        category_list.items.push(api::UIItem::new(&item));
    }
    
    serde_json::to_string(&data).unwrap()
}


#[actix_web::main]
async fn main() -> std::io::Result<()>{

    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    HttpServer::new(|| {
        App::new()
        .service(get_all_items)
        .service(reorder_item)
        .wrap(Cors::permissive())
        .wrap(Logger::default())
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
