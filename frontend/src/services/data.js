import { isEmpty } from "../utilities";


export async function getInitialData(loadedData, setLoadedData) {
  

  if (!isEmpty(loadedData)) {
    return;
  } 
  
  try {
    const response = await fetch('http://localhost:8000/items');

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
    const response = await fetch('http://localhost:8000/reorder', {
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