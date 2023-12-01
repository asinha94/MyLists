#[path = "../sql.rs"]
pub mod sql;

use std::{env, io::Write};
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    }, Argon2
};


const HELP_MSG: &str = "Usage: ./create_user <username>";

async fn create_hashed_password(username: &String) -> Result<(), i32> {

    
    let mut password = String::new();

    print!("Enter username for '{}': ", username);
    std::io::stdout().flush().unwrap();

    std::io::stdin()
        .read_line(&mut password)
        .unwrap();


    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt).unwrap().to_string();
    
    // Make sure hashing was successfull
    let parsed_hash = PasswordHash::new(&password_hash).unwrap();
    Argon2::default().verify_password(password.as_bytes(), &parsed_hash).unwrap();

    // Insert into database
    sql::insert_user(username, &password_hash).await;


    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), i32> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        let msg = format!("Expected 1 input argument!\n{HELP_MSG}");
        println!("{msg}");
        return Err(1);
    }

    let username = &args[1];
    create_hashed_password(username).await
}