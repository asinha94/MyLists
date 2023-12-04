use cookie::Key;
use serde::{Deserialize, Serialize};

use crate::sql::{DBItem, DBUser};
use base64::{Engine as _, engine::general_purpose};

#[derive(Serialize, Deserialize)]
pub struct UIItem {
    pub id: String,
    pub content: String,
    pub order_key: String,
}

impl UIItem {
    pub fn new(item: &DBItem) -> UIItem {
        UIItem {
            id: item.id.to_string(),
            content: item.title.clone(),
            order_key: item.order_key.clone(),
        }
    }
}


#[derive(Serialize, Deserialize)]
pub struct Column {
    pub id: String,
    pub title: String,
    pub unit: String,
    pub verb: String,
    pub items: Vec<UIItem>
}


#[allow(non_snake_case)]
#[derive(Serialize, Deserialize)]
pub struct ChangeDelta {
    pub category: String,
    pub item: UIItem,
    pub itemBefore: UIItem,
    pub itemAfter: UIItem,
}


#[derive(Serialize, Deserialize)]
pub struct UIUser {
    pub username: String,
    pub password: String,
}


pub struct UserCredentials {
    pub username: String,
    pub password_hash: String,
}

impl UserCredentials {
    pub fn new(user: &DBUser) -> UserCredentials {
        UserCredentials {
            username: user.username.clone(),
            password_hash: user.password_hash.clone()
        }
        
    }
}


pub fn generate_api_key() -> String {
    let cookie_api_key = Key::generate();
    let cookie_api_key_bytes = cookie_api_key.master();
    general_purpose::STANDARD.encode(cookie_api_key_bytes)
}