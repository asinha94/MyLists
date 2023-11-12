


const USER: &str = "asinha";
const PASSWORD: &str = "password";
const DBNAME: &str = "website";
const HOST: &str = "localhost";



pub fn get_postgres_connect_uri() -> String {
    format!("postgres://{USER}:{PASSWORD}@{HOST}/{DBNAME}")
}