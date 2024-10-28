import { getCookie, setCookie, deleteCookie } from "cookies-next";

export function saveUserID( userID: string ) {
    // Sets userID as a cookie for 7 days before it expires
    setCookie('userID', userID, { maxAge: 7 * 24 * 60 * 60, sameSite: 'strict' });
}

export function saveDisplayName( displayName: string ) {
    // Sets the user's display name as a cookie
    setCookie('displayName', displayName, { maxAge: 7 * 24 * 60 * 60, sameSite: 'strict' })
}

export function saveEmail( email: string ) {
    setCookie('email', email, { maxAge: 7 * 24 * 60 * 60, sameSite: 'strict' });
}

export function saveDocID( documentID: string )
{
    setCookie('documentId', documentID, { maxAge: 7 * 24 * 60 * 60, sameSite: 'strict' });
}

export function getUserID() {
    const id = getCookie('userID');
    if (id) { return id.valueOf(); }
    return '-1';
}

export function getDisplayName() {
    const name = getCookie('displayName');
    if (name) { return name.valueOf(); }
    return 'User';
}

export function getEmail() {
    const email = getCookie('email');
    if (email) { return email.valueOf(); }
    return 'email@email.com';
}

export function getDocumentID() {
    const docID = getCookie('documentId');
    if (docID) { return docID.valueOf(); }
    return '-1';
}

export function clearUserID() {
    // Deletes the userID cookie. Useful for log out
    deleteCookie('userID', { sameSite: 'strict' });
}

// Delete all user cookies
export function clearUserCookies() {
    clearUserID();
    deleteDisplayName();
    deleteEmail();
}

export function deleteDisplayName() {
    deleteCookie('displayName', { sameSite: 'strict' });
}

export function deleteEmail() {
    deleteCookie('email', { sameSite: 'strict' });
}