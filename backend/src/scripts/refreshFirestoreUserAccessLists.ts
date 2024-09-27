import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { DocumentMetadata } from '@lib/documentTypes';

import { FIREBASE_CONFIG, DOCUMENT_DATABASE_NAME, USER_DATABASE_NAME } from '../firebaseSecrets'

// Purpose: recomputes the shared and owned documents lists for each user in Firestore
// Note: this script can cause issues if the database is being actively updated
export async function refreshFirestoreUserAccessLists()
{
    firebase.initializeApp(FIREBASE_CONFIG);

    const db = firebase.firestore();
    const batch = db.batch();
    const shared = new Map<string, string[]>();
    const owned = new Map<string, string[]>();

    const updateMap = (userId: string, map: Map<string, string[]>, documentId: string) =>
    {
        if(!map.has(userId))
        {
            map.set(userId, []);
        }

        map.get(userId)?.push(documentId);
    };

    // get all documents
    // compute the lists for all users
    ((await db.collection(DOCUMENT_DATABASE_NAME).get()).docs.forEach((snapshot) => {
        const data = snapshot.data();
        if(data === null || data === undefined)
        {
            console.warn(`Skipping document ${snapshot.id} because data is undefined`);
            return;
        }
        
        if(!('metadata' in data))
        {
            console.warn(`Skipping document ${snapshot.id} because metadata is undefined`);
            return;
        }
        const metadata = data['metadata'] as DocumentMetadata;
        if(!('document_id' in metadata && 'owner_id' in metadata))
        {
            console.warn(`Skipping document ${snapshot.id} because missing required metadata fields`);
            return;
        }
        if(metadata.document_id !== snapshot.id)
        {
            console.log(`Updating document ${snapshot.id} id because recorded metadata id is ${metadata.document_id}`);
            batch.update(snapshot.ref, {'metadata.document_id': snapshot.id});
        }
        const owner = metadata.owner_id;
        let shares: string[] = Object.keys(metadata.share_list);

        updateMap(owner, owned, snapshot.id);
        shares.forEach((userId: string) => updateMap(userId, shared, snapshot.id));
    }));

    const compareLists = (a: string[], b: string[]): boolean =>
    {
        if(a.length !== b.length)
        {
            return false;
        }

        return a.filter((item) => {
            return !b.includes(item);
        }).length === 0;
    };
    // get all users and determine if there lists are different
    ((await db.collection(USER_DATABASE_NAME).get()).docs.forEach((snapshot) => {
        const data = snapshot.data();
        if(data === null || data === undefined)
        {
            console.warn(`Skipping user ${snapshot.id} because data is undefined`);
            return;
        }

        // compare lists
        if(!compareLists(data['owned_documents'], owned.get(snapshot.id) ?? []))
        {
            batch.update(snapshot.ref, {'owned_documents': owned.get(snapshot.id) ?? ([] as string[])});
            console.log(`User ${snapshot.id} owned_documents is being updated to ${(owned.get(snapshot.id) ?? []).join(', ')}`);
        }
        
        if(!compareLists(data['shared_documents'], shared.get(snapshot.id) ?? []))
        {
            batch.update(snapshot.ref, {'shared_documents': shared.get(snapshot.id) ?? ([] as string[])});
            console.log(`User ${snapshot.id} shared_documents is being updated to ${(shared.get(snapshot.id) ?? []).join(', ')}`);
        }
    }));

    // batch write the results
    await batch.commit();

    // wrap up program
    console.log(`Completed refresh.`);
    process.exit(0);
}