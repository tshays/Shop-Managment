
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMr670lXUlO1Pcy-R_OhIG5rdDFg7H_18",
  authDomain: "ethiomerkato.firebaseapp.com",
  projectId: "ethiomerkato",
  storageBucket: "ethiomerkato.firebasestorage.app",
  messagingSenderId: "940215240811",
  appId: "1:940215240811:web:0c975b93f0cd35c7dc092e",
  measurementId: "G-9M47TDT90X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
