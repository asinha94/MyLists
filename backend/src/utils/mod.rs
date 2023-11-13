use std::cmp;

fn get_char_midpoint(a: char, b: char) -> char {
    let aval = a as u32;
    let bval = b as u32;
    let mid = aval.abs_diff(bval) / 2;
    let new_val = (a as u32) + mid;
    char::from_u32(new_val).unwrap()
}

pub fn get_keys_midpoint(key_before: &String, key_after: &String) -> String {
    
    let mut new_key = String::new();

    // Moved to end of the list, just append the 'm'
    if key_after.len() == 0 {
        new_key.clone_from(key_before);
        new_key.push('m');
        return new_key;
    }


    // Moved to the front of the list
    if key_before.len() == 0 {
        // This is a key that cannot exist, because it doesn't end with 'm'
        // so nothing can come before it
        // We use this to seed a new head of the list key
        let new_key_before = "keybbb".to_string();
        return get_keys_midpoint(&new_key_before, key_after);
    }


    let mut it_key_before = key_before.chars();
    let mut it_key_after = key_after.chars();

    

    let new_key_val = loop {
        let char_before = it_key_before.next();
        let char_after = it_key_after.next();

        // Both keys are the same. Should never happen
        // This means the key gets sorted after both keys
        // but the precondition has already been broken
        if char_before == None && char_after == None {
            break 'm';
        }

        // key before sorted first
        if char_before == None {
            let char_after_val = char_after.unwrap();
            break get_char_midpoint('b', char_after_val);
        }

        // key after sorted first, shouldnt happen
        if char_after == None {
            let char_before_val = char_before.unwrap();
            break get_char_midpoint('b', char_before_val);
        }

        let char_before_val = char_before.unwrap();
        let char_after_val = char_after.unwrap();
        
        match char_before_val.cmp(&char_after_val) {
            cmp::Ordering::Less => break get_char_midpoint(char_before_val, char_after_val),
            cmp::Ordering::Greater => break get_char_midpoint(char_after_val, char_before_val),
            cmp::Ordering::Equal => new_key.push(char_before_val),
        }
    };

    // Push the midpoint char and an 'm' so that we can always push before/after
    new_key.push(new_key_val);
    new_key.push('m');

    // Make sure new key is as long as the old key size
    let max_key_size = cmp::max(key_before.len(), key_after.len());
    if new_key.len() <  max_key_size {
        let diff = max_key_size - new_key.len();
        for _ in 0..diff {
            new_key.push('m');
        }
        return new_key;
    }

    // This is possible when we get 2 consecutive keys
    // e.g "abc" vs "abd". "abc" will be created again
    if key_before == &new_key{
        new_key.push('m');
    }

    new_key
}
