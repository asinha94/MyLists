// Stdlib
use std::sync::Mutex;
use std::collections::HashMap;
// Libraries
use actix_session::Session;
// App
use crate::sql::DBCredentialUser;


pub struct UserCredentials {
    pub username: String,
    pub password_hash: String,
    pub user_guid: String,
    pub display_name: String,
}

impl UserCredentials {
    pub fn new(user: &DBCredentialUser) -> UserCredentials {
        UserCredentials {
            username: user.username.clone(),
            password_hash: user.password_hash.clone(),
            user_guid: user.user_guid.clone(),
            display_name: user.display_name.clone(),
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


pub fn is_authenticated_and_getusername(session: &Session, state_data: &AppState, user_guid: &String) -> Option<String> {
    // Get auth cookie if available
    let auth_token = match session.get::<String>("authToken") {
        Err(_) => return None,
        Ok(cookie) => match cookie {
            None => return None,
            Some(auth_token) => auth_token
        }
    };

    // Check session cache for cookie
    let app_data = state_data.app_data.lock().unwrap();
    
    // Get user attached to cookie. If none, 401
    let user = match app_data.username_by_token.get(&auth_token) {
        None => return None,
        Some(u) => match app_data.user_by_username.get(u) {
            None => return None,
            Some(user) => user
        }
    };

    (&user.user_guid == user_guid).then_some(user.username.clone())
}