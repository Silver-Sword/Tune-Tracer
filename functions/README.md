# HOW TO USE API
# basic set up
const app = initializeApp({
  projectId: '### CLOUD FUNCTIONS PROJECT ID ###',
  apiKey: '### FIREBASE API KEY ###',
  authDomain: '### FIREBASE AUTH DOMAIN ###',
});
const functions = getFunctions(app);

import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const addMessage = httpsCallable(functions, 'wantedAPI');

# I have not tested this out yet 

Current urls: 
https://us-central1-l17-tune-tracer.cloudfunctions.net/logInUser
https://us-central1-l17-tune-tracer.cloudfunctions.net/signUpUser