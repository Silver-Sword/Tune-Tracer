// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBPV_2yOAk8JeB0cJ2OBCdJQTCJyTNWDEg",
  authDomain: "l17-tune-tracer.firebaseapp.com",
  databaseURL: "https://l17-tune-tracer-default-rtdb.firebaseio.com",
  projectId: "l17-tune-tracer",
  storageBucket: "l17-tune-tracer.appspot.com",
  messagingSenderId: "268123826560",
  appId: "1:268123826560:web:a75235657488bf0d727965",
  measurementId: "G-68VYCRF92M"
};

// Initialize Firebase
initializeApp(FIREBASE_CONFIG);
export const DOCUMENT_DATABASE_NAME = "Composition_Documents";
export const USER_DATABASE_NAME = "Users_Collection";