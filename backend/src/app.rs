use crate::sql::DBCredentialUser;

use std::sync::Mutex;
use std::collections::HashMap;


pub struct UserCredentials {
    pub username: String,
    pub password_hash: String,
    pub user_guid: String,
}

impl UserCredentials {
    pub fn new(user: &DBCredentialUser) -> UserCredentials {
        UserCredentials {
            username: user.username.clone(),
            password_hash: user.password_hash.clone(),
            user_guid: user.user_guid.clone()
        }
    }
}


pub struct AppData {
    pub username_by_token: HashMap<String, String>,
    pub user_by_username: HashMap<String, UserCredentials>
}


pub struct AppState {
    pub app_data : Mutex<AppData>
}