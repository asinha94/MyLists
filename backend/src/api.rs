use serde::{Deserialize, Serialize};

use crate::sql::DBItem;


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
    pub items: Vec<UIItem>
}

#[derive(Serialize, Deserialize)]
pub struct ChangeDelta {
    pub category: String,
    pub item: UIItem,
    pub itemBefore: UIItem,
    pub itemAfter: UIItem,
}