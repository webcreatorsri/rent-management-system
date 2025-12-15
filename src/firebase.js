// src/firebase.js - COMPLETE FILE
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyCKZN4VPrbcvPpSaYZC2lulqrL-16yO0jc",
  authDomain: "rentmanagementsystem-7dbd6.firebaseapp.com",
  projectId: "rentmanagementsystem-7dbd6",
  storageBucket: "rentmanagementsystem-7dbd6.firebasestorage.app",
  messagingSenderId: "998773754292",
  appId: "1:998773754292:web:4858dfe48d17251822cae1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Test connection
console.log("Firebase initialized with project:", firebaseConfig.projectId);

export default app;