import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId if provided
export const db = initializeFirestore(app, {
  // @ts-ignore
  databaseId: firebaseConfig.firestoreDatabaseId || '(default)'
});
