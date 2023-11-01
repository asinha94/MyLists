import { isEmpty } from "../utilities";


export async function getInitialData(loadedData, setLoadedData) {
  

  if (!isEmpty(loadedData)) {
    return;
  } 
  
  try {
    const response = await fetch(
      `http://localhost:8000/data`
    );

    if (!response.ok) {
      console.log("Got error: " + response);
      return;
    }

    const responseData = await response.json();
    setLoadedData(responseData);

  } catch(err) {
    console.log(err.message);
    return;
  }
};