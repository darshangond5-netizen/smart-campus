
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-Th7oqRvwr6hR1R9tMsfmndb2PHsplQk",
  authDomain: "campusclass-4ab41.firebaseapp.com",
  projectId: "campusclass-4ab41",
  storageBucket: "campusclass-4ab41.firebasestorage.app",
  messagingSenderId: "509158070942",
  appId: "1:509158070942:web:c8eb7963661176ab24db98f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
