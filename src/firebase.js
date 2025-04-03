import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import localStorageService from './localStorageService';

const firebaseConfig = {
    apiKey: "AIzaSyBZx8MRm7bU0mg6H9ZEzfX-4e1ghpOTph0",
    authDomain: "notesapp-cd724.firebaseapp.com",
    projectId: "notesapp-cd724",
    storageBucket: "notesapp-cd724.firebasestorage.app",
    messagingSenderId: "390260001817",
    appId: "1:390260001817:web:4997f80aca9b9e35d9ee88",
    measurementId: "G-ELLFS48GEW"
  };

// Initialize Firebase for Firestore only
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the local storage service as 'storage'
export { localStorageService as storage, db };