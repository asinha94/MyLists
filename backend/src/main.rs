
pub mod sql;
mod api;
mod utils;

use std::collections::HashMap;
use env_logger::Env;
use actix_web::{get, post, web, App, HttpServer, Responder, HttpResponse, middleware::Logger};
use actix_cors::Cors;
use serde_json;

const HOST: &str = "0.0.0.0";
const PORT: u16 = 8000;

#[post("/api/reorder")]
async fn reorder_item(body: web::Json<api::ChangeDelta>) -> impl Responder {
    let change_delta = body.0;
    
    let first_key = &change_delta.itemBefore.order_key;
    let second_key = &change_delta.itemAfter.order_key;
    let new_key = utils::get_keys_midpoint(&first_key, &second_key);

    let mut updated_item = change_delta.item;
    let id = updated_item.id.parse().unwrap();
    sql::update_item_order(id, &new_key).await;

    println!("{} item (id {}) {} OrderKey {} -> {}",
        change_delta.category,
        updated_item.id,
        updated_item.content,
        updated_item.order_key,
        new_key);

    updated_item.order_key = new_key;
    HttpResponse::Ok().body(serde_json::to_string(&updated_item).unwrap())
}


#[post("/api/insert")]
async fn insert_item(body: web::Json<api::ChangeDelta>) -> impl Responder {
    let change_delta = body.0;
    
    // Generate the new key
    let first_key = &change_delta.itemBefore.order_key;
    let second_key = &change_delta.itemAfter.order_key;
    let new_key = utils::get_keys_midpoint(&first_key, &second_key);

    // Insert the new time
    let category = &change_delta.category;
    let title = &change_delta.item.content;
    let new_id = sql::insert_item(category, title, &new_key).await;

    let new_item = api::UIItem {
        id: new_id.to_string(),
        content: title.clone(),
        order_key: new_key
    };

    println!("New {category} item \'{title}\' (id {new_id}, OrderKey {}) added", new_item.order_key);
    HttpResponse::Ok().body(serde_json::to_string(&new_item).unwrap())
}



#[get("/api/items")]
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
        .service(insert_item)
        .wrap(Cors::permissive())
        .wrap(Logger::default())
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
