const PROTOCOL = window.location.protocol;
const HOST = window.location.hostname;
const DEV_PORT = 8000;
const URL = `${PROTOCOL}//${HOST}` + (process.env.NODE_ENV === "development" ? `:${DEV_PORT}` : "");
const API_URL = `${URL}/api`

// TODO: Add toast message for network errors

export async function getAllUsers() {
  
  try {
    const response = await fetch(API_URL + '/users');

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return null;
    }

    return await response.json();    

  } catch(err) {
    console.log(err.message);
    return null;
  }
};

// TODO: Toast message on failure
export async function getUserItemData(user_guid) {  
  try {
    const response = await fetch(
      API_URL + '/items?' + new URLSearchParams({user_guid: user_guid})
    );

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return null;
    }

    return await response.json();

  } catch(err) {
    console.log(err.message);
    return null;
  }
};


export async function sendReorderedItem(changeDelta, user_guid) {

  try {
    const response = await fetch(
      API_URL + '/reorder?' + new URLSearchParams({user_guid: user_guid}), {
      method: 'POST',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changeDelta)
      }
    );

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return null;
    }

    const responseData = await response.json();
    return responseData

  } catch(err) {
    console.log(err.message);
    return null;
  }
}


export async function sendNewItem(changeDelta, user_guid) {

  try {
    const response = await fetch(
      API_URL + '/item?' + new URLSearchParams({user_guid: user_guid}), {
      method: 'POST',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changeDelta)
      }
    );

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return null;
    }

    const responseData = await response.json();
    return responseData

  } catch(err) {
    console.log(err.message);
    return null;
  }
}


export async function sendUpdatedItem(item, user_guid) {

  try {
    const response = await fetch(
      API_URL + '/item?' + new URLSearchParams({user_guid: user_guid}), {
      method: 'PUT',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
      }
    );

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return null;
    }

    const responseData = await response.json();
    return responseData

  } catch(err) {
    console.log(err.message);
    return null;
  }
}


export async function deleteItem(item, user_guid) {

  try {
    const response = await fetch(
      API_URL + '/item?' + new URLSearchParams({user_guid: user_guid}), {
      method: 'DELETE',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
      }
    );

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return false;
    }

    return true;

  } catch(err) {
    console.log(err.message);
    return null;
  }
}

// TODO: Get guid back so I can insert it into the List immediately
export async function registerUser(displayname, username, password, malformedPasswordMsg) {
  const credentials = {displayname: displayname, username: username, password: password}
  try {
    const response = await fetch(API_URL + '/register', {
      method: 'POST',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
      }
    );

    const registerUpdateData = {
      authorized: false,
      authFailReason: null,
      authReason: null,
      authUser: null
    }

    if (response.ok) {
      const newUser = await response.json();
      registerUpdateData.authUser = newUser;
      registerUpdateData.authorized = true;
      registerUpdateData.authReason = 'New User Registered';
    }
    
    // 400 bad password, shouldnt happen
    else if (response.status === 400) {
      registerUpdateData.authFailReason = 'password';
      registerUpdateData.authReason = malformedPasswordMsg;
    }

    // 406, already authenticated
    else if (response.status === 406) {
      registerUpdateData.authFailReason = 'loggedin';
      registerUpdateData.authReason = 'Already logged in';
    }

    // 409 username in use
    else if (response.status === 409) {
      registerUpdateData.authFailReason = 'username';
      registerUpdateData.authReason = 'Username already taken'
    }

    else {
      // Unexpected Error
      registerUpdateData.authReason = response.statusText;
    }

    return registerUpdateData;

  } catch(err) {
    console.log(err.message);
    return null;
  }
}


export async function loginUser(username, password) {
  const credentials = {username: username, password: password}
  try {
    const response = await fetch(API_URL + '/login', {
      method: 'POST',
      'credentials': 'include',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
      }
    );

    
    const registerUpdateData = {
      authorized: false,
      authorizedUsername: username,
      authFailReason: null,
      authUser: null
    }

    if (response.ok) {
      const newUser = await response.json();
      registerUpdateData.authorized = true;
      registerUpdateData.authUser = newUser;
      
    }
  
    else {
      // Unexpected Error
      if (response.status !== 401) {
        console.log("Recieved error while trying to register user: " + response.status + " " + response.statusText);
      }
      registerUpdateData.authFailReason = 'Failed to validate credentials';
    }

    return registerUpdateData;

  } catch(err) {
    console.log(err.message);
    return null;
  }
}


export async function loginUserOnStartup() {
  try {
    const response = await fetch(API_URL + '/autologin', {
      method: 'GET',
      'credentials': 'include'
      }
    );

    if (response.ok) {
      const loggedInUser = await response.json();
      return loggedInUser;
    }

    // Logged out
    else if (response.status === 412) {
      const output = await response.json();
      console.log(response.status + " " + response.statusText + ": Recieved error while trying to register user. " + output);
    }

    else if (response.status === 401) {
      console.log("Unauthorized login");
    }
    
    // Unexpected Error
    else {
      console.log("Recieved error while trying to register user: " + response.status + " " + response.statusText);
    }

  } catch(err) {
    console.log(err.message);
  }

  return null;
}


export async function addNewCategory(user_guid, category_title, category_unit, category_verb) {
  
  const body = {
    user_guid: user_guid,
    category_title: category_title,
    category_unit: category_unit,
    category_verb: category_verb
  }
  
  try {
    const response = await fetch(
      API_URL + '/category?' + new URLSearchParams({user_guid: user_guid}), {
      method: 'POST',
      'credentials': 'include',
      headers: {
        'Accept': 'appplication/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
      }
    );

    
    if (response.ok) {
      return await response.json();
    }

    // 401 Generic unauthorized failure message
    if (response.status === 401) {

    }
    
    // Unexpected Error
    else {
      console.log("Recieved error while trying to register user: " + response.status + " " + response.statusText);
    }

    return null;

  } catch(err) {
    console.log(err.message);
    return null;
  }
}