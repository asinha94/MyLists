import { isEmpty } from "./utilities";

const PROTOCOL = window.location.protocol;
const HOST = window.location.hostname;
const PORT = 80;
const API_URL = `${PROTOCOL}//${HOST}:${PORT}/api`

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