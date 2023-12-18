use cookie::Key;
use serde::{Deserialize, Serialize};

use crate::sql::DBItem;
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
pub struct UIRegisterUser {
    pub displayname: String,
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct UILoginUser {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct UIDisplayUser {
    pub user_guid: String,
    pub display_name: String
}

#[derive(Deserialize)]
pub struct UIUser {
    pub user_guid: String,
}


#[derive(Deserialize, Serialize)]
pub struct UINewCategory {
    pub category_title: String,
    pub category_unit: String,
    pub category_verb: String,
}


pub fn generate_api_key() -> String {
    let cookie_api_key = Key::generate();
    let cookie_api_key_bytes = cookie_api_key.master();
    general_purpose::STANDARD.encode(cookie_api_key_bytes)
}