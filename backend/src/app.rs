use crate::api;

use std::sync::Mutex;
use std::collections::HashMap;

pub struct AppData {
    pub username_by_token: HashMap<String, String>,
    pub user_by_username: HashMap<String, api::UserCredentials>
}


pub struct AppState {
    pub app_data : Mutex<AppData>
}