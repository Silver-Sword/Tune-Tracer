const API_URL = "https://us-central1-l17-tune-tracer.cloudfunctions.net/";

/**
 * A util function to make API calls easier; use this to call any API function
 * @param apiFunction the name of the api function that you are calling | e.g. logInUser
 * @param inputData the data that you need to send to the api; should contain all the required fields
 * @returns a promise containing the response status and data from the API
 */
export async function callAPI(
  apiFunction: string,
  inputData: JSON | Record<string, unknown>
): Promise<{ status: number; data: unknown }> {
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
  const data = (await response.json())["data"];
  return { status: response.status, data: data };
}
