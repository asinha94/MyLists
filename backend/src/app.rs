use std::sync::Mutex;
use std::collections::HashMap;

pub struct User {
    pub username: String,
}

pub struct AppState {
    pub app_data : Mutex<User>
}