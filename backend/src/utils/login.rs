#[path = "../sql.rs"]
pub mod sql;

use std::io::Write;
use rpassword;
use regex::Regex;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    }, Argon2
};

const MIN_PASSWORD_LENGTH: usize = 8;
const PASSWORD_VALIDATION_MSG: &str = "Password must be a mix of uppercase, lowercase,\
  numbers and special characters (!@#$%^&*()?/<>,./\\|)";

pub fn password_is_valid(password: &String) -> bool {
    let number_re = Regex::new(r"\d").unwrap();
    let upper_re = Regex::new(r"[a-z]").unwrap();
    let lower_re = Regex::new(r"[A-Z]").unwrap();
    let special_re = Regex::new(r"[!@#$%^&*()?/<>,./\|]").unwrap();

    let checks = [
        number_re.is_match(&password),
        upper_re.is_match(&password),
        lower_re.is_match(&password),
        special_re.is_match(&password),
        password.len() >= MIN_PASSWORD_LENGTH
    ];

    return checks.iter().all(|&x| x);
}


pub fn create_hashed_password(password: &String) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt).unwrap().to_string();
    
    // Make sure hashing was successfull
    let parsed_hash = PasswordHash::new(&password_hash).unwrap();
    Argon2::default().verify_password(password.as_bytes(), &parsed_hash).unwrap();
    password_hash
}

#[allow(dead_code)]
#[tokio::main]
async fn main() -> std::io::Result<()> {

    let mut username = String::new();
    //let mut password = String::new();

    print!("Enter username: ");
    std::io::stdout().flush().unwrap();

    std::io::stdin()
        .read_line(&mut username)
        .unwrap();
    username = username.trim().to_string();

    let password = loop {
        let password = rpassword::prompt_password("Enter password: ").unwrap();
        if password_is_valid(&password) {
            break password;
        }
        println!("{PASSWORD_VALIDATION_MSG}\n");
    };
    
    let password_hash = create_hashed_password(&password);
    match sql::insert_user(&username, &password_hash).await {
        Ok(_) => (),
        Err(e) => println!("Postrges Error: {e}")
    };
    Ok(())
}