use std::sync::Mutex;
use std::collections::HashMap;


pub struct AppState {
    pub app_data : Mutex<HashMap<String, String>>
}