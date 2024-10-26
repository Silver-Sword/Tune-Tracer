import { getCookie, setCookie, deleteCookie } from "cookies-next";

export function saveUserID( userID: string ) {
    // Sets userID as a cookie for 7 days before it expires
    setCookie('userID', userID, { maxAge: 7 * 24 * 60 * 60, sameSite: 'strict' });
}

export function getUserID() {
    return getCookie('userID');
}

export function clearUserID() {
    // Deletes the userID cookie. Useful for log out
    deleteCookie('userID', { sameSite: 'strict' });
}