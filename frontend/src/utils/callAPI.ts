const API_URL = "https://us-central1-l17-tune-tracer.cloudfunctions.net/";

/**
 * A util function to make API calls easier; use this to call any API function
 * @param apiFunction the name of the api function that you are calling | e.g. logInUser
 * @param inputData the data that you need to send to the api; should contain all the required fields
 * @returns a promise containing the response status, message, and optional data from the API
 */
export async function callAPI(
  apiFunction: string,
  inputData: JSON | Record<string, unknown>
): Promise<{ 
  status: number; 
  message: string 
  data?: unknown | undefined; 
}> {
  const inputCheck = validateInput(inputData);
  if(inputCheck) {
    console.error(`Invalid input: ${inputCheck.message} to callAPI`);
    return inputCheck;
  }
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputData),
  };

  const url = `${API_URL}${apiFunction}`;
  const response = await fetch(url, requestOptions).catch((error) => {
    console.error(
      `Something went wrong with the API call. Error: ${error.message}`
    );
    throw new Error(
      `Something went wrong with the API call. Error: ${error.message}`
    );
  });

  const responseJSON = await response.json();
  const data = (responseJSON)["data"];
  const message = (responseJSON)["message"];
  return { status: response.status, message: message, data: data };
}

function validateInput(inputData: JSON|Record<string, unknown>): { 
  status: number; 
  message: string 
  data?: unknown | undefined; 
} | undefined {
  const input = JSON.parse(JSON.stringify(inputData));
  if(input['userId'] && typeof input['userId'] !== 'string') {
    return {
      status: 400,
      message: "userId must be a string"
    }
  } else if(input['writerId'] && typeof input['writerId'] !== 'string') {
    return {
      status: 400,
      message: "writerId must be a string"
    }
  } else if(input['documentId'] && typeof input['documentId'] !== 'string') {
    return {
      status: 400,
      message: "documentId must be a string"
    }
  }

  return undefined;
}