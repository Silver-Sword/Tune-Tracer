/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

"use strict";

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to setup triggers and logging.
const {onRequest} = require("firebase-functions/v2/https");
const {onValueCreated} = require("firebase-functions/v2/database");
const functions = require('firebase-functions');
const {logger} = require("firebase-functions");
const { signUpAPI, login } = require('./backend/src/endpoints/loginEndpoints');
const { signUpAPI, login } = require('./backend/src/endpoints/loginEndpoints');
// const (signUpAPI) = require("./backend/src/endpoints/loginEndpoints")
// import { signUpAPI } from './backend/src/endpoints/loginEndpoints';

// The Firebase Admin SDK to access the Firebase Realtime Database.
// const admin = require("firebase-admin");
// admin.initializeApp();
// [END import]

exports.signUpUser = functions.https.onRequest(async (request, response) => {
    try {
        // Parse user input from the request body
        const { email, password, displayName } = request.body;
    
        // Call the signUpAPI and await the result
        const apiResult = await signUpAPI(email, password, displayName);
    
        // Send a successful response back
        response.status(200).send({ message: 'User signed up successfully', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to sign up user' });
      }
  });

exports.logInUser = functions.https.onRequest(async (request, response) => {
    try {
        // Parse user input from the request body
        const { email, password } = request.body;
    
        // Call the signUpAPI and await the result
        const apiResult = await login(email, password);
    
        // Send a successful response back
        response.status(200).send({ message: 'User signed in successfully', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to sign up user' });
      }
});

exports.getAllPreviews = functions.https.onRequest(async (request, response) => {
    try {
        // Parse user input from the request body
        const { email, password } = request.body;
    
        // Call the signUpAPI and await the result
        const apiResult = await login(email, password);
    
        // Send a successful response back
        response.status(200).send({ message: 'User signed in successfully', data: apiResult });
      } catch (error) {
        // Send an error response if something goes wrong
        response.status(500).send({ message: 'Failed to sign up user' });
      }
});

