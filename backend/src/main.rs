
pub mod sql;
mod api;
mod app;
pub mod utils;

use std::sync::Mutex;
use std::collections::HashMap;
use actix_session::{config::{PersistentSession, CookieContentSecurity}, Session};
use env_logger::Env;
use actix_web::{get, post, put, delete, web, App, HttpServer, Responder, HttpResponse, middleware::Logger};
use actix_cors::Cors;
use actix_session::SessionMiddleware;
use actix_session::storage::CookieSessionStore;
use actix_web::cookie::Key;
use base64::{Engine as _, engine::general_purpose};
use serde_json;
//use cookie;

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

    let username = "asinha".to_string();
    let items = sql::get_all_items(&username).await;
    // Create dict lists from list of dicts
    let mut data = HashMap::new();
    for item in items {
        // Lookup or insert
        let category_list = data.entry(item.category_title.clone())
            .or_insert(api::Column {
                id: item.category_title.clone(),
                title: item.category_title.clone(),
                unit: item.category_unit.clone(),
                verb: item.category_consume_verb.clone(),
                items: Vec::new(),
            });

        category_list.items.push(api::UIItem::new(&item));
    }
    
    serde_json::to_string(&data).unwrap()
}


#[post("/api/register")]
async fn register_new_user(body: web::Json<api::UIRegisterUser>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {

    let data = body.0;
    let username = data.username;
    let password = data.password;

    if !utils::login::password_is_valid(&password) {
        return HttpResponse::BadRequest();
    }

    let password_hash = utils::login::create_hashed_password(&password);
    let e = sql::insert_user(&username, &password_hash).await;
    
    // Check for conflict
    match e {
        Err(e) => {
            println!("{:?}", e);
            HttpResponse::Conflict()
        },
        _ => {
            let cookie_api_key = Key::generate();
            let cookie_api_key_bytes = cookie_api_key.master();
            let api_key = general_purpose::STANDARD.encode(cookie_api_key_bytes);
            let mut shared_data = state_data.app_data.lock().unwrap();
            // This invalidates the previous key. Might want to keep a list
            shared_data.insert(api_key.clone(), username.clone());
            match session.insert("authToken", api_key) {
                Ok(_) =>  HttpResponse::Ok(),
                Err(e) => {
                    println!("Failed to set cookie: {e}");
                    HttpResponse::InternalServerError()
                }
            }
           
        }
    }
}


fn session_middleware() -> SessionMiddleware<CookieSessionStore> {
    SessionMiddleware::builder(
        CookieSessionStore::default(), Key::generate())
        .session_lifecycle(PersistentSession::default())
        .cookie_content_security(CookieContentSecurity::Private)
         // Remove for prod
        .cookie_same_site(cookie::SameSite::None)
        .cookie_secure(false)
        .build()
}

#[actix_web::main]
async fn main() -> std::io::Result<()>{

    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    // Use to share state between all requests
    let shared_data = web::Data::new(
        app::AppState {
            app_data: Mutex::new(HashMap::new())
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
        .wrap(session_middleware())
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
