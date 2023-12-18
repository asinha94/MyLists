
pub mod sql;
mod api;
mod app;
pub mod utils;

use std::sync::Mutex;
use std::env;
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

const HOST: &str = "0.0.0.0";
const PORT: u16 = 8000;


#[get("/api/autologin")]
async fn autologin(state_data: web::Data<app::AppState>, session: Session) -> impl Responder {

    // Get cookie if available
    let auth_token = match session.get::<String>("authToken") {
        Err(e) => {
            println!("Unexpected error when checking session storage: {e}");
            return HttpResponse::InternalServerError()
                .body(format!("Cookie Session failure: {e}"));
        },

        Ok(cookie) => match cookie {
            None => return HttpResponse::Unauthorized().finish(),
            Some(auth_token) => auth_token
        }
    };

    // Check session cache for cookie
    let app_data = state_data.app_data.lock().unwrap();
    let username = app_data.username_by_token.get(&auth_token);

    match username {
        // User has an authentication token somehow, but we don't know about it (might have expired)
        None => return HttpResponse::PreconditionFailed().body(format!("Logged out of previous session!")),
        Some(u) => match app_data.user_by_username.get(u) {
            None => return HttpResponse::Unauthorized().finish(),
            Some(uc) => {
                let ui_user = api::UIDisplayUser {
                    user_guid: uc.user_guid.clone(),
                    display_name: uc.display_name.clone()
                };
                HttpResponse::Ok().body(serde_json::to_string(&ui_user).unwrap())
            }
        }
    }
    
}


