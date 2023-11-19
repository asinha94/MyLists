use std::cmp;


const FIRST_STRING: &str = "keyaaaa";
const LAST_STRING: &str  = "keyzzzz";


#[cfg(test)]
mod tests {
    use super::*;

    fn test_cmp(a: &str, b: &str) {
        let keya = a.to_string();
        let keyb = b.to_string();
        let keym = get_keys_midpoint(&keya, &keyb);
        assert!(keya < keym);
        assert!(keym < keyb);
    }

    #[test]
    fn cmp_keys() {
        assert_eq!(get_char_midpoint('a', 'b'), 'a');
        assert_eq!(get_char_midpoint('a', 'z'), 'm');

        test_cmp("keyan", "keybcdm");
        test_cmp("keya", "keyb");
        test_cmp("keyaaaa", "keybbbb");



    }
}

/// Get midpoint between 2 alphanumeric chars
fn get_char_midpoint(a: char, b: char) -> char {
    let aval = a as u32;
    let bval = b as u32;
    let mid = aval.abs_diff(bval) / 2;
    let new_val = (a as u32) + mid;
    char::from_u32(new_val).unwrap()
}


/// Creates a Key String which will be lexigraphically sorted between 2 string
/// Preconditions: key_first < key_second
/// The basic algorithm is to find the midpoint of the first char that is different
/// i.e midpoint('a', 'c') == 'b'
/// We always append an 'm' so that we dont end in a situation where strings end in 'a' or 'z'
/// and it becomes difficult to find a string to sort after. Using 'm' gives us ample chars before/after.
/// If the first difference is 1 (e.g midpoint('a', 'b') = 'a') we just copy the first string then append 'm'.
/// We also do this if the keys are same length (and the preconditions assure us no 2 keys are the same)
pub fn get_keys_midpoint(key_first: &String, key_second: &String) -> String {

    let mut middle = String::new();

    // If the key has been moved to the end
    let key_second_len = key_second.len();
    if key_second_len == 0 {
        middle.clone_from(key_first);
        middle.push('m');
        return middle
    }

    // If the key has been moved to the start, create fake string whihch 
    let key_first_len: usize = key_first.len();
    if key_first_len == 0 {
        let start_key = FIRST_STRING.to_string();
        return get_keys_midpoint(&start_key, key_second);
    }

    // If keys are the same size, we just append onto the first key
    if key_first_len == key_second_len {
        middle.clone_from(key_first);
        middle.push('m');
        return middle
    }

    // Iterate through strings till we hit the first difference
    // There might be a way to do this with the stdlib, but can't find it
    let mut key_first_iter = key_first.chars();
    let mut key_second_iter = key_second.chars();


    let middle_key = loop {
        let char_first = key_first_iter.next();
        let char_second = key_second_iter.next();

        // Both keys are the same. Should never happen
        // This means the key gets sorted after both keys
        // but the precondition has already been broken
        if char_first == None && char_second == None {
            break 'm';
        }

        // key before sorted first
        if char_first == None {
            let char_second_val = char_second.unwrap();
            break get_char_midpoint('a', char_second_val);
        }

        // key after sorted first, shouldnt happen but handle anyway
        if char_second == None {
            let char_first_val = char_first.unwrap();
            break get_char_midpoint('a', char_first_val);
        }
        
        let char_first_val = char_first.unwrap();
        let char_second_val = char_second.unwrap();


        // Edge case when we try to find the midpoint between consecutive chars
        // Just copy the rest of the string into our new key (with the 'm')
        let copy_remaining_string = |mut key: String, c: char, iter: std::str::Chars<'_>| -> String { 
            let rest_of_string: String = iter.collect();
            key.push(c);
            key.push_str(&rest_of_string);
            key.push('m');
            return key;
        };

        match char_first_val.cmp(&char_second_val) {
            cmp::Ordering::Less => {
                let midchar = get_char_midpoint(char_first_val, char_second_val);
                
                if char_first_val == midchar {
                    return copy_remaining_string(middle, char_first_val, key_first_iter);
                }
                break midchar;
            },

            cmp::Ordering::Greater => {
                // If we find a midpoint 
                let midchar = get_char_midpoint(char_second_val, char_first_val);
                
                if char_second_val == midchar {
                    return copy_remaining_string(middle, char_second_val, key_second_iter);
                }
                break midchar;
            },
    
            cmp::Ordering::Equal => middle.push(char_first_val),
        }
    };

    // Push the midpoint char and an 'm' so that we can always push before/after
    middle.push(middle_key);
    middle.push('m');

    // Make sure new key is as long as the old key size
    let max_key_size = cmp::max(key_first.len(), key_second.len());
    if middle.len() <  max_key_size {
        let diff = max_key_size - middle.len();
        for _ in 0..diff {
            middle.push('m');
        }
        return middle;
    }

    // This is possible when we get 2 consecutive keys
    // e.g "keyabcm" vs "keyabd". "keyabcm" will be created again
    if key_first == &middle{
        middle.push('m');
    }
    
    middle
}
