import { isEmpty } from "./utilities";

const PROTOCOL = window.location.protocol;
const HOST = window.location.hostname;
const API_URL = `${PROTOCOL}//${HOST}/api`

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