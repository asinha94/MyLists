pub mod login;

const DEFAULT_PREFIX: &str = "key"; 
const FIRST_STRING: &str   = "keyaaaa";
//const LAST_STRING: &str  = "keyzzzz";


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

        test_cmp("keyabc", "keyabdm");
        test_cmp("keyabcm", "keyabdm");
        test_cmp("keyan", "keybcdm");
        test_cmp("keya", "keyb");
        test_cmp("keyaaaa", "keybbbb");
        test_cmp("", "keyaaaamm");
        test_cmp("", "keyaaaaammmm");
        test_cmp("", "keyaaaammm");
    }
}


fn chardiff(a: char, b: char) -> u32 {
    let aval = a as u32;
    let bval = b as u32;
    aval.abs_diff(bval)
}


/// Get midpoint between 2 alphanumeric chars
fn get_char_midpoint(a: char, b: char) -> char {
    let aval = a as u32;
    let new_val = aval + (chardiff(a, b) / 2);
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
    let first_sz = key_first.len();
    let second_sz = key_second.len();

    // Inserting into empty list
    if first_sz == 0 && second_sz == 0 {
        return format!("{FIRST_STRING}m");
    }

    // Insert to the front of the list
    if first_sz == 0 {
        let prefix = String::from(DEFAULT_PREFIX);
        return get_keys_midpoint(&prefix, key_second);
    }

    // Insert to the end of the list
    if second_sz == 0 {
        let prefix = String::from(DEFAULT_PREFIX);
        return get_keys_midpoint(key_first, &prefix);
    }

    // Iterate through strings till we hit the first difference
    // There might be a way to do this with the stdlib, but can't find it
    let mut key_first_iter = key_first.chars();
    let mut key_second_iter = key_second.chars();

    let mut middle = String::new();

    let middle_key = loop {
        let char_first = key_first_iter.next();
        let char_second = key_second_iter.next();

        // Both keys are the same. Should never happen
        // This means the key gets sorted after both keys
        // but the precondition has already been broken
        if char_first.is_none() && char_second.is_none() {
            break 'm';
        }

        let aval = match char_first {
            None => 'a',
            Some(c) => c
        };

        let bval = match char_second {
            // This case should never happen, since key_first should always sort first
            None => 'z',
            Some(c) => c
        };

        let diff = chardiff(aval, bval);
        let new_char = get_char_midpoint(aval, bval);

        if diff < 2 {
            middle.push(new_char);
            continue;
        }

        break new_char;

    };
   
    // Push the midpoint char and an 'm' so that we can always push before/after
    middle.push(middle_key);
    middle.push('m');

    // This is possible when we get 2 consecutive keys
    // e.g "keyabcm" vs "keyabd". "keyabcm" will be created again
    if key_first == &middle{
        middle.push('m');
    }
    middle
}
