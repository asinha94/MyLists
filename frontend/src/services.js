import { isEmpty } from "./utilities";

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


export async function getInitialData(loadedData, setLoadedData) {
  

  if (!isEmpty(loadedData)) {
    return;
  } 
  
  try {
    const response = await fetch(API_URL + '/items');

    if (!response.ok) {
      console.log("Got error: " + response.statusText);
      return;
    }

    const responseData = await response.json();
    setLoadedData(responseData);

  } catch(err) {
    console.log(err.message);
    return;
  }
};


export async function sendReorderedItem(changeDelta) {

  try {
    const response = await fetch(API_URL + '/reorder', {
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


export async function sendNewItem(changeDelta) {

  try {
    const response = await fetch(API_URL + '/item', {
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


export async function sendUpdatedItem(item) {

  try {
    const response = await fetch(API_URL + '/item', {
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


export async function deleteItem(item) {

  try {
    const response = await fetch(API_URL + '/item', {
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
    }

    if (response.ok) {
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
      console.log("Recieved error while trying to register user: " + response.status + " " + response.statusText);
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
    }

    if (response.ok) {
      registerUpdateData.authorized = true;
    }
    
    // 401 Generic unauthorized failure message
    else if (response.status === 401) {
      
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