export enum StatusCode {
    OK = 200,
    MISSING_ARGUMENTS = 400,        // the POST request is missing required arguments
    USER_NOT_FOUND = 410,           // the user was not found in the database
    GENERAL_ERROR = 500,
}