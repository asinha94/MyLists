
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;



struct ListItem {
    id: u64,
    title: String,
    order_key: String,
}


#[get("/data")]
fn get_initial_data() -> String {
    String::from("Test")
}

fn main() {
    rocket::ignite().mount("/", routes![get_initial_data]).launch();
}