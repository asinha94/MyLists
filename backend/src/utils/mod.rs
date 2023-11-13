use std::cmp::Ordering;

fn get_char_midpoint(a: char, b: char) -> char {
    let aval = a as u32;
    let bval = b as u32;
    let mid = aval.abs_diff(bval) / 2;
    let new_val = (a as u32) + mid;
    char::from_u32(new_val).unwrap()
}

pub fn get_keys_midpoint(key_a: &String, key_b: &String) -> String {
    
    let mut keya_it = key_a.chars();
    let mut keyb_it = key_b.chars();

    let mut new_key = String::new();

    let new_key_val = loop {
        let char_a = keya_it.next();
        let char_b = keyb_it.next();

        // Both keys are the same. Should never happen
        // This means the key gets sorted after both keys
        // but the precondition has already been broken
        if char_a == None && char_b == None {
            break 'm';
        }

        // key A sorted first
        if char_a == None {
            let char_b_val = char_b.unwrap();
            break get_char_midpoint('b', char_b_val);
        }

        // key B sorted first, shouldnt happen either
        if char_b == None {
            let char_a_val = char_a.unwrap();
            break get_char_midpoint('b', char_a_val);
        }

        let char_a_val = char_a.unwrap();
        let char_b_val = char_b.unwrap();
        
        match char_a_val.cmp(&char_b_val) {
            Ordering::Less => break get_char_midpoint(char_a_val, char_b_val),
            Ordering::Greater => break get_char_midpoint(char_b_val, char_a_val),
            Ordering::Equal => new_key.push(char_a_val),
        }
    };

    new_key.push(new_key_val);
    
    // Make sure new key is at least as long as old key
    if new_key.len() <  key_a.len() {
        let diff = key_a.len() - new_key.len();
        for _ in 0..diff {
            new_key.push('m');
        }
    }

    new_key
}