#[post("/api/category")]
async fn add_category(user_query: web::Query<api::UIUser>, body: web::Json<api::UINewCategory>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {
    
    // We get back the username of the user that is authenticated based on the cookie, None otherwise
    let username = match app::is_authenticated_and_getusername(&session, &state_data, &user_query.user_guid) {
        None => return HttpResponse::Unauthorized().finish(),
        Some(u) => u
    };

   let new_category = body.0;
   let category_title = &new_category.category_title;
   let category_unit = &new_category.category_unit;
   let category_verb = &new_category.category_verb;

    match sql::insert_category(&username, category_title, category_unit, category_verb).await {
        Ok(_) => HttpResponse::Ok().body(
            serde_json::to_string(&new_category).unwrap()
        ),
        Err(e) => {
            println!("Got some error: {e}");
            return HttpResponse::BadRequest().finish();
        }
    }
}


#[delete("/api/item")]
async fn delete_item(user_query: web::Query<api::UIUser>, body: web::Json<api::UIItem>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {
    // We get back the username of the user that is authenticated based on the cookie, None otherwise
    let username = match app::is_authenticated_and_getusername(&session, &state_data, &user_query.user_guid) {
        None => return HttpResponse::Unauthorized().finish(),
        Some(u) => u
    };
    
    let item = body.0;
    let item_id = item.id.parse().unwrap();
    sql::delete_item(item_id).await;
    HttpResponse::Ok().body(
        serde_json::to_string(&item).unwrap()
    )
    
}


#[post("/api/item")]
async fn insert_item(user_query: web::Query<api::UIUser>, body: web::Json<api::ChangeDelta>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {
    
    // We get back the username of the user that is authenticated based on the cookie, None otherwise
    let username = match app::is_authenticated_and_getusername(&session, &state_data, &user_query.user_guid) {
        None => return HttpResponse::Unauthorized().finish(),
        Some(u) => u
    };
    // TODO: use username in query

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

    HttpResponse::Ok().body(
        serde_json::to_string(&new_item).unwrap()
    )
}


#[put("/api/item")]
async fn update_item_title(user_query: web::Query<api::UIUser>, body: web::Json<api::UIItem>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {
    // We get back the username of the user that is authenticated based on the cookie, None otherwise
    let username = match app::is_authenticated_and_getusername(&session, &state_data, &user_query.user_guid) {
        None => return HttpResponse::Unauthorized().finish(),
        Some(u) => u
    };
    // TODO: use username in query
    
    let item = body.0;
    let item_id = item.id.parse().unwrap();
    sql::update_item_title(item_id, &item.content).await;

    HttpResponse::Ok().body(
        serde_json::to_string(&item).unwrap()
    )
    
}


#[get("/api/items")]
async fn get_all_items(user_query: web::Query<api::UIUser>) -> impl Responder {

    let mut data = HashMap::new();
    let categories = sql::get_all_user_categories(&user_query.user_guid).await;
    for category in categories {
        data.insert(category.category_title.clone(), api::Column {
            id: category.category_title.clone(),
            title: category.category_title.clone(),
            unit: category.category_unit.clone(),
            verb: category.category_consume_verb.clone(),
            items: Vec::new(),
        });
    };

    // Insert all items
    let items = sql::get_all_user_items(&user_query.user_guid).await;
    for item in items {
        let category_list = data.get_mut(&item.category_title).unwrap();
        category_list.items.push(api::UIItem::new(&item));
    }
    
    serde_json::to_string(&data).unwrap()
}


#[post("/api/login")]
async fn login(body: web::Json<api::UILoginUser>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {
    let data = body.0;
    let username = data.username;
    let password = data.password;

    if !utils::login::password_is_valid(&password) {
        return HttpResponse::Unauthorized().finish();
    }

    let mut app_data = state_data.app_data.lock().unwrap();
    let user = app_data.user_by_username.get(&username);
    
    // User Unknown. Eventually replace with Redis + DB
    if user.is_none() {
        return HttpResponse::Unauthorized().finish();
    }

    // Check if password matches the hash
    let user = user.unwrap();
    if !utils::login::password_hashes_to_phc(&password, &user.password_hash) {
        return HttpResponse::Unauthorized().finish();
    }

    // Create object for frontend
    let u = api::UIDisplayUser {
        user_guid: user.user_guid.clone(),
        display_name: user.display_name.clone()
    };

    // Generate an AuthToken Cookie for the user
    let api_key = api::generate_api_key();
    app_data.username_by_token.insert(api_key.clone(), username);

    // Insert into Cookie Session i.e Add to Set-Cookie Header
    match session.insert("authToken", api_key) {
        Ok(_) => HttpResponse::Ok().body(serde_json::to_string(&u).unwrap()),
        Err(e) => {
            println!("Failed to set cookie: {e}");
            HttpResponse::InternalServerError().finish()
        }
    }
}


#[post("/api/register")]
async fn register_new_user(body: web::Json<api::UIRegisterUser>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {

    match session.get::<String>("authToken").unwrap() {
        None => (),
        Some(_) => {
            // I dont have a good reponse code for "Already Logged in"
            return HttpResponse::NotAcceptable().finish();
        }
    }

    let data = body.0;
    let displayname = data.displayname;
    let username = data.username;
    let password = data.password;

    if !utils::login::password_is_valid(&password) {
        return HttpResponse::BadRequest().finish();
    }

    let password_hash = utils::login::create_hashed_password(&password);
    let e = sql::insert_user(&displayname, &username, &password_hash).await;
    
    // Check for conflict
    match e {
        Err(e) => {
            // Possible there are other errors. We should handle this better in general
            println!("{:?}", e);
            HttpResponse::Conflict().finish()
        },
        Ok(user) => {
            // Insert the user into our cache, then force the user to re-login
            // To get their cookie. Send them their name/guid to update their frontend
            let mut app_data = state_data.app_data.lock().unwrap();
            let new_user = app::UserCredentials::new(&user);
            app_data.user_by_username.insert(username, new_user);

            let ui_new_user = api::UIDisplayUser {
                display_name: displayname,
                user_guid: user.user_guid
            };
            HttpResponse::Ok().body(
                serde_json::to_string(&ui_new_user).unwrap()
            )
        }
    }
}


#[post("/api/reorder")]
async fn reorder_item(user_query: web::Query<api::UIUser>, body: web::Json<api::ChangeDelta>, state_data: web::Data<app::AppState>, session: Session) -> impl Responder {
    
    // We get back the username of the user that is authenticated based on the cookie, None otherwise
    let username = match app::is_authenticated_and_getusername(&session, &state_data, &user_query.user_guid) {
        None => return HttpResponse::Unauthorized().finish(),
        Some(u) => u
    };
    // TODO: use username in query
    
    let change_delta = body.0;
    
    let first_key = &change_delta.itemBefore.order_key;
    let second_key = &change_delta.itemAfter.order_key;
    let new_key = utils::get_keys_midpoint(&first_key, &second_key);

    let mut updated_item = change_delta.item;
    let id = updated_item.id.parse().unwrap();
    sql::update_item_order(id, &new_key).await;

    updated_item.order_key = new_key;
    HttpResponse::Ok().body(
        serde_json::to_string(&updated_item).unwrap()
    )
    
}


#[put("/api/signout")]
async fn sign_out_user(state_data: web::Data<app::AppState>, session: Session) -> impl Responder {

    let auth_token = match session.get::<String>("authToken").unwrap() {
        None => return HttpResponse::Unauthorized(),
        Some(a) => a
    };

    // Remove the user from our cache
    let mut app_data = state_data.app_data.lock().unwrap();
    app_data.username_by_token.remove(&auth_token);

    // delete cookie
    session.remove("authToken");
    HttpResponse::Ok()
}


#[get("/api/users")]
async fn get_all_users() -> impl Responder {
    let users: Vec<_> = sql::get_all_users().await
        .iter()
        .map(|x| api::UIDisplayUser {
            user_guid: x.user_guid.clone(),
            display_name: x.display_name.clone()
        }).collect();

    serde_json::to_string(&users).unwrap()
}


fn session_middleware(is_prod: bool, cookie_secret_key: String) -> SessionMiddleware<CookieSessionStore> {
    let cookie_secret_key_decoded = general_purpose::STANDARD.decode(cookie_secret_key).unwrap();
    let key = Key::from(&cookie_secret_key_decoded);

    let session = SessionMiddleware::builder(
        CookieSessionStore::default(), key)
        .session_lifecycle(PersistentSession::default());
        
        if is_prod {
            return session.build();
        }

        // Remove for prod. Require SameSite, but thats OK since that means same domain, not same origin
        session.cookie_content_security(CookieContentSecurity::Signed)
        .cookie_http_only(false)
        .cookie_secure(false)
        .build()
}

#[actix_web::main]
async fn main() -> std::io::Result<()>{
    let is_prod: bool = env::var("APP_DEV_ENV").is_err();
    let default_cookie_key = String::from("gjFIiSwMlxg+hPgn16du3JKI09Dk6ChZX8bvy8hhoy3NpU/yLSSrVXI/7BnfMC+oz9wx7wyxe0kn7+X6PaZdZA==");
    let cookie_secret_key = env::var("APP_COOKIE_SECRET").unwrap_or(default_cookie_key);
    if !is_prod {
        println!("WARNING: Running DEV Server!. Cookie Secret: {cookie_secret_key}");
    }

    env_logger::init_from_env(Env::default().default_filter_or("debug"));


    // Get all users from DB and collect into HashMap
    let all_users = sql::get_all_users_credentials().await;
    let all_users = all_users.iter()
        .map(|x| (x.username.clone(), app::UserCredentials::new(&x)))
        .collect::<HashMap<String, app::UserCredentials>>();

    // Use to share state between all requests
    let shared_data = web::Data::new(
        app::AppState {
            app_data: Mutex::new(app::AppData {
                username_by_token: HashMap::new(),
                user_by_username: all_users
            })
        }
    );

    HttpServer::new(move|| {
        App::new()
        .app_data(shared_data.clone())
        .service(add_category)
        .service(autologin)
        .service(delete_item)
        .service(get_all_items)
        .service(get_all_users)
        .service(insert_item)
        .service(login)
        .service(register_new_user)
        .service(reorder_item)
        .service(sign_out_user)
        .service(update_item_title)
        .wrap(Cors::permissive())
        .wrap(Logger::default())
        .wrap(session_middleware(is_prod, cookie_secret_key.clone()))
    })
    .bind((HOST, PORT))?
    .run()
    .await
}
