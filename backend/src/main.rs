
pub mod sql;
mod api;
mod app;
pub mod utils;

use std::sync::Mutex;
use std::collections::HashMap;
use env_logger::Env;
use actix_web::{get, post, put, delete, web, App, HttpServer, Responder, HttpResponse, middleware::Logger};
use actix_cors::Cors;
use serde_json;

const HOST: &str = "0.0.0.0";
const PORT: u16 = 8000;

/*
To access shared data
state_data: web::Data<AppState>) -> impl Responder {
    let shared_data = state_data.app_data.lock().unwrap();
    let data= &shared_data.data;

*/

#[post("/api/reorder")]
async fn reorder_item(body: web::Json<api::ChangeDelta>) -> impl Responder {
    let change_delta = body.0;
    
    let first_key = &change_delta.itemBefore.order_key;
    let second_key = &change_delta.itemAfter.order_key;
    let new_key = utils::get_keys_midpoint(&first_key, &second_key);

    let mut updated_item = change_delta.item;
    let id = updated_item.id.parse().unwrap();
    sql::update_item_order(id, &new_key).await;

    updated_item.order_key = new_key;
    serde_json::to_string(&updated_item).unwrap()
}


#[post("/api/item")]
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

    serde_json::to_string(&new_item).unwrap()
}


#[put("/api/item")]
async fn update_item_title(body: web::Json<api::UIItem>) -> impl Responder {
    let item = body.0;
    let item_id = item.id.parse().unwrap();
    sql::update_item_title(item_id, &item.content).await;
    serde_json::to_string(&item).unwrap()
}


#[delete("/api/item")]
async fn delete_item(body: web::Json<api::UIItem>) -> impl Responder {
    let item = body.0;
    let item_id = item.id.parse().unwrap();
    sql::delete_item(item_id).await;
    serde_json::to_string(&item).unwrap()
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


#[post("/api/register")]
async fn register_new_user(body: web::Json<api::UIRegisterUser>) -> impl Responder {

    let mut data = body.0;
    let username = data.username;
    let password = data.password;
    let empty_string = "".to_string();

    if !utils::login::password_is_valid(&password) {
        return HttpResponse::BadRequest().body(empty_string);
    }

    let password_hash = utils::login::create_hashed_password(&password);
    let e = sql::insert_user(&username, &password_hash).await;
    
    // Check for conflict
    match e {
        Err(e) => {
            println!("{:?}", e);
            HttpResponse::Conflict().body(empty_string)
        },
        _ => {
            data.username = username;
            data.password = "AuthToken".to_string();
            HttpResponse::Ok().body(serde_json::to_string(&data).unwrap())
        }
    }
}


#[actix_web::main]
async fn main() -> std::io::Result<()>{

    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    // Use to share state between all requests
    let shared_data = web::Data::new(
        app::AppState {
            app_data: Mutex::new(
                app::User {
                    username: "asinha".to_string(),
                }
            )
        }
    );

    HttpServer::new(move|| {
        App::new()
        .app_data(shared_data.clone())
        .service(get_all_items)
        .service(reorder_item)
        .service(insert_item)
        .service(update_item_title)
        .service(delete_item)
        .service(register_new_user)
        .wrap(Cors::permissive())
        .wrap(Logger::default())
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
