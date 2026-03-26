import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCauZfZ90Ja498UDviZLQjZnw3j5rCVzHA",
  authDomain: "image-gallery-ea666.firebaseapp.com",
  projectId: "image-gallery-ea666",
  storageBucket: "image-gallery-ea666.firebasestorage.app",
  messagingSenderId: "892428604174",
  appId: "1:892428604174:web:6745061c5527ebbde0bd5f",
  measurementId: "G-QH4006TGBZ",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
