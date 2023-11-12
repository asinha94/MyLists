#[path = "../sql.rs"]
mod sql;

use std::fs;
use std::collections::HashMap;
use sqlx::{Connection, PgConnection};
use tokio;


const CATEGORIES_PATH: &str = "src/utils/categories.csv";
const ITEMS_PATH: &str = "src/utils/items.csv";

async fn insert_categories() {
    let err_string = format!("Failed to read {CATEGORIES_PATH}");
    let f = fs::read_to_string(CATEGORIES_PATH).expect(&err_string);
    
    let connuri = sql::get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    for line in f.lines() {
        let qry = "
        INSERT INTO categories (category_title) VALUES ($1)
        ON CONFLICT DO NOTHING";
        sqlx::query(qry)
            .bind(line)
            .execute(&mut conn)
            .await
            .unwrap();
    }

}


async fn insert_items() {    
    let err_string = format!("Failed to read {ITEMS_PATH}");
    let f = fs::read_to_string(ITEMS_PATH).expect(&err_string);

    let mut items_by_category = HashMap::new();

    let mut count: i32 = 0;
    for line in f.lines() {
        let ls: Vec<&str> = line.split(",").collect();
        
        if ls.len() != 2 {
            println!("Malformed CSV line: {line}");
            continue;
        }

        let category = ls[0];
        let name = ls[1];

        // Insert new vector if not available
        let category_items =  items_by_category.entry(String::from(category))
            .or_insert(Vec::new());

        category_items.push(String::from(name));
        count += 1;
    }

    

    let connuri = sql::get_postgres_connect_uri();
    let mut conn = PgConnection::connect(&connuri).await.unwrap();

    let qry = "
    INSERT INTO items (category_id, title, order_key)
    SELECT id, $1, $2 FROM categories
    WHERE category_title = $3
    ON CONFLICT DO NOTHING";


    // Create the key arrays. Start at b
    const BASE: u8 = 12;
    let key_width = count.ilog(12) + 1;
    println!("Count is {key_width}");
    let mut chars: Vec<u8> = Vec::new();
    for i in 0..key_width {
        chars.push(0);
    }


    for (category, items) in &items_by_category {

        for item in items.iter() {
            let mut key = String::from("key");
            for chr in &chars {
                let ascii: u8 = 98 + (chr * 2);
                key.push(ascii as char);
            }
            increment_key_array(&mut chars, BASE);

            sqlx::query(qry)
                .bind(item)
                .bind(&key)
                .bind(category)
                .execute(&mut conn)
                .await
                .unwrap();
        }

    }

}

fn increment_key_array(key: &mut Vec<u8>, max_value: u8) {
    for i in (0..key.len()).rev() {
        let val = key[i] + 1;
        key[i] = val;

        if val < max_value {
            return;
        }

        key[i] = 0;

    }
}  


#[tokio::main]
async fn main() {
    insert_categories().await;
    insert_items().await;
}