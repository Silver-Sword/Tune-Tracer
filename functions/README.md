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
